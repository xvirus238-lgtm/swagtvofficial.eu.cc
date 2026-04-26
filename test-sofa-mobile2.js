async function test() {
  const url = `https://api.sofascore.com/mobile/v4/sport/football/events/live`;
  const response = await fetch(url);
  console.log(response.status);
}
test();
