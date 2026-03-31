const fs = require('fs');
let content = fs.readFileSync('script.js', 'utf8');
const lines = content.split('\n');
for (let i = 1299; i < 1645; i++) {
    lines[i] = lines[i].replace(/\\\$\{/g, '${');
    lines[i] = lines[i].replace(/\\`/g, '`');
    lines[i] = lines[i].replace(/\\\\n/g, '\\n');
}
fs.writeFileSync('script.js', lines.join('\n'));
