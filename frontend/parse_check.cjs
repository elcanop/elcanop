const fs = require('fs');
const acorn = require('acorn');
const jsx = require('acorn-jsx');

const Parser = acorn.Parser.extend(jsx());
const content = fs.readFileSync('src/App.jsx', 'utf8');

try {
  Parser.parse(content, { ecmaVersion: 2020, sourceType: 'module' });
  console.log("No syntax errors found.");
} catch (e) {
  console.error("Syntax Error at line", e.loc.line, ":", e.message);
}
