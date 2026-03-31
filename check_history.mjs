import https from 'https';

https.get('https://api.github.com/repos/paulinhopoka/super_professor-pro/commits?path=script.js', { headers: { 'User-Agent': 'Node.js' } }, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const commits = JSON.parse(data);
    console.log(commits.slice(0, 5).map(c => c.sha));
  });
});
