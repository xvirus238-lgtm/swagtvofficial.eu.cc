const url = 'https://api.sportmonks.com/v3/football/leagues/search/La Liga?api_token=PylUgxgdrLnftFXkKHjipRWZePIr84KTdrSsZsUS2qrMpllDtyH7sf1MOZTz';
fetch(url).then(r=>r.json()).then(d=>console.log(JSON.stringify(d).slice(0, 500)));
