import https from 'https';

https.get('https://api.github.com/repos/paulinhopoka/super_professor-pro/commits', { headers: { 'User-Agent': 'Node.js' } }, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const commits = JSON.parse(data);
    console.log(commits.slice(0, 3).map(c => c.commit.message));
  });
});
