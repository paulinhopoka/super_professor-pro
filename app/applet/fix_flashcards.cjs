const fs = require('fs');
let content = fs.readFileSync('/app/applet/script.js', 'utf8');
content = content.replace('if (!appData.settings.geminiApiKey) {', 'if (!localStorage.getItem(\\'gemini_api_key\\')) {');
fs.writeFileSync('/app/applet/script.js', content);
console.log('Done');
