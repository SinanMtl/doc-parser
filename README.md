# Document Parser

A powerful parser that extracts meaningful text from JS, JSX, TS, TSX, Vue, and HTML files.

## Features

- **Modern TypeScript**: Fully typed with TypeScript for better development experience
- **Vite Build System**: Fast build process with Vite and hot module replacement
- **Dual Package Support**: Supports both ES Modules and CommonJS
- **Multi-Format File Support**: Parses JavaScript, TypeScript, JSX, TSX, Vue, and HTML files
- **Smart Text Extraction**: Extracts string literals, HTML text content, and natural language attributes
- **Advanced Filtering**: Automatically filters out code fragments, function parameters, and technical strings
- **Multi-Language Support**: Supports Unicode characters (Arabic, Chinese, Japanese, Korean, etc.)
- **Recursive Directory Parsing**: Recursively scans directories
- **Multiple Export Formats**: Exports results in JSON and text formats
- **CLI Support**: Command-line interface usage with global installation
- **Binary CLI Tool**: Global usage with `doc-parser` command
- **Context-Aware Parsing**: Parses different sections separately in JSX and Vue files
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **String Replacement Utilities**: Additional utilities for string manipulation

## Installation

```bash
npm install -g @sinanmtl/doc-parser
```

## Usage

### Command Line Interface (CLI)

```bash
# Usage after global installation
doc-parser ./src

# Export results to JSON file
doc-parser ./src --output-json results.json

# Export results to text file
doc-parser ./src --output-text results.txt

# Parse a single file
doc-parser ./demo/landing.jsx

# Export in both formats
doc-parser ./src --output-json results.json --output-text results.txt

# Help
doc-parser --help

# Local usage (without global installation)
node ./dist/parse-cli.js ./src
node ./dist/parse-cli.js ./demo --output-json demo-results.json
```

### Package.json Scripts

```bash
# Parse current directory and create example results
npm run example

# Parse command (requires parameter)
npm run parse ./src
npm run parse ./demo

# Build the project
npm run build

# Build in development/watch mode  
npm run dev

# Clean build directory
npm run clean
```

### Programmatic Usage

```typescript
// TypeScript (recommended)
import { DocumentParser } from '@sinanmtl/doc-parser';
// or
import DocumentParser from '@sinanmtl/doc-parser';

const parser = new DocumentParser();

// Parse a single file
const result = parser.parseFile('./demo/landing.vue');
console.log(result);

// Parse a directory
const results = parser.parseDirectory('./demo');

// Export results
parser.exportToJson(results, 'output.json');
parser.exportToText(results, 'output.txt');

// Generate summary
const summary = parser.generateSummary(results);
console.log(summary);
```

```javascript
// JavaScript ES Modules
import { DocumentParser } from '@sinanmtl/doc-parser';

const parser = new DocumentParser();

// Parse with type safety
const result = parser.parseFile('./demo/landing.jsx');
console.log(result);

// Use string replacement utilities
import { StringReplace } from '@sinanmtl/doc-parser/string-replace';
```

### Development Scripts

```bash
# Build the project
npm run build

# Build in watch mode (for development)
npm run dev

# Clean build directory
npm run clean

# Run example
npm run example

# Parse with custom parameters
npm run parse ./src
npm run parse ./demo
```

## Extracted Text Types

### JavaScript/TypeScript Files (.js, .ts):
- **Strings**: String literals (`"..."`, `'...'`, `\`...\``)
- Function parameters and console.log messages are filtered out
- Regex patterns and code fragments are automatically filtered

### JSX/TSX Files (.jsx, .tsx):
- **Strings**: String literals in JavaScript sections
- **JSX Text Content**: Natural language text within JSX elements
- **HTML Attributes**: Natural language attributes in JSX (alt, title, placeholder, etc.)
- JavaScript and JSX sections are parsed separately

### Vue Files (.vue):
- **Template Section**: 
  - HTML text content (text between tags)
  - Natural language attributes (alt, title, placeholder, etc.)
- **Script Section**: JavaScript string literals
- **Template and script sections are parsed separately**

### HTML Files (.html):
- **Text Content**: Text between HTML tags  
- **Attributes**: Natural language attributes (alt, title, placeholder, etc.)
- **Script Tags**: JavaScript strings within `<script>` tags in HTML
- HTML comments (`<!-- -->`) are currently not extracted

## Example Output

