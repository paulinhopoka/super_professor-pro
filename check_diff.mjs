import https from 'https';

https.get('https://api.github.com/repos/paulinhopoka/super_professor-pro/commits', { headers: { 'User-Agent': 'Node.js' } }, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const commits = JSON.parse(data);
    const sha = commits[0].sha;
    https.get(`https://api.github.com/repos/paulinhopoka/super_professor-pro/commits/${sha}`, { headers: { 'User-Agent': 'Node.js' } }, (res2) => {
      let data2 = '';
      res2.on('data', (chunk) => { data2 += chunk; });
      res2.on('end', () => {
        const commit = JSON.parse(data2);
        console.log(commit.files[0].patch);
      });
    });
  });
});
