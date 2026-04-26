fetch('https://thingproxy.freeboard.io/fetch/https://api.sofascore.com/api/v1/sport/football/matches/live')
  .then(res => res.text())
  .then(data => console.log('success!', data.substring(0, 100)))
  .catch(err => console.log('err', err));
