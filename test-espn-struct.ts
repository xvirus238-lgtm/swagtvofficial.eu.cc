fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard')
  .then(res => res.json())
  .then(data => {
    const e = data.events[0];
    const comp = e.competitions[0];
    const home = comp.competitors.find((c: any) => c.homeAway === 'home');
    const away = comp.competitors.find((c: any) => c.homeAway === 'away');
    console.log({
       name: e.name,
       date: e.date,
       status: comp.status.type.state, // 'pre', 'in', 'post'
       clock: comp.status.displayClock,
       home: home.team.name,
       homeScore: home.score,
       homeLogo: home.team.logo,
       away: away.team.name,
       awayScore: away.score,
       awayLogo: away.team.logo,
    })
  });
