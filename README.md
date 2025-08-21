# Document Parser

Bu proje JS, JSX, TS, TSX, Vue ve HTML dosyalarından anlamlı metinleri çıkaran güçlü bir parser'dır.

## Özellikler

- **Çoklu Dosya Formatı Desteği**: JavaScript, TypeScript, JSX, TSX, Vue ve HTML dosyalarını parse eder
- **Akıllı Metin Çıkarma**: Yorumlar, string literaller, HTML metinleri, sınıf isimleri, ID'ler ve çeviri anahtarlarını çıkarır
- **Recursive Directory Parsing**: Klasörleri recursive olarak tarar
- **Filtreleme**: Anlamsız ve boş metinleri otomatik filtreler
- **Multiple Export Formats**: JSON ve text formatlarında sonuç export eder
- **CLI Support**: Komut satırından kullanım

## Kurulum

```bash
# Repository'yi klonlayın
git clone <repository-url>
cd doc-parser

# Veya sadece dosyaları indirin
```

## Kullanım

### Command Line Interface (CLI)

```bash
# Bir klasörü parse et
node parse-cli.js ./src

# Sonuçları JSON dosyasına export et
node parse-cli.js ./src --output-json results.json

# Sonuçları text dosyasına export et
node parse-cli.js ./src --output-text results.txt

# Tek bir dosyayı parse et
node parse-cli.js ./components/Button.jsx

# Her iki format da export et
node parse-cli.js ./src --output-json results.json --output-text results.txt

# Yardım
node parse-cli.js --help
```

### Package.json Scripts

```bash
# Mevcut klasörü parse et ve example sonuçları oluştur
npm run example

# Test çalıştır
npm test

# Parse komutu (parametre gerekli)
npm run parse ./src
```

### Programmatic Usage

```javascript
const DocumentParser = require('./document-parser');

const parser = new DocumentParser();

// Tek dosya parse et
const result = parser.parseFile('./components/Button.jsx');
console.log(result);

// Klasör parse et
const results = parser.parseDirectory('./src');

// Sonuçları export et
parser.exportToJson(results, 'output.json');
parser.exportToText(results, 'output.txt');

// Summary oluştur
const summary = parser.generateSummary(results);
console.log(summary);
```

## Çıkarılan Metin Türleri

### JavaScript/TypeScript/JSX/TSX Files:
- **Comments**: `//` ve `/* */` yorumları
- **Strings**: String literaller (`"..."`, `'...'`, `\`...\``)
- **JSX Text**: JSX elementleri içindeki metinler
- **Class Names**: `className="..."` attributeları
- **IDs**: `id="..."` attributeları  
- **Translation Keys**: `$t('...')`, `t('...')`, `i18n.t('...')` pattern'leri

### Vue Files:
- **Template Section**: HTML benzeri yapılar
- **Script Section**: JavaScript kodu
- **Style Section**: CSS yorumları
- **Vue Directives**: `v-model`, `v-if`, vb.
- **Vue Translations**: `{{ $t('...') }}` pattern'leri

### HTML Files:
- **Comments**: `<!-- ... -->` yorumları
- **Text Content**: Etiketler arasındaki metinler
- **Attributes**: `class`, `id`, `alt`, `title`, `placeholder` attributeları

## Örnek Çıktı

### Console Output:
```
Parsing: /path/to/project
Starting document parsing...

Parsing completed! Found 15 files.

=== SUMMARY ===
Total files processed: 15
Total meaningful texts found: 127

File types:
  .vue: 8 files
  .js: 4 files
  .jsx: 2 files
  .html: 1 files

Text types found:
  comments: 23 items
  strings: 45 items
  htmlText: 32 items
  translationKeys: 18 items
  classNames: 9 items

=== SAMPLE TEXTS (first 10) ===
1. [translationKeys] landing.vue: "src.views.landing.yerel"
2. [htmlText] landing.vue: "Teknasyon"
3. [comments] app.js: "Initialize the application"
4. [strings] utils.js: "Error: Invalid input"
5. [classNames] Button.jsx: "btn btn-primary"
...
```

### JSON Output Structure:
```json
{
  "metadata": {
    "timestamp": "2025-08-20T10:30:00.000Z",
    "totalFiles": 15,
    "supportedExtensions": [".js", ".jsx", ".ts", ".tsx", ".vue", ".html"]
  },
  "summary": {
    "totalFiles": 15,
    "totalTexts": 127,
    "fileTypes": {
      ".vue": 8,
      ".js": 4
    },
    "textTypes": {
      "comments": 23,
      "strings": 45
    },
    "allTexts": [
      {
        "text": "src.views.landing.yerel",
        "type": "translationKeys",
        "file": "landing.vue",
        "filePath": "/path/to/landing.vue"
      }
    ]
  },
  "detailedResults": [...]
}
```

## Filtreleme Kuralları

Parser aşağıdaki metinleri otomatik olarak filtreler:

- Boş veya sadece whitespace içeren stringler
- 2 karakterden kısa metinler
- Sadece sayı içeren stringler
- Sadece harf içermeyen stringler
- Yaygın anlamsız kelimeler: `true`, `false`, `null`, `undefined`
- HTML tag isimleri: `div`, `span`, `p`, vb.

## Test Etme

```bash
# Test dosyasını çalıştır
node test-parser.js

# Veya npm script ile
npm test
```

Bu komut mevcut klasördeki tüm dosyaları parse edip `test-results.json` ve `test-results.txt` dosyalarını oluşturur.

## Desteklenen Dosya Türleri

- `.js` - JavaScript files
- `.jsx` - React JSX files  
- `.ts` - TypeScript files
- `.tsx` - TypeScript JSX files
- `.vue` - Vue.js Single File Components
- `.html` - HTML files

## Excluded Directories

Parser otomatik olarak şu klasörleri atlar:
- `node_modules`
- `.git`
- `.next`
- `dist`
- `build`
- `.vscode`

## Lisans

MIT License

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add some amazing feature'`)
4. Branch'i push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın
