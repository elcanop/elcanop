const fs = require('fs');
const path = 'frontend/src/components/AdminDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /<div className="w-12 h-12 rounded-2xl bg-violet-600\/20 border border-violet-500\/40 flex items-center justify-center">\s*<ShieldCheck className="w-6 h-6 text-violet-400" \/>\s*<\/div>/,
  `<img src="/logo.png" alt="Melofilia" className="h-10 w-auto drop-shadow-md hidden sm:block" />`
);

fs.writeFileSync(path, content);
console.log('AdminDashboard updated');
