const fs = require('fs');
let css = fs.readFileSync('/app/applet/style.css', 'utf8');
css = css.replace(
  '.data-table th, .data-table td { border: 1px solid var(--border-color); padding: 0.4rem 0.3rem; text-align: left; vertical-align: middle; white-space: nowrap; }',
  '.data-table th, .data-table td { border: 1px solid var(--border-color); padding: 0.4rem 0.3rem; text-align: left; vertical-align: middle; white-space: normal; word-wrap: break-word; overflow-wrap: break-word; hyphens: auto; }'
);
css = css.replace(
  '#grades-table-container .data-table .grade-col { width: 55px; text-align: center; }',
  '#grades-table-container .data-table .grade-col { min-width: 60px; width: auto; text-align: center; }'
);
css = css.replace(
  '.data-table td input[type="number"], .data-table td select { padding: 0.3rem; margin-bottom: 0; font-size: 0.85rem; width: 55px; max-width: 100%; border-radius: 3px; text-align: center; border: 1px solid var(--input-border); background-color: var(--input-bg); color: var(--text-primary); }',
  '.data-table td input[type="number"], .data-table td select { padding: 0.3rem; margin-bottom: 0; font-size: 0.85rem; width: 100%; min-width: 55px; max-width: 100%; border-radius: 3px; text-align: center; border: 1px solid var(--input-border); background-color: var(--input-bg); color: var(--text-primary); box-sizing: border-box; }'
);
fs.writeFileSync('/app/applet/style.css', css);
console.log('style.css updated successfully');
