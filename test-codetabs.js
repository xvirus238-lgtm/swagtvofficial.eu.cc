async function test() {
  const url = `https://api.codetabs.com/v1/proxy?quest=` + encodeURIComponent(`https://api.sofascore.com/api/v1/sport/football/events/live`);
  const response = await fetch(url);
  console.log(response.status);
  const text = await response.text();
  console.log(text.substring(0,100));
}
test();
