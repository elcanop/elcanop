const fs = require('fs');

const navbarPath = 'frontend/src/components/Navbar.jsx';
let navbarContent = fs.readFileSync(navbarPath, 'utf8');

navbarContent = navbarContent.replace(
  /<div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500\/20 group-hover:scale-105 transition-transform">\s*<Music className="w-6 h-6 text-black" \/>\s*<\/div>\s*<div>\s*<div className="flex items-center gap-1.5">\s*<span className="font-display font-black text-2xl tracking-tight text-white group-hover:text-amber-400 transition-colors">\s*Melofilia\s*<\/span>\s*<span className="px-1.5 py-0.5 text-\[9px\] font-extrabold uppercase tracking-wider bg-violet-500\/20 text-violet-300 border border-violet-500\/30 rounded-md">\s*Drop It Co\s*<\/span>\s*<\/div>\s*<p className="text-\[11px\] text-slate-400 font-medium tracking-wide">Música personalizada de estudio<\/p>\s*<\/div>/,
  `<img src="/logo.png" alt="Melofilia by Drop It Co" className="h-10 sm:h-12 w-auto group-hover:scale-[1.02] transition-transform drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]" />`
);

fs.writeFileSync(navbarPath, navbarContent);
console.log('Navbar updated');

const footerPath = 'frontend/src/components/Footer.jsx';
let footerContent = fs.readFileSync(footerPath, 'utf8');

footerContent = footerContent.replace(
  /<div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center">\s*<Music className="w-5 h-5 text-black" \/>\s*<\/div>\s*<div>\s*<h3 className="font-display font-bold text-xl text-white">\s*Melofilia\s*<\/h3>\s*<p className="text-[10px] uppercase tracking-wider font-bold text-amber-400">\s*by Drop It Co\s*<\/p>\s*<\/div>/,
  `<img src="/logo.png" alt="Melofilia by Drop It Co" className="h-10 w-auto opacity-90 hover:opacity-100 transition-opacity" />`
);

fs.writeFileSync(footerPath, footerContent);
console.log('Footer updated');

