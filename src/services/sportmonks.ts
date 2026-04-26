import { fetchLiveMatches, fetchTodayMatches, fetchMatchDetails } from './espnAPI';

const mapESPNToAppFormat = (e: any) => {
  const comp = e.competitions?.[0] || e;
  const home = comp.competitors?.find((c: any) => c.homeAway === 'home');
  const away = comp.competitors?.find((c: any) => c.homeAway === 'away');
  
  return {
    id: e.id,
    name: e.name || `${home?.team?.name || 'Unknown'} vs ${away?.team?.name || 'Unknown'}`,
    starting_at: e.date,
    state: { 
      name: comp.status?.displayClock || comp.status?.type?.shortDetail || 'Unknown', 
      state: comp.status?.type?.state === 'in' ? 'LIVE' : (comp.status?.type?.state === 'post' ? 'FT' : 'NS')
    },
    league: { name: e.season?.slug || 'League' },
    scores: [
      { description: "CURRENT", score: { participant: "home", goals: Number(home?.score || 0) } },
      { description: "CURRENT", score: { participant: "away", goals: Number(away?.score || 0) } }
    ],
    participants: [
      { 
        id: home?.team?.id, 
        meta: { location: "home" }, 
        name: home?.team?.name || 'Home', 
        short_code: home?.team?.abbreviation || 'HOM', 
        image_path: home?.team?.logo || '' 
      },
      { 
        id: away?.team?.id, 
        meta: { location: "away" }, 
        name: away?.team?.name || 'Away', 
        short_code: away?.team?.abbreviation || 'AWA', 
        image_path: away?.team?.logo || '' 
      }
    ]
  };
};

export async function getLiveFixtures() {
  const events = await fetchLiveMatches();
  return events.map(mapESPNToAppFormat);
}

export async function getFixturesByDate(date: string) { // YYYY-MM-DD
  const events = await fetchTodayMatches(date);
  return events.map(mapESPNToAppFormat);
}

export async function getFixtureDetails(fixtureId: number) {
  const event = await fetchMatchDetails(fixtureId.toString());
  if (!event || !event.header) return null;

  const baseMatch = mapESPNToAppFormat(event.header);

  // Parse statistics
  const parsedStats: any[] = [];
  if (event.boxscore?.teams) {
    event.boxscore.teams.forEach((t: any) => {
      if (t.statistics) {
         t.statistics.forEach((s: any) => {
             parsedStats.push({
                 type: { name: s.displayValue },
                 participant_id: t.team.id,
                 data: { value: s.displayValue === "Possession %" ? parseFloat(s.displayValue) : s.value }
             });
         });
      }
    });
  }

  // Parse events (Goals, Cards)
  const parsedEvents: any[] = [];
  const comments: any[] = [];
  if (event.keyEvents) {
     event.keyEvents.forEach((ke: any) => {
         parsedEvents.push({
             id: ke.id,
             minute: ke.clock?.displayValue || "0'",
             player_name: ke.participants?.[0]?.athlete?.shortName || "Unknown",
             type_name: ke.type?.text || "Event",
             info: ke.text || ""
         });
         comments.push({
             id: ke.id,
             minute: ke.clock?.displayValue || "0'",
             comment: ke.text || ""
         });
     });
  }

  return {
    ...baseMatch,
    events: parsedEvents,
    comments: comments,
    statistics: parsedStats
  };
}
