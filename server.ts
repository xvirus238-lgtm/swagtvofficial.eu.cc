import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";
import path from "path";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // OWASP: Security Headers
  app.use(helmet({
    contentSecurityPolicy: false // Disable CSP for Vite dev server compatibility
  }));

  // OWASP: Rate Limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests from this IP, please try again after 15 minutes" }
  });

  // Apply rate limiting to all API routes
  app.use("/api/", apiLimiter);

  const corsOptions = {
    origin: process.env.NODE_ENV === "production" ? "https://yourdomain.com" : "*",
  };
  
  app.use(cors(corsOptions));
  app.use(express.json());

  // OWASP: Prevent NoSQL Injection
  app.use(mongoSanitize());

  // MongoDB Connection
  const MONGODB_URI = process.env.MONGODB_URI || "";
  let isMongoConnected = false;

  const mongoMatchSchema = new mongoose.Schema({
    title: { type: String, required: true },
    league: { type: String, required: true },
    thumbnail: { type: String, required: true },
    streamUrl: { type: String, required: true },
    isLive: { type: Boolean, default: false },
  });

  const mongoUserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  });

  let Match: any;
  let User: any;

  // In-memory fallback data
  let fallbackMatches: any[] = [];
  let fallbackUsers: any[] = [];

  if (MONGODB_URI.startsWith("mongodb")) {
    mongoose.connect(MONGODB_URI)
      .then(() => {
        console.log("Connected to MongoDB.");
        isMongoConnected = true;
      })
      .catch((err) => {
        console.error("MongoDB connection error. Falling back to in-memory storage. Error details:", err.message);
      });

    Match = mongoose.model("Match", mongoMatchSchema);
    User = mongoose.model("User", mongoUserSchema);
  } else {
    console.log("No valid MONGODB_URI provided. Using in-memory storage fallback. Add a MongoDB Atlas URI in Settings to persist data.");
    
    // In-memory mock models
    Match = function(data: any) {
      this._id = Math.random().toString(36).substring(7);
      Object.assign(this, data);
      this.save = async () => {
        fallbackMatches.push(this);
        return this;
      };
    } as any;
    Match.find = async () => fallbackMatches;
    Match.findById = async (id: string) => fallbackMatches.find(m => m._id === id);

    User = function(data: any) {
      this._id = Math.random().toString(36).substring(7);
      Object.assign(this, data);
      this.save = async () => {
        fallbackUsers.push(this);
        return this;
      };
    } as any;
    User.findOne = async (query: any) => fallbackUsers.find(u => u.username === query.username);
  }

  // JWT Secret
  const JWT_SECRET = process.env.JWT_SECRET || "your-strong-secret-key-here";

  // Login Endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // OWASP: Input Validation
      if (!username || typeof username !== 'string' || username.trim() === '') {
         return res.status(400).json({ error: "Invalid username" });
      }
      if (!password || typeof password !== 'string' || password.trim() === '') {
         return res.status(400).json({ error: "Invalid password" });
      }

      const user = await User.findOne({ username: username.trim() });
      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
      res.json({ token });
    } catch (err: any) {
      res.status(500).json({ error: "An internal server error occurred" }); // Don't expose err.message directly in production
    }
  });

  // Get All Matches
  app.get("/api/matches", async (req, res) => {
    try {
      const matches = await Match.find();
      res.json(matches);
    } catch (err: any) {
      res.status(500).json({ error: "An internal server error occurred" });
    }
  });

  // Stream Endpoint (HLS)
  app.get("/api/stream/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // OWASP: Parameter validation
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: "Invalid match ID" });
      }

      const match = await Match.findById(id);
      if (!match) return res.status(404).json({ error: "Match not found" });

      res.json({
        url: match.streamUrl,
        isLive: match.isLive,
      });
    } catch (err: any) {
      res.status(500).json({ error: "An internal server error occurred" });
    }
  });

  // Admin: Add a new match
  app.post("/api/matches", async (req, res) => {
    try {
      const { title, league, thumbnail, streamUrl, isLive } = req.body;

      // OWASP: Input Validation
      if (!title || typeof title !== 'string' || title.trim() === '') return res.status(400).json({ error: "Invalid title" });
      if (!league || typeof league !== 'string' || league.trim() === '') return res.status(400).json({ error: "Invalid league" });
      if (!thumbnail || typeof thumbnail !== 'string' || !thumbnail.startsWith('http')) return res.status(400).json({ error: "Invalid thumbnail URL" });
      if (!streamUrl || typeof streamUrl !== 'string' || !streamUrl.startsWith('http')) return res.status(400).json({ error: "Invalid stream URL" });
      if (typeof isLive !== 'boolean') return res.status(400).json({ error: "isLive must be a boolean" });

      const match = new Match({ title, league, thumbnail, streamUrl, isLive });
      await match.save();
      res.json(match);
    } catch (err: any) {
      res.status(500).json({ error: "An internal server error occurred" });
    }
  });

  // Sofascore Proxy
  app.get("/api/sofascore/*", async (req, res) => {
    try {
      const targetPath = req.params[0];
      const url = `https://api.sofascore.com/api/v1/${targetPath}`;
      console.log("Proxying to:", url);

      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "*/*",
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "en-US,en;q=0.9",
          "Origin": "https://www.sofascore.com",
          "Referer": "https://www.sofascore.com/",
          "Cache-Control": "max-age=0",
          "Connection": "keep-alive"
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          // Cloudflare protection blocked us.
          // Gracefully return mock structures so the frontend doesn't crash with 500.
          if (targetPath.includes('statistics')) {
             return res.json({ statistics: [] });
          } else if (targetPath.includes('incidents')) {
             return res.json({ incidents: [] });
          } else if (targetPath.includes('standing')) {
             return res.json({ standings: [] });
          } else if (targetPath.includes('event/')) {
             return res.json({ event: {} });
          } else {
             return res.json({ events: [] });
          }
        }
        throw new Error(`Sofascore API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      console.error("Proxy error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
