#!/usr/bin/env node
"use strict";Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});const p=require("fs"),u=require("path"),x=require("./document-parser.cjs");function a(){console.log(`
Document Parser - Extract meaningful text from JS, JSX, TS, TSX, Vue, and HTML files

Usage:
  doc-parse <directory|file> [options]

Options:
  --output-json <file>    Export results to JSON file
  --output-text <file>    Export results to text file
  --help                  Show this help message

Examples:
  doc-parse ./src
  doc-parse ./src --output-json results.json
  doc-parse ./src --output-text results.txt
  doc-parse ./components/Button.jsx --output-json button-texts.json

Supported file types: .js, .jsx, .ts, .tsx, .vue, .html
    `)}function g(l){const t={target:null,outputJson:null,outputText:null,showHelp:!1};for(let o=0;o<l.length;o++){const s=l[o];s==="--help"||s==="-h"?t.showHelp=!0:s==="--output-json"?(t.outputJson=l[o+1],o++):s==="--output-text"?(t.outputText=l[o+1],o++):!t.target&&!s.startsWith("--")&&(t.target=s)}return t}function f(){const l=process.argv.slice(2),t=g(l);if(t.showHelp||l.length===0){a();return}t.target||(console.error("Error: Please specify a file or directory to parse."),a(),process.exit(1));const o=u.resolve(t.target);p.existsSync(o)||(console.error(`Error: Path does not exist: ${o}`),process.exit(1)),console.log(`Parsing: ${o}`),console.log(`Starting document parsing...
`);const s=new x.DocumentParser;let n=[];try{const c=p.statSync(o);if(c.isDirectory())console.log("Parsing directory recursively..."),n=s.parseDirectory(o);else if(c.isFile()){console.log("Parsing single file...");const e=s.parseFile(o);e&&(n=[e])}console.log(`
Parsing completed! Found ${n.length} files.
`);const r=s.generateSummary(n);if(console.log("=== SUMMARY ==="),console.log(`Total files processed: ${r.totalFiles}`),console.log(`Total meaningful texts found: ${r.totalTexts}`),console.log(`
File types:`),Object.keys(r.fileTypes).forEach(e=>{console.log(`  ${e}: ${r.fileTypes[e]} files`)}),console.log(`
Text types found:`),Object.keys(r.textTypes).forEach(e=>{const i=e;r.textTypes[i]>0&&console.log(`  ${e}: ${r.textTypes[i]} items`)}),r.allTexts.length>0&&(console.log(`
=== SAMPLE TEXTS (first 10) ===`),r.allTexts.slice(0,10).forEach((e,i)=>{console.log(`${i+1}. [${e.type}] ${e.file}: "${e.text}"`)}),r.allTexts.length>10&&console.log(`... and ${r.allTexts.length-10} more texts`)),t.outputJson){const e=u.resolve(t.outputJson);s.exportToJson(n,e)}if(t.outputText){const e=u.resolve(t.outputText);s.exportToText(n,e)}console.log(`
Parsing completed successfully!`)}catch(c){console.error(`Error during parsing: ${c.message}`),process.exit(1)}}f();exports.main=f;exports.parseArgs=g;exports.showUsage=a;
