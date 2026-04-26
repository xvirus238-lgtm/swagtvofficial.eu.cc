fetch('https://api.sofascore.app/api/v1/sport/football/matches/live')
  .then(res => console.log('Status app:', res.status))
  .catch(err => console.log(err));

fetch('https://api.sofascore.app/api/v1/sport/football/matches/live', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  }
})
  .then(res => console.log('Status app UA:', res.status))
  .catch(err => console.log(err));
