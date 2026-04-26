async function test() {
  const leagues = ['eng.1', 'esp.1', 'ita.1', 'ger.1', 'fra.1'];
  const p = leagues.map(l => fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${l}/scoreboard`).then(r => r.json()));
  try {
    const results = await Promise.all(p);
    results.forEach((r, i) => console.log(leagues[i], r.events?.length));
  } catch (e) {
    console.log(e);
  }
}
test();
