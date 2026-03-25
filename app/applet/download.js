import fs from 'fs';
import https from 'https';

const files = [
  'index.html',
  'script.js',
  'style.css',
  'detalhes-turma.js',
  'detalhes-turma.css'
];

files.forEach(file => {
  https.get(`https://raw.githubusercontent.com/paulinhopoka/super_professor-pro/main/${file}`, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      if (res.statusCode === 200) {
        fs.writeFileSync(`/app/applet/${file}`, data);
        console.log(`Downloaded ${file}`);
      } else {
        console.log(`Failed to download ${file}: ${res.statusCode}`);
      }
    });
  });
});
