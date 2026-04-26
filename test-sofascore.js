fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://api.sofascore.com/api/v1/sport/football/matches/live'))
  .then(res => res.json())
  .then(data => {
    console.log("Keys:", Object.keys(data));
    console.log("Data structure:", JSON.stringify(data).substring(0, 1000));
  })
  .catch(err => console.error(err));
