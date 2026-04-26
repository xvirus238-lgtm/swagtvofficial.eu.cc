fetch('https://api.sofascore.com/api/v1/sport/football/events/live', {
  headers: {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Origin": "https://www.sofascore.com",
    "Referer": "https://www.sofascore.com/",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "max-age=0"
  }
})
.then(res => res.json())
.then(data => console.log(Object.keys(data), data.events ? data.events.length : 0))
.catch(err => console.error(err));
