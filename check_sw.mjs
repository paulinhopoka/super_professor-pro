import https from 'https';

https.get('https://raw.githubusercontent.com/paulinhopoka/super_professor-pro/main/pwabuilder-sw.js', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(data);
  });
});
