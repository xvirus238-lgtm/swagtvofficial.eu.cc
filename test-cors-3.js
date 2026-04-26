async function test() {
  const url = `https://corsproxy.io/?` + encodeURIComponent(`https://api.sofascore.com/api/v1/sport/football/events/live`);
  const response = await fetch(url, {
    headers: {
      "Origin": "http://localhost:3000",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
  });
  console.log(response.status);
  const text = await response.text();
  console.log(text.substring(0,100));
}
test();
