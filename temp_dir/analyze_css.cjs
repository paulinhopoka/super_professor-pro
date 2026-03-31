const https = require('https');

https.get('https://raw.githubusercontent.com/paulinhopoka/super_professor-pro/main/style.css', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("Total CSS lines:", data.split('\n').length);
    console.log("First 30 lines:\n", data.split('\n').slice(0, 30).join('\n'));
  });
});
