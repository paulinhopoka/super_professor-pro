import https from 'https';

https.get('https://raw.githubusercontent.com/paulinhopoka/super_professor-pro/main/script.js', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const regex = /gemini-[a-zA-Z0-9.-]+/g;
    const matches = data.match(regex);
    console.log([...new Set(matches)]);
  });
});
