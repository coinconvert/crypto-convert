const fs = require("fs");
const version = require('./package.json').version;


let updated = fs.readFileSync("./dist/api.js", {
    encoding: 'utf-8'
}).replace(/\{version\}/g, version);

fs.writeFileSync('./dist/api.js', updated, 'utf-8');

fs.copyFileSync('./src/api.d.ts', './dist/api.d.ts');

console.log("[+] Done.");