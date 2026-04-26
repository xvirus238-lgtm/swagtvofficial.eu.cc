async function test() {
  const url = `https://api.sofascore.com/api/v1/sport/football/events/live`;
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
  console.log(response.status);
}
test();
