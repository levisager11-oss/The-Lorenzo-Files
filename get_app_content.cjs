const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf8');
const lines = content.split('\n');
console.log(lines.slice(220, 260).join('\n'));
