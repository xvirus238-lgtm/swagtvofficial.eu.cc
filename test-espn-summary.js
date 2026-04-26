fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/all/summary?event=740932')
  .then(res => res.json())
  .then(data => {
    console.log('Got ESPN detail ALL:', Object.keys(data.header || {}));
  })
  .catch(err => console.log('ESPN summary error:', err));
