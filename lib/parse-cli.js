#!/usr/bin/env node

const DocumentParser = require('./document-parser');
const path = require('path');
const fs = require('fs');

// CLI usage function
function showUsage() {
    console.log(`
Document Parser - Extract meaningful text from JS, JSX, TS, TSX, Vue, and HTML files

Usage:
  node parse-cli.js <directory|file> [options]

Options:
  --output-json <file>    Export results to JSON file
  --output-text <file>    Export results to text file
  --help                  Show this help message

Examples:
  node parse-cli.js ./src
  node parse-cli.js ./src --output-json results.json
  node parse-cli.js ./src --output-text results.txt
  node parse-cli.js ./components/Button.jsx --output-json button-texts.json

Supported file types: .js, .jsx, .ts, .tsx, .vue, .html
    `);
}

// Parse command line arguments
function parseArgs(args) {
    const options = {
        target: null,
        outputJson: null,
        outputText: null,
        showHelp: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        if (arg === '--help' || arg === '-h') {
            options.showHelp = true;
        } else if (arg === '--output-json') {
            options.outputJson = args[i + 1];
            i++; // Skip next argument
        } else if (arg === '--output-text') {
            options.outputText = args[i + 1];
            i++; // Skip next argument
        } else if (!options.target && !arg.startsWith('--')) {
            options.target = arg;
        }
    }

    return options;
}

// Main function
function main() {
    const args = process.argv.slice(2);
    const options = parseArgs(args);

    if (options.showHelp || args.length === 0) {
        showUsage();
        return;
    }

    if (!options.target) {
        console.error('Error: Please specify a file or directory to parse.');
        showUsage();
        process.exit(1);
    }

    const targetPath = path.resolve(options.target);

    // Check if target exists
    if (!fs.existsSync(targetPath)) {
        console.error(`Error: Path does not exist: ${targetPath}`);
        process.exit(1);
    }

    console.log(`Parsing: ${targetPath}`);
    console.log('Starting document parsing...\n');

    const parser = new DocumentParser();
    let results = [];

    try {
        const stat = fs.statSync(targetPath);
        
        if (stat.isDirectory()) {
            console.log('Parsing directory recursively...');
            results = parser.parseDirectory(targetPath);
        } else if (stat.isFile()) {
            console.log('Parsing single file...');
            const result = parser.parseFile(targetPath);
            if (result) {
                results = [result];
            }
        }

        console.log(`\nParsing completed! Found ${results.length} files.\n`);

        // Generate summary
        const summary = parser.generateSummary(results);
        
        // Display summary
        console.log('=== SUMMARY ===');
        console.log(`Total files processed: ${summary.totalFiles}`);
        console.log(`Total meaningful texts found: ${summary.totalTexts}`);
        
        console.log('\nFile types:');
        Object.keys(summary.fileTypes).forEach(ext => {
            console.log(`  ${ext}: ${summary.fileTypes[ext]} files`);
        });
        
        console.log('\nText types found:');
        Object.keys(summary.textTypes).forEach(type => {
            if (summary.textTypes[type] > 0) {
                console.log(`  ${type}: ${summary.textTypes[type]} items`);
            }
        });

        // Show sample texts
        if (summary.allTexts.length > 0) {
            console.log('\n=== SAMPLE TEXTS (first 10) ===');
            summary.allTexts.slice(0, 10).forEach((item, index) => {
                console.log(`${index + 1}. [${item.type}] ${item.file}: "${item.text}"`);
            });
            
            if (summary.allTexts.length > 10) {
                console.log(`... and ${summary.allTexts.length - 10} more texts`);
            }
        }

        // Export to files if requested
        if (options.outputJson) {
            const jsonPath = path.resolve(options.outputJson);
            parser.exportToJson(results, jsonPath);
        }

        if (options.outputText) {
            const textPath = path.resolve(options.outputText);
            parser.exportToText(results, textPath);
        }

        console.log('\nParsing completed successfully!');
        
    } catch (error) {
        console.error(`Error during parsing: ${error.message}`);
        process.exit(1);
    }
}

// Run the CLI
if (require.main === module) {
    main();
}

module.exports = { main, parseArgs, showUsage };
