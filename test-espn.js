fetch('https://site.web.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard')
  .then(res => res.json())
  .then(data => console.log('ESPN eng.1 success:', JSON.stringify(data.events[0], null, 2)))
  .catch(err => console.log('ESPN error:', err));
