import https from 'https';

https.get('https://raw.githubusercontent.com/paulinhopoka/super_professor-pro/main/script.js', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const lines = data.split('\n');
    lines.forEach((line, i) => {
      if (line.toLowerCase().includes('gemini')) {
        console.log(`Line ${i + 1}: ${line}`);
        // print a few lines around it
        for(let j = Math.max(0, i - 2); j <= Math.min(lines.length - 1, i + 2); j++) {
            console.log(`  ${j + 1}: ${lines[j]}`);
        }
        console.log('---');
      }
    });
  });
});
