import https from 'https';

https.get('https://raw.githubusercontent.com/paulinhopoka/super_professor-pro/main/script.js', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const lines = data.split('\n');
    lines.forEach((line, i) => {
      if (line.toLowerCase().includes('gemini')) {
        console.log(`Line ${i + 1}: ${line}`);
      }
    });
  });
});
