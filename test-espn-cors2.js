async function test() {
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard`;
  const response = await fetch(url, {
    headers: {
      'Origin': 'http://localhost:3000'
    }
  });
  console.log(response.headers.get('access-control-allow-origin'));
}
test();
