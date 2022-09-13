const fs = require("fs");
const version = require('./package.json').version;


if(process.argv[2] == '--cdn'){
    let updated = fs.readFileSync("./cdn/crypto-convert.min.js", {
        encoding: 'utf-8'
    }).replace(/\{version\}/g, version);
    
    fs.writeFileSync('./cdn/crypto-convert.min.js', updated, 'utf-8');

    console.log("[+] CDN Done.");
}
else{
    let updated = fs.readFileSync("./dist/api.js", {
        encoding: 'utf-8'
    }).replace(/\{version\}/g, version);
    
    fs.writeFileSync('./dist/api.js', updated, 'utf-8');
    
    fs.copyFileSync('./src/api.d.ts', './dist/api.d.ts');
    
    console.log("[+] Done.");
}
