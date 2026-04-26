async function test() {
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard`;
  const response = await fetch(url, {
    method: 'OPTIONS',
    headers: {
      'Origin': 'http://localhost:3000',
      'Access-Control-Request-Method': 'GET'
    }
  });
  console.log(response.headers.get('access-control-allow-origin'));
}
test();
