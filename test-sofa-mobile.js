async function test() {
  const url = `https://api.sofascore.com/api/v1/sport/football/events/live`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 10; SM-G981B Build/QP1A.190711.020)",
      "Connection": "Keep-Alive",
      "Accept-Encoding": "gzip"
    }
  });
  console.log(response.status);
}
test();
