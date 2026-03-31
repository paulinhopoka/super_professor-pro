import https from 'https';

const shas = [
  '6cefa9b1db45de7221c2a3028b9a027cf83ea295',
  '9d127153f944eaf283dacde8e96b8a1b167db015',
  'aeda9889ce486277b2286472ad9ea5b569bff1ab',
  'e273d19a50019346d11a6c85e69e6b0d79e6d4e2',
  '4c950c930148a75d01c46ede3e82a804a66da417'
];

shas.forEach(sha => {
  https.get(`https://raw.githubusercontent.com/paulinhopoka/super_professor-pro/${sha}/script.js`, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      const regex = /gemini-[a-zA-Z0-9.-]+/g;
      const matches = data.match(regex);
      if (matches) {
        console.log(`In ${sha}:`, [...new Set(matches)]);
      }
    });
  });
});
