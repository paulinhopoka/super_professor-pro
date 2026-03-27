const fs = require('fs');
const https = require('https');

https.get('https://raw.githubusercontent.com/paulinhopoka/super_professor-pro/main/script.js', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log("Total lines:", data.split('\n').length);
    console.log("First 50 lines:\n", data.split('\n').slice(0, 50).join('\n'));
    
    // Check for some patterns
    const hasReact = data.includes('React');
    const hasVue = data.includes('Vue');
    const hasJQuery = data.includes('jQuery') || data.includes('$(');
    const hasClasses = data.includes('class ');
    const hasConstLet = data.includes('const ') || data.includes('let ');
    const hasVar = data.includes('var ');
    const hasAsyncAwait = data.includes('async ') || data.includes('await ');
    
    console.log({hasReact, hasVue, hasJQuery, hasClasses, hasConstLet, hasVar, hasAsyncAwait});
  });
});
