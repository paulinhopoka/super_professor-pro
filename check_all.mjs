import https from 'https';

const files = ['script.js', 'detalhes-turma.js', 'firebase.js', 'index.html'];

files.forEach(file => {
  https.get(`https://raw.githubusercontent.com/paulinhopoka/super_professor-pro/main/${file}`, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      const regex = /gemini-[a-zA-Z0-9.-]+/g;
      const matches = data.match(regex);
      if (matches) {
        console.log(`In ${file}:`, [...new Set(matches)]);
      }
    });
  });
});
