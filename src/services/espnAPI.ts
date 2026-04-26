const leagues = ['eng.1', 'esp.1', 'ita.1', 'ger.1', 'fra.1'];

export const fetchLiveMatches = async () => {
  try {
    const p = leagues.map(l => fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${l}/scoreboard`).then(r => r.json()));
    const results = await Promise.all(p);
    
    let allMatches: any[] = [];
    for (const res of results) {
      if (res.events) {
        // filter for live
        const live = res.events.filter((e: any) => e.status?.type?.state === 'in');
        allMatches = [...allMatches, ...live];
      }
    }
    return allMatches;
  } catch (error) {
    console.error('❌ ESPN API error:', error);
    return [];
  }
};

export const fetchTodayMatches = async (dateStr?: string) => {
  try {
    const urlDate = dateStr ? dateStr.replace(/-/g, '') : '';
    const dateParam = urlDate ? `?dates=${urlDate}` : '';
    
    const p = leagues.map(l => fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${l}/scoreboard${dateParam}`).then(r => r.json()));
    const results = await Promise.all(p);
    
    let allMatches: any[] = [];
    for (const res of results) {
      if (res.events) {
        allMatches = [...allMatches, ...res.events];
      }
    }
    return allMatches;
  } catch (error) {
    console.error('❌ ESPN API error:', error);
    return [];
  }
};

export const fetchMatchDetails = async (matchId: string) => {
  try {
    const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/all/summary?event=${matchId}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('❌ ESPN API error:', error);
    return null;
  }
};
