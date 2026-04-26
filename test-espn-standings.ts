fetch('https://site.api.espn.com/apis/v2/sports/soccer/eng.1/standings')
  .then(r => r.json())
  .then(d => console.log('ESPN Standings:', d.children?.length > 0 ? d.children[0].standings.entries.length : 0))
  .catch(e => console.log(e));
