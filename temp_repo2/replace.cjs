const fs = require('fs');
let content = fs.readFileSync('script.js', 'utf8');
content = content.replace(/\balert\(/g, 'customAlert(');
fs.writeFileSync('script.js', content);
console.log('Done');
