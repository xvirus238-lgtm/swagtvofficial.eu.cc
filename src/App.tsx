import DOMPurify from 'dompurify';
import React, { useState, useEffect, useRef } from "react";
import {
  getLiveFixtures,
  getFixturesByDate,
  getFixtureDetails,
} from "./services/sportmonks";

export default function App() {
  const [activeTab, setActiveTab] = useState("all");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);

  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
  const [matchDetails, setMatchDetails] = useState<any | null>(null);

  const channels = [
    { name: "BeIN 1", url: "https://1.soccertvhd.live/splayer/Live1.php" },
    { name: "BeIN 2", url: "https://1.soccertvhd.live/splayer/Live2.php" },
    { name: "BeIN 3", url: "https://1.soccertvhd.live/splayer/Live4.php" },
    { name: "BeIN 5", url: "https://1.soccertvhd.live/splayer/Live5.php" },
    { name: "Starplayz", url: "https://1.soccertvhd.live/splayer/Live3.php" },
  ];
  const [selectedChannel, setSelectedChannel] = useState(channels[0]);

  // Fetch real data
  useEffect(() => {
    async function loadData() {
      const today = new Date().toISOString().split("T")[0];
      const tomorrow = new Date(Date.now() + 86400000)
        .toISOString()
        .split("T")[0];

      const liveData = await getLiveFixtures();
      // If no live matches, optionally get today's matches to show something
      if (liveData.length === 0) {
        const todayM = await getFixturesByDate(today);
        setLiveMatches(todayM.slice(0, 8)); // Mock 'live' with today's matches for demo
      } else {
        setLiveMatches(liveData);
      }

      const upcomingData = await getFixturesByDate(tomorrow);
      setUpcomingMatches(upcomingData.slice(0, 10)); // Top 10 upcoming matches
    }
    loadData();
  }, []);

  const openMatchModal = async (match: any) => {
    setSelectedMatch(match);
    const details = await getFixtureDetails(match.id);
    setMatchDetails(details);
  };

  const closeMatchModal = () => {
    setSelectedMatch(null);
    setMatchDetails(null);
  };

  // Scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1 },
    );

    document
      .querySelectorAll(".scroll-fade")
      .forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [activeTab, liveMatches, upcomingMatches]);

  const dynamicLeagues: string[] = Array.from(
    new Set(liveMatches.map((m: any) => m.league?.name).filter(Boolean)),
  ) as string[];

  const popularLeagues = ['La Liga', 'Premier League', 'Serie A', 'Champions League', 'Ligue 1'];
  const allLeagues = Array.from(new Set([...popularLeagues, ...dynamicLeagues]));

  const filteredMatches =
    activeTab === "all"
      ? liveMatches
      : liveMatches.filter((m) => m.league?.name === activeTab);

  const tabs = [
    { id: "all", label: "All Leagues" },
    ...allLeagues.slice(0, 8).map((l) => ({ id: l, label: l })),
  ];

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string,
  ) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  const featuredMatch = liveMatches[0] || upcomingMatches[0];
  const featuredHome = featuredMatch?.participants?.find(
    (p: any) => p.meta?.location === "home",
  );
  const featuredAway = featuredMatch?.participants?.find(
    (p: any) => p.meta?.location === "away",
  );
  const featuredHomeScore =
    featuredMatch?.scores?.find(
      (s: any) =>
        s.description === "CURRENT" && s.score?.participant === "home",
    )?.score?.goals ?? "-";
  const featuredAwayScore =
    featuredMatch?.scores?.find(
      (s: any) =>
        s.description === "CURRENT" && s.score?.participant === "away",
    )?.score?.goals ?? "-";

  return (
    <div className="gradient-bg min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-blur border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight">
                Swag<span className="text-indigo-400">Tv</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                Official
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a
                href="#home"
                onClick={(e) => handleSmoothScroll(e, "home")}
                className="text-sm font-medium text-slate-400 hover:text-white transition"
              >
                Home
              </a>
              <a
                href="#live"
                onClick={(e) => handleSmoothScroll(e, "live")}
                className="text-sm font-medium text-slate-400 hover:text-white transition flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 live-pulse"></span>{" "}
                Live
              </a>
              <a
                href="#upcoming"
                onClick={(e) => handleSmoothScroll(e, "upcoming")}
                className="text-sm font-medium text-slate-400 hover:text-white transition"
              >
                Upcoming
              </a>
              <a
                href="#leagues"
                onClick={(e) => handleSmoothScroll(e, "leagues")}
                className="text-sm font-medium text-slate-400 hover:text-white transition"
              >
                Leagues
              </a>
              <a
                href="#highlights"
                onClick={(e) => handleSmoothScroll(e, "highlights")}
                className="text-sm font-medium text-slate-400 hover:text-white transition"
              >
                Highlights
              </a>
            </div>

            <div className="flex items-center gap-3">
              <button className="hidden sm:block text-sm font-medium hover:text-white transition">
                Sign In
              </button>
              <button className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-sm font-semibold border border-slate-700 transition-all">
                Subscribe
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800/50 bg-slate-950/95">
            <div className="px-4 py-3 space-y-2">
              <a
                href="#home"
                onClick={(e) => handleSmoothScroll(e, "home")}
                className="block py-2 text-sm"
              >
                Home
              </a>
              <a
                href="#live"
                onClick={(e) => handleSmoothScroll(e, "live")}
                className="block py-2 text-sm"
              >
                Live
              </a>
              <a
                href="#upcoming"
                onClick={(e) => handleSmoothScroll(e, "upcoming")}
                className="block py-2 text-sm"
              >
                Upcoming
              </a>
              <a
                href="#leagues"
                onClick={(e) => handleSmoothScroll(e, "leagues")}
                className="block py-2 text-sm"
              >
                Leagues
              </a>
              <a
                href="#highlights"
                onClick={(e) => handleSmoothScroll(e, "highlights")}
                className="block py-2 text-sm"
              >
                Highlights
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="hero-gradient pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
                <span className="w-2 h-2 rounded-full bg-indigo-500 live-pulse"></span>
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  12 Matches Live Now
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.95] mb-6">
                Watch Football <br />
                <span className="hero-title">Like Never Before</span>
              </h1>

              <p className="text-lg text-slate-400 mb-8 max-w-xl">
                Stream every match in stunning HD quality. Premier League, La
                Liga, Champions League and more — all in one place.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => featuredMatch && openMatchModal(featuredMatch)}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-2xl shadow-indigo-500/30 transition-transform active:scale-95 flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch Live
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById("upcoming")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded-xl font-bold border border-slate-700/50"
                >
                  View Schedule
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-12 max-w-md">
                <div>
                  <div className="text-3xl font-bold text-indigo-400">500+</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">
                    Live Matches
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-400">4K</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">
                    Ultra HD
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-400">2M+</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">
                    Active Fans
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Match Card */}
            <div className="relative float-anim">
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px]"></div>
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-600/20 rounded-full blur-[100px]"></div>

              {featuredMatch ? (
                <div className="glass rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-6 relative">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 live-pulse"></span>
                      <span className="text-xs font-bold text-red-400 uppercase">
                        Live Now
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {featuredMatch.league?.name || "Top League"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-6 relative">
                    <div className="text-center flex-1">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-2xl font-black text-white mb-3 shadow-lg overflow-hidden">
                        {featuredHome?.image_path ? (
                          <img
                            src={featuredHome.image_path}
                            alt={featuredHome.name}
                            className="w-12 h-12 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          featuredHome?.short_code || "H"
                        )}
                      </div>
                      <div className="font-bold text-sm sm:text-base text-white">
                        {featuredHome?.name || "-"}
                      </div>
                    </div>

                    <div className="text-center px-4">
                      <div className="text-3xl sm:text-4xl font-black mb-1 text-white">
                        {featuredHomeScore} - {featuredAwayScore}
                      </div>
                      <div className="text-xs text-indigo-400 font-semibold">
                        {featuredMatch?.state?.name || "FT"}
                      </div>
                    </div>

                    <div className="text-center flex-1">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-2xl font-black text-white mb-3 shadow-lg overflow-hidden">
                        {featuredAway?.image_path ? (
                          <img
                            src={featuredAway.image_path}
                            alt={featuredAway.name}
                            className="w-12 h-12 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          featuredAway?.short_code || "A"
                        )}
                      </div>
                      <div className="font-bold text-sm sm:text-base text-white">
                        {featuredAway?.name || "-"}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => openMatchModal(featuredMatch)}
                    className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-2xl shadow-indigo-500/30 transition-transform active:scale-95"
                  >
                    ▶ Watch This Match
                  </button>

                  <div className="grid grid-cols-3 gap-3 mt-5">
                    <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700/50">
                      <div className="text-xs text-slate-400">Possession</div>
                      <div className="text-sm font-bold text-slate-200">
                        58%
                      </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700/50">
                      <div className="text-xs text-slate-400">Shots</div>
                      <div className="text-sm font-bold text-slate-200">14</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-2 text-center border border-slate-700/50">
                      <div className="text-xs text-slate-400">Corners</div>
                      <div className="text-sm font-bold text-slate-200">7</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass rounded-3xl p-12 text-center text-slate-400">
                  Loading latest matches...
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* League Marquee */}
      <section className="py-8 border-y border-slate-800/50 bg-slate-950/50 overflow-hidden">
        <div className="flex marquee whitespace-nowrap">
          <div className="flex items-center gap-12 px-6">
            <span className="text-2xl font-black text-slate-600 league-logo">
              PREMIER LEAGUE
            </span>
            <span className="text-indigo-600">●</span>
            <span className="text-2xl font-black text-slate-600 league-logo">
              LA LIGA
            </span>
            <span className="text-indigo-600">●</span>
            <span className="text-2xl font-black text-slate-600 league-logo">
              SERIE A
            </span>
            <span className="text-indigo-600">●</span>
            <span className="text-2xl font-black text-slate-600 league-logo">
              BUNDESLIGA
            </span>
            <span className="text-indigo-600">●</span>
            <span className="text-2xl font-black text-slate-600 league-logo">
              LIGUE 1
            </span>
            <span className="text-indigo-600">●</span>
            <span className="text-2xl font-black text-slate-600 league-logo">
              CHAMPIONS LEAGUE
            </span>
            <span className="text-indigo-600">●</span>
            <span className="text-2xl font-black text-slate-600 league-logo">
              EUROPA LEAGUE
            </span>
            <span className="text-indigo-600">●</span>
            <span className="text-2xl font-black text-slate-600 league-logo">
              WORLD CUP
            </span>
            <span className="text-indigo-600">●</span>
          </div>
          <div className="flex items-center gap-12 px-6">
            <span className="text-2xl font-black text-slate-600 league-logo">
              PREMIER LEAGUE
            </span>
            <span className="text-indigo-600">●</span>
            <span className="text-2xl font-black text-slate-600 league-logo">
              LA LIGA
            </span>
            <span className="text-indigo-600">●</span>
            <span className="text-2xl font-black text-slate-600 league-logo">
              SERIE A
            </span>
            <span className="text-indigo-600">●</span>
            <span className="text-2xl font-black text-slate-600 league-logo">
              BUNDESLIGA
            </span>
            <span className="text-indigo-600">●</span>
            <span className="text-2xl font-black text-slate-600 league-logo">
              LIGUE 1
            </span>
            <span className="text-indigo-600">●</span>
            <span className="text-2xl font-black text-slate-600 league-logo">
              CHAMPIONS LEAGUE
            </span>
            <span className="text-indigo-600">●</span>
            <span className="text-2xl font-black text-slate-600 league-logo">
              EUROPA LEAGUE
            </span>
            <span className="text-indigo-600">●</span>
            <span className="text-2xl font-black text-slate-600 league-logo">
              WORLD CUP
            </span>
            <span className="text-indigo-600">●</span>
          </div>
        </div>
      </section>

      {/* Live Now Section */}
      <section id="live" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10 scroll-fade">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-red-500 live-pulse"></span>
                <span className="text-xs font-bold text-red-400 uppercase tracking-widest">
                  Live Now
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                Streaming Right Now
              </h2>
            </div>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-sm text-indigo-400 hover:text-indigo-300 hidden sm:block transition-colors"
            >
              View All →
            </a>
          </div>

          {/* Tab Filter */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scroll-fade">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${activeTab === tab.id ? "tab-active border border-indigo-500" : "bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-slate-300"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-400 border border-slate-800/50 rounded-2xl bg-slate-900/50">
                No matches found.
              </div>
            ) : (
              filteredMatches.map((match) => {
                const home = match.participants?.find(
                  (p: any) => p.meta?.location === "home",
                );
                const away = match.participants?.find(
                  (p: any) => p.meta?.location === "away",
                );
                const homeScore =
                  match.scores?.find(
                    (s: any) =>
                      s.description === "CURRENT" &&
                      s.score?.participant === "home",
                  )?.score?.goals || 0;
                const awayScore =
                  match.scores?.find(
                    (s: any) =>
                      s.description === "CURRENT" &&
                      s.score?.participant === "away",
                  )?.score?.goals || 0;

                return (
                  <div
                    key={match.id}
                    onClick={() => openMatchModal(match)}
                    className="card-hover glass rounded-3xl overflow-hidden cursor-pointer group"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-950 overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-around p-6">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center font-black text-lg text-white shadow-2xl overflow-hidden">
                            {home?.image_path ? (
                              <img
                                src={home.image_path}
                                alt={home.name}
                                className="w-10 h-10 object-contain"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              home?.short_code || "H"
                            )}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-black text-white">
                            {homeScore} - {awayScore}
                          </div>
                          <div className="text-xs text-indigo-400 font-bold">
                            {match.state?.name || "FT"}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center font-black text-lg text-white shadow-2xl overflow-hidden">
                            {away?.image_path ? (
                              <img
                                src={away.image_path}
                                alt={away.name}
                                className="w-10 h-10 object-contain"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              away?.short_code || "A"
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-red-500/90 backdrop-blur rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-white live-pulse"></span>
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                          {match.state?.state === "FT" ? "Finished" : "Live"}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 px-2.5 py-1 bg-slate-950/60 backdrop-blur rounded-full text-[10px] font-semibold flex items-center gap-1 text-slate-200">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                        </svg>
                        {(Math.random() * 200 + 10).toFixed(0)}K
                      </div>
                      <div className="play-btn-overlay absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/40 transform transition-transform group-hover:scale-110">
                          <svg
                            className="w-7 h-7 text-white ml-1"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider truncate max-w-[80%]">
                          {match.league?.name || "League"}
                        </span>
                        <span className="text-xs text-slate-400 border border-slate-700/50 px-2 py-0.5 rounded">
                          HD
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-white truncate">
                        {match.name}
                      </h3>
                      <button className="mt-4 w-full py-2.5 bg-slate-800/50 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-700/50 hover:border-indigo-500/50 rounded-xl text-sm font-semibold transition-all">
                        Watch Live →
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Upcoming Matches */}
      <section
        id="upcoming"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950/40 relative"
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-800/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10 scroll-fade">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                Schedule
              </span>
              <h2 className="text-3xl sm:text-4xl font-black mt-1 text-white">
                Upcoming Matches
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            {upcomingMatches.map((m, idx) => {
              const home = m.participants?.find(
                (p: any) => p.meta?.location === "home",
              );
              const away = m.participants?.find(
                (p: any) => p.meta?.location === "away",
              );
              const dateObj = new Date(m.starting_at);
              const time = dateObj.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              const dateStr = dateObj.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={idx}
                  className="glass rounded-2xl p-4 sm:p-5 flex items-center gap-4 hover:bg-slate-800/80 transition cursor-pointer group border-slate-800/80"
                >
                  <div className="text-center min-w-[70px]">
                    <div className="text-xs text-indigo-400 font-semibold uppercase">
                      {dateStr}
                    </div>
                    <div className="text-xl font-bold text-white">{time}</div>
                  </div>
                  <div className="hidden sm:block w-px h-12 bg-slate-800"></div>
                  <div className="flex-1 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-white overflow-hidden">
                        {home?.image_path ? (
                          <img
                            src={home.image_path}
                            alt={home.name}
                            className="w-6 h-6 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          home?.short_code || "H"
                        )}
                      </div>
                      <span className="font-semibold text-sm sm:text-base text-slate-200">
                        {home?.name}
                      </span>
                    </div>
                    <span className="text-slate-500 text-sm font-bold">VS</span>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-sm sm:text-base text-slate-200">
                        {away?.name}
                      </span>
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-white overflow-hidden">
                        {away?.image_path ? (
                          <img
                            src={away.image_path}
                            alt={away.name}
                            className="w-6 h-6 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          away?.short_code || "A"
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-3 text-xs text-slate-400 min-w-[120px] justify-end line-clamp-1">
                    {m.league?.name || "League"}
                  </div>
                  <button className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 group-hover:bg-indigo-600 group-hover:border-indigo-500/50 text-slate-300 group-hover:text-white rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap">
                    🔔 Remind
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Leagues Grid */}
      <section id="leagues" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 scroll-fade">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              Top Competitions
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-2 text-white">
              Browse by League
            </h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">
              Choose from the world's most prestigious football competitions
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 scroll-fade">
            <div className="card-hover glass rounded-3xl p-6 cursor-pointer group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-2xl font-black mb-4 text-white shadow-lg">
                PL
              </div>
              <h3 className="font-bold mb-1 text-slate-200">Premier League</h3>
              <p className="text-xs text-slate-400">38 matches this week</p>
            </div>
            <div className="card-hover glass rounded-3xl p-6 cursor-pointer group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center text-2xl font-black mb-4 text-white shadow-lg">
                LL
              </div>
              <h3 className="font-bold mb-1 text-slate-200">La Liga</h3>
              <p className="text-xs text-slate-400">20 matches this week</p>
            </div>
            <div className="card-hover glass rounded-3xl p-6 cursor-pointer group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-2xl font-black mb-4 text-white shadow-lg">
                SA
              </div>
              <h3 className="font-bold mb-1 text-slate-200">Serie A</h3>
              <p className="text-xs text-slate-400">18 matches this week</p>
            </div>
            <div className="card-hover glass rounded-3xl p-6 cursor-pointer group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-slate-950 flex items-center justify-center text-2xl font-black mb-4 text-white shadow-lg">
                BL
              </div>
              <h3 className="font-bold mb-1 text-slate-200">Bundesliga</h3>
              <p className="text-xs text-slate-400">14 matches this week</p>
            </div>
            <div className="card-hover glass rounded-3xl p-6 cursor-pointer group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-red-500 flex items-center justify-center text-2xl font-black mb-4 text-white shadow-lg">
                L1
              </div>
              <h3 className="font-bold mb-1 text-slate-200">Ligue 1</h3>
              <p className="text-xs text-slate-400">16 matches this week</p>
            </div>
            <div className="card-hover glass rounded-3xl p-6 cursor-pointer group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-2xl font-black mb-4 text-white shadow-lg">
                CL
              </div>
              <h3 className="font-bold mb-1 text-slate-200">
                Champions League
              </h3>
              <p className="text-xs text-slate-400">8 matches this week</p>
            </div>
            <div className="card-hover glass rounded-3xl p-6 cursor-pointer group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-2xl font-black mb-4 text-white shadow-lg">
                EL
              </div>
              <h3 className="font-bold mb-1 text-slate-200">Europa League</h3>
              <p className="text-xs text-slate-400">12 matches this week</p>
            </div>
            <div className="card-hover glass rounded-3xl p-6 cursor-pointer group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-2xl font-black mb-4 text-white shadow-lg">
                WC
              </div>
              <h3 className="font-bold mb-1 text-slate-200">World Cup</h3>
              <p className="text-xs text-slate-400">Qualifiers ongoing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="highlights"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950/40 relative"
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-800/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14 scroll-fade">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              Why SwagTv
            </span>
            <h2 className="text-3xl sm:text-5xl font-black mt-2 text-white">
              The Ultimate Streaming Experience
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass rounded-3xl p-8 card-hover scroll-fade">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
                <svg
                  className="w-6 h-6 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-200">
                4K Ultra HD Streaming
              </h3>
              <p className="text-slate-400 text-sm">
                Crystal clear resolution with adaptive bitrate. Never miss a
                single detail of the action.
              </p>
            </div>
            <div className="glass rounded-3xl p-8 card-hover scroll-fade">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
                <svg
                  className="w-6 h-6 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-200">
                Zero Buffering
              </h3>
              <p className="text-slate-400 text-sm">
                Powered by Mux HLS technology with global CDN for instant
                playback anywhere.
              </p>
            </div>
            <div className="glass rounded-3xl p-8 card-hover scroll-fade">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
                <svg
                  className="w-6 h-6 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-200">
                Multi-Device Support
              </h3>
              <p className="text-slate-400 text-sm">
                Watch on mobile, tablet, smart TV, or desktop. Pick up where you
                left off seamlessly.
              </p>
            </div>
            <div className="glass rounded-3xl p-8 card-hover scroll-fade">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
                <svg
                  className="w-6 h-6 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-200">
                Live Stats & Analytics
              </h3>
              <p className="text-slate-400 text-sm">
                Real-time match statistics, formations, and player performance
                data while you watch.
              </p>
            </div>
            <div className="glass rounded-3xl p-8 card-hover scroll-fade">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
                <svg
                  className="w-6 h-6 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-200">
                Live Chat Community
              </h3>
              <p className="text-slate-400 text-sm">
                Connect with millions of fans worldwide. React to goals as they
                happen.
              </p>
            </div>
            <div className="glass rounded-3xl p-8 card-hover scroll-fade">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
                <svg
                  className="w-6 h-6 text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-200">
                DRM Protected
              </h3>
              <p className="text-slate-400 text-sm">
                Premium content secured with industry-standard DRM and
                encryption.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div
            className="relative rounded-[2rem] overflow-hidden p-10 sm:p-16 text-center border border-slate-700/50"
            style={{
              background:
                "linear-gradient(135deg, rgba(79, 70, 229, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)",
              boxShadow: "0 20px 40px -10px rgba(79, 70, 229, 0.2)",
            }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle, white 2px, transparent 2px)",
                backgroundSize: "30px 30px",
              }}
            ></div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-5xl font-black mb-4 text-white">
                Ready to Watch?
              </h2>
              <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto">
                Join over 2 million football fans streaming the world's biggest
                matches in stunning quality.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-2xl shadow-indigo-500/30 transition-transform active:scale-95">
                  Start Free Trial
                </button>
                <button className="px-8 py-4 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/50 font-bold rounded-xl transition-colors">
                  View Plans
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-12 px-4 sm:px-6 lg:px-8 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">
                  Swag<span className="text-indigo-400">Tv</span>
                </span>
              </div>
              <p className="text-sm text-slate-400">
                The ultimate destination for live football streaming.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Watch</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Live Matches
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Upcoming
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Highlights
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Replays
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Press
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    DMCA
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © 2025 SwagTv-Official. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-slate-800/50 border border-slate-700/50 hover:bg-indigo-600 hover:border-indigo-500 hover:text-white text-slate-400 flex items-center justify-center transition-all"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-slate-800/50 border border-slate-700/50 hover:bg-indigo-600 hover:border-indigo-500 hover:text-white text-slate-400 flex items-center justify-center transition-all"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-slate-800/50 border border-slate-700/50 hover:bg-indigo-600 hover:border-indigo-500 hover:text-white text-slate-400 flex items-center justify-center transition-all"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-slate-800/50 border border-slate-700/50 hover:bg-indigo-600 hover:border-indigo-500 hover:text-white text-slate-400 flex items-center justify-center transition-all"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Player Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 z-[100] modal-backdrop flex items-center justify-center p-4">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`w-2 h-2 rounded-full ${selectedMatch.state?.state === "FT" ? "bg-slate-500" : "bg-red-500 live-pulse"}`}
                  ></span>
                  <span
                    className={`text-xs font-bold uppercase ${selectedMatch.state?.state === "FT" ? "text-slate-400" : "text-red-500"}`}
                  >
                    {selectedMatch.state?.name || "Live"}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  {selectedMatch.name}
                </h3>
              </div>
              <button
                onClick={closeMatchModal}
                className="w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center transition border border-slate-700/50"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
              {channels.map((channel) => (
                <button
                  key={channel.name}
                  onClick={() => setSelectedChannel(channel)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                    selectedChannel.name === channel.name
                      ? "bg-indigo-600 text-white border border-indigo-500 shadow-lg shadow-indigo-500/20"
                      : "bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 text-slate-300"
                  }`}
                >
                  📺 {channel.name}
                </button>
              ))}
            </div>

            <div className="video-container rounded-2xl overflow-hidden relative shadow-2xl border border-slate-800 bg-black">
              <iframe
                src={DOMPurify.sanitize(selectedChannel.url, { ALLOWED_URI_REGEXP: /^(https?:)/ })}
                className="w-full aspect-video min-h-[300px] sm:min-h-[450px]"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 mb-4">
              <div className="glass rounded-xl p-3 text-center">
                <div className="text-xs text-slate-400">Quality</div>
                <div className="text-sm font-bold text-indigo-400">
                  1080p HD
                </div>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <div className="text-xs text-slate-400">Viewers</div>
                <div className="text-sm font-bold text-slate-200">
                  {(Math.random() * 200 + 10).toFixed(0)}K
                </div>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <div className="text-xs text-slate-400">Latency</div>
                <div className="text-sm font-bold text-indigo-400">Low</div>
              </div>
            </div>

            {matchDetails && (
              <div className="grid md:grid-cols-2 gap-4">
                {matchDetails.statistics?.length > 0 && (() => {
                  const homeDetails = selectedMatch.participants?.find((p: any) => p.meta?.location === "home");
                  const awayDetails = selectedMatch.participants?.find((p: any) => p.meta?.location === "away");
                  
                  const getStatValue = (stats: any[], typeName: string, pId: number, location: string) => {
                    const s = stats.find(x => x.type?.name === typeName && (x.participant_id === pId || x.participant_id === location));
                    return s ? s.data?.value : 0;
                  };
                  
                  const statTypes = [
                    { name: "Ball Possession %", label: "Possession (%)" },
                    { name: "Shots on Target", label: "Shots on Target" },
                    { name: "Fouls", label: "Fouls" },
                    { name: "Corners", label: "Corners" },
                    { name: "Yellowcards", label: "Yellow Cards" },
                    { name: "Redcards", label: "Red Cards" },
                  ];

                  return (
                    <div className="glass rounded-2xl p-5 md:col-span-2 mb-2">
                      <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                        <span className="font-bold text-white text-sm">{homeDetails?.name || 'Home'}</span>
                        <h4 className="font-bold text-indigo-400">Match Statistics</h4>
                        <span className="font-bold text-white text-sm">{awayDetails?.name || 'Away'}</span>
                      </div>
                      <div className="grid gap-4">
                        {statTypes.map(st => {
                          const hVal = Number(getStatValue(matchDetails.statistics, st.name, homeDetails?.id, "home")) || 0;
                          const aVal = Number(getStatValue(matchDetails.statistics, st.name, awayDetails?.id, "away")) || 0;
                          if (hVal === 0 && aVal === 0) return null; // Hide if both zero (optional, maybe better not to hide)

                          const total = hVal + aVal || 1;
                          const hPct = (hVal / total) * 100;
                          const aPct = (aVal / total) * 100;

                          return (
                            <div key={st.name} className="flex flex-col gap-1.5 text-sm">
                              <div className="flex justify-between text-slate-300 font-semibold px-1">
                                <span className="w-8 text-left">{hVal}</span>
                                <span className="text-slate-400 text-xs uppercase tracking-wider">{st.label}</span>
                                <span className="w-8 text-right">{aVal}</span>
                              </div>
                              <div className="flex w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full transition-all" style={{ width: `${hPct}%` }}></div>
                                <div className="bg-slate-500 h-full transition-all" style={{ width: `${aPct}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {matchDetails.events?.length > 0 && (
                  <div className="glass rounded-2xl p-5 max-h-64 overflow-y-auto">
                    <h4 className="font-bold text-indigo-400 mb-3 border-b border-slate-800 pb-2">
                      Match Events
                    </h4>
                    <div className="space-y-3">
                      {matchDetails.events
                        .slice()
                        .reverse()
                        .map((ev: any) => (
                          <div
                            key={ev.id}
                            className="flex gap-3 text-sm border-l-2 border-indigo-500/30 pl-3 py-1"
                          >
                            <span className="font-bold text-slate-300 w-8">
                              {ev.minute}'
                            </span>
                            <div>
                              <span className="text-white font-semibold">
                                {ev.player_name || ev.type_name}
                              </span>
                              <span className="text-slate-400 block text-xs">
                                {ev.info || ev.type_id === 14
                                  ? "Goal"
                                  : "Event"}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {matchDetails.comments?.length > 0 && (
                  <div className="glass rounded-2xl p-5 max-h-64 overflow-y-auto">
                    <h4 className="font-bold text-indigo-400 mb-3 border-b border-slate-800 pb-2">
                      Live Commentary
                    </h4>
                    <div className="space-y-4">
                      {matchDetails.comments.map((comment: any) => (
                        <div
                          key={comment.id}
                          className="text-sm border-l-2 border-slate-700 pl-3"
                        >
                          <span className="font-bold text-slate-400 mr-2">
                            {comment.minute}'
                          </span>
                          <span className="text-slate-300">
                            {comment.comment}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {!matchDetails && selectedMatch && (
              <div className="text-center py-8 text-slate-500">
                <span className="animate-pulse">Loading live data...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