### Console Output:
```
Parsing: /Users/sinanmutlu/root/doc-parser/demo
Starting document parsing...

Parsing directory recursively...

Parsing completed! Found 3 files.

=== SUMMARY ===
Total files processed: 3
Total meaningful texts found: 130

File types:
  .html: 1 files
  .jsx: 1 files
  .vue: 1 files

Text types found:
  htmlText: 33 items
  naturalLanguageAttributes: 22 items
  strings: 75 items

=== SAMPLE TEXTS (first 10) ===
1. [htmlText] landing.html: "Document"
2. [string] landing.jsx: "Hello World!"
3. [string] landing.jsx: "مرحبا بالعالم!"
4. [string] landing.jsx: "こんにちは世界!"
5. [string] landing.jsx: "שלום עולם!"
6. [string] landing.jsx: "안녕하세요 세계!"
7. [htmlText] landing.vue: "Yerel"
8. [string] landing.jsx: "Hello world, welcome to our application"
9. [htmlText] landing.vue: "We are a team that thinks big and has big goals..."
10. [string] landing.jsx: "Merhaba dünya, uygulamamıza hoş geldiniz"
... and 120 more texts
```

### JSON Output Structure:
```json
{
  "metadata": {
    "timestamp": "2025-08-22T10:30:00.000Z",
    "totalFiles": 3,
    "supportedExtensions": [".js", ".jsx", ".ts", ".tsx", ".vue", ".html"]
  },
  "summary": {
    "totalFiles": 3,
    "totalTexts": 130,
    "fileTypes": {
      ".html": 1,
      ".jsx": 1,
      ".vue": 1
    },
    "textTypes": {
      "htmlText": 33,
      "naturalLanguageAttributes": 22,
      "strings": 75
    },
    "allTexts": [
      {
        "text": "Hello World!",
        "type": "strings",
        "file": "landing.jsx",
        "filePath": "/path/to/demo/landing.jsx"
      }
    ]
  },
  "detailedResults": [...]
}
```

## Filtering Rules

The parser automatically filters out the following texts:

### General Filtering:
- Empty or whitespace-only strings
- Strings shorter than 2 characters  
- Strings containing only numbers and symbols
- HTML entities (`&copy;`, `&nbsp;`, etc.)
- URLs and file paths
- Regex pattern fragments
- Common meaningless words: `true`, `false`, `null`, `undefined`, `ok`, `yes`, `no`

### Code-specific Filtering:
- camelCase function names (`handleUserClick`)
- CSS class names (`btn-primary`)
- snake_case variables (`user_name`)
- CONSTANT_NAMES (`API_KEY`)
- File extensions (`.js`, `.css`, `.png`, etc.)
- Function parameters (console.log, require, import parameters)
- Escape sequences (`\n`, `\t`, `\r`, etc.)
- Template literal syntax fragments

### Multi-Language Support:
The parser supports Latin, Arabic, Chinese, Japanese, Korean, Cyrillic, and other Unicode characters and does not filter them out.

## Testing

```bash
# Run tests and examples
npm run example

# Parse demo files directly
doc-parser ./demo --output-json ./output/demo-results.json --output-text ./output/demo-results.txt

# Parse with custom parameters
npm run parse ./src
npm run parse ./demo
```

These commands parse test files and export results in JSON and text formats to the `output/` directory.

## Supported File Types

- `.js` - JavaScript files
- `.jsx` - React JSX files  
- `.ts` - TypeScript files
- `.tsx` - TypeScript JSX files
- `.vue` - Vue.js Single File Components
- `.html` - HTML files

## Project Structure

```
doc-parser/
├── package.json         # Project configuration and scripts
├── README.md            # This file  
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite build configuration
├── src/                 # Source files (TypeScript)
│   ├── document-parser.ts  # Main parser class
│   ├── parse-cli.ts        # CLI tool
│   └── string-replace.ts   # String replacement utilities
├── dist/                # Built files (generated)
│   ├── document-parser.js  # ES Module build
│   ├── document-parser.cjs # CommonJS build
│   ├── document-parser.d.ts # Type definitions
│   └── parse-cli.js        # CLI executable
├── demo/                # Demo files
│   ├── landing.html     # HTML demo
│   ├── landing.jsx      # React JSX demo
│   ├── landing.vue      # Vue demo
└── plugins/             # Build plugins
    └── minifyPublicJs.ts # Vite plugin for JS minification
```

## Excluded Directories

The parser automatically skips the following directories:
- `node_modules`
- `.git`
- `.next`
- `dist`
- `build`
- `.vscode`

## License

MIT License

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
