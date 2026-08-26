const fs = require('fs');
const path = 'frontend/src/components/AdminLogin.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /<div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500\/10 border border-violet-500\/30 text-violet-300 text-xs font-semibold">/,
  `<img src="/logo.png" alt="Melofilia" className="h-10 mx-auto mb-4 drop-shadow-md" />\n          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold">`
);

fs.writeFileSync(path, content);
console.log('AdminLogin updated');
