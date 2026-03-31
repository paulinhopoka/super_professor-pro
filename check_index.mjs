import https from 'https';

https.get('https://raw.githubusercontent.com/paulinhopoka/super_professor-pro/main/index.html', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const lines = data.split('\n');
    lines.forEach(line => {
      if (line.includes('script.js')) {
        console.log(line);
      }
    });
  });
});
