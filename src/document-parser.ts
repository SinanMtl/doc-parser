import fs from 'fs';
import path from 'path';

export interface ExtractedText {
  text: string;
  type: 'htmlText' | 'string' | 'attribute';
  context: 'javascript' | 'html' | 'vue';
  lineNumber: number;
  startPosition: number;
  endPosition: number;
  columnStart: number;
  columnEnd: number;
  absoluteStart: number;
  absoluteEnd: number;
  originalStartPosition: number;
  originalEndPosition: number;
  originalAbsoluteStart: number;
  originalAbsoluteEnd: number;
  originalMatch: string;
  file?: string;
  filePath?: string;
  attribute?: string;
}

export interface ParsedResult {
  filePath?: string;
  fileName?: string;
  extension: string;
  extractedText: {
    strings?: ExtractedText[];
    htmlText?: ExtractedText[];
    naturalLanguageAttributes?: ExtractedText[];
    attributes?: ExtractedText[];
    templateText?: ExtractedText[];
    classNames?: ExtractedText[];
    ids?: ExtractedText[];
  };
  timestamp: string;
}

export interface PositionInfo {
  lineNumber: number;
  startPosition: number;
  endPosition: number;
  columnStart: number;
  columnEnd: number;
  absoluteStart: number;
  absoluteEnd: number;
}

export interface Summary {
  totalFiles: number;
  fileTypes: Record<string, number>;
  totalTexts: number;
  textTypes: {
    htmlText: number;
    naturalLanguageAttributes: number;
    strings: number;
  };
  allTexts: ExtractedText[];
}

export interface ParseContentParams {
  filePath?: string;
  fileName?: string;
}

export class DocumentParser {
  public supportedExtensions: string[];
  public extractedTexts: ExtractedText[];

  constructor() {
    this.supportedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.html'];
    this.extractedTexts = [];
  }

  /**
   * Check if text content is likely non-textual (like code, URLs, etc.)
   */
  isNonTextualContent(payload: {
    text: string,
    isAttribute?: boolean,
    isJS?: boolean
  }) {
    const { text, isAttribute = false, isJS = false } = payload;
    // Skip HTML entities, URLs, file paths, and other non-natural language content
    const nonTextualPatterns = [
      /^&[a-zA-Z]+;$/, // HTML entities like &copy;
      /^https?:\/\//, // URLs starting with http/https
      /^\/[\/\w-]+$/, // File paths
      /^[0-9\s\-\+\(\)]+$/, // Only numbers and symbols
      /^[A-Z_]{5,}$/, // Long constants like API_KEY (5+ chars)
      /^\s*$/, // Empty or whitespace only
      /^[\w-]+\.(js|css|png|jpg|gif|svg)$/i, // File names
      /^[a-z]+([A-Z][a-z]*)*$/, // camelCase function names like handleUserClick
      /^[a-z]+-[a-z-]+$/, // CSS class names like btn-primary
      /^[a-z]+_[a-z_]+$/i, // snake_case variables
      /api\..*\.com/i, // API URLs
      /^(ok|yes|no|true|false)$/i, // Very short technical words
      /^\w{1,2}$/, // Very short strings (1-2 chars)
      
      // Technical symbols and patterns
      /^\\[nrtbfv\\'"0]$/, // All escape sequences like \n, \t, \r, etc.
      /^[\\\/\*\{\}\[\]()<>;,.:!?'"=+\-~^&|%$#@]+$/, // Technical symbols only
      /^\/\*$/, // Comment start
      /^\*\/$/, // Comment end
      /^\/\/$/, // Single line comment
      /^[{}[\]()<>]$/, // Single brackets/parentheses
      /^[;,.:!?'"]+$/, // Punctuation only
      /^[+\-*/%=&|^~<>]+$/, // Operators only
      /^\$\{/, // Template literal expressions
      /^.*\}$/, // Ending with }
      /^.*content\s*\+=/, // Template concatenation patterns
      /^;\s*$/, // Semicolon only
      /^['"]\([^'"]*$/, // Regex pattern fragments
      /^\][^'"]*['"]*$/, // Regex pattern fragments
      /^[^'"]*\)['"]*$/, // Regex pattern fragments
      /^:\s*\n\s*case\s*$/, // Switch case patterns
      /^,\s*\n\s*$/, // Comma with newline patterns
      
      ...(isJS ? [
        /^[A-Z][A-Z0-9_]{4,}$/, // CONSTANT_NAMES (5+ chars total, was causing B2B to be filtered)
      ] : []),
      
      
      /^[a-z]+[A-Z][a-z]*[A-Z][a-z]*$/, // camelCase with 2+ capital letters (handleUserClick)
      /^[a-z]+-[a-z]+-[a-z-]+$/, // Multi-dash CSS classes like btn-primary-large
      

      
      /^(src|alt|id|css|js|php|html|xml|json)$/i, // Common technical abbreviations
      
      // Generic technical patterns - skip for attributes
      ...(isAttribute ? [] : [/^[a-zA-Z]*-[a-zA-Z-]*$/]), // Alphabetic strings with dash(es) but no spaces (CSS classes, kebab-case)
      /^[A-Z]+_[A-Z0-9_]+$/, // CONSTANT_NAMES like API_KEY_123
      /^[a-z]+([A-Z][a-z]*)+$/, // Simple camelCase like handleClick
      /^\/.*\/[gimsuyx]*$/, // RegExp literals like /pattern/flags
    ];

    return nonTextualPatterns.some((pattern) => pattern.test(text.trim()));
  }

  getFileExtension(fileName: string) {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  }

  /**
   * Parse a single file and extract meaningful text
   */
  parseFile(filePath: string) {
    const extension = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);

    try {
      const content = fs.readFileSync(filePath, 'utf8');

      return this.parseContent(content, extension, {
        filePath,
        fileName
      });
    } catch (error: any) {
      console.error(`Error reading file ${filePath}:`, error.message);
      return null;
    }
  }

  /**
   * Parse content and extract meaningful text
   */
  parseContent(content: string, extension: string, params?: ParseContentParams): ParsedResult | null {
    if (!this.supportedExtensions.includes(extension)) {
      console.warn(`Unsupported file type: ${extension}`);
      return null;
    }

    content = this.escapeRegExp(content);

    const extractedText = this.extractTextByType(content, extension);

    return {
      ...(params || {}),
      extension,
      extractedText,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Extract text based on file type
   */
  extractTextByType(content: string, extension: string) {
    const result = {
      strings: [],
      htmlText: [],
      attributes: [],
      templateText: [],
      classNames: [],
      ids: [],
    };

    switch (extension) {
      case '.js':
      case '.ts':
        return this.parseJavaScriptTypeFiles(content);
      case '.jsx':
      case '.tsx':
        return this.parseJSXFile(content);
      case '.vue':
        return this.parseVueFile(content);
      case '.html':
        return this.parseHtmlFile(content);
      default:
        return result;
    }
  }

  /**
   * Parse JavaScript/TypeScript files
   */
  parseJavaScriptTypeFiles(content: string) {
    const result = {
      strings: [] as ExtractedText[],
    };

    // Extract meaningful strings with position information
    const stringResults = this.extractMeaningfulStringsWithPosition(content, 'javascript');
    result.strings.push(...stringResults);

    // Translation key extraction disabled
    // No longer extracting translation keys like $t('key'), t('key'), i18n.t('key')

    return result;
  }

  /**
   * Parse JSX/TSX files - combines JavaScript parsing with HTML content extraction
   */
  parseJSXFile(content: string) {
    const result = {
      strings: [] as ExtractedText[],
      classNames: [] as string[],
      ids: [] as string[],
    };

    // For JSX files, we need to separate JavaScript logic from JSX markup
    // First, extract pure JavaScript strings (not in JSX blocks)
    
    // Parse HTML content within JSX (similar to Vue parsing but JSX-aware)
    // Extract JSX return statements (the actual JSX/HTML content)
    const jsxReturnPattern = /return\s*\(\s*([\s\S]*?)\s*\);/g;
    const returnMatches = [...content.matchAll(jsxReturnPattern)];

    // Keep track of JSX content positions to exclude them from string extraction
    const jsxRanges: { start: number; end: number }[] = [];

    // Parse each JSX return statement as HTML content
    returnMatches.forEach((match) => {
      const jsxContent = match[1];
      const jsxContentStart = match.index + match[0].indexOf(match[1]);
      const jsxContentEnd = jsxContentStart + jsxContent.length;
      
      // Track this JSX range
      jsxRanges.push({ start: jsxContentStart, end: jsxContentEnd });
      
      const htmlResults = this.parseHtmlContent(
        jsxContent,
        true,
        jsxContentStart,
        content,
        'html'
      );

      // Add HTML results
      result.strings.push(...htmlResults.htmlText);
      result.strings.push(...htmlResults.naturalLanguageAttributes);
    });

    // Now extract JavaScript strings, but exclude those within JSX ranges
    const stringResults = this.extractJavaScriptStringsExcludingJSX(content, jsxRanges, 'javascript');
    result.strings.push(...stringResults);

    return result;
  }

  /**
   * Extract JavaScript strings while excluding JSX ranges
   */
  extractJavaScriptStringsExcludingJSX(
    content: string,
    jsxRanges: { start: number, end: number }[],
    contextType: 'javascript' | 'html' | 'vue' = 'javascript'
  ) {
    const allStrings: RegExpExecArray[] = [];

    // Extract all string literals with positions
    const patterns = [
      /"(?:[^"\\]|\\.)*"/g,  // Double quoted strings
      /'(?:[^'\\]|\\.)*'/g,  // Single quoted strings
      /`(?:[^`\\]|\\.)*`/g   // Template literals
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const stringStart = match.index;
        const stringEnd = match.index + match[0].length;
        
        // Check if this string is within any JSX range
        const isInJSX = jsxRanges.some(range => 
          stringStart >= range.start && stringEnd <= range.end
        );
        
        if (!isInJSX) {
          allStrings.push(match);
        }
      }
    });

    // Now apply the same filtering logic as extractMeaningfulStringsWithPosition
    const strings: ExtractedText[] = [];
    const ignorePatterns = [
      /require\s*\(/,
      /import\s+.*\s+from\s+/,
      /export\s+.*\s+from\s+/,
    ];

    allStrings.forEach((match) => {
      const str = match[0];
      const stringIndex = match.index;

      // Get some context around the string
      const contextStart = Math.max(0, stringIndex - 100);
      const context = content.substring(
        contextStart,
        stringIndex + str.length + 50
      );

      // Check if this string is in an ignored context
      let shouldIgnore = ignorePatterns.some((pattern) =>
        pattern.test(context)
      );

      // Additional context-based filtering
      if (!shouldIgnore) {
        const cleanString = str.slice(1, -1);
        
        // Enhanced function call detection - check if we're inside any function call parentheses
        const isFunctionCallParam = this.isInsideFunctionCall(content, stringIndex);
        
        // Check if it's in a console.log specifically (additional check)
        const beforeString = content.substring(Math.max(0, stringIndex - 200), stringIndex);
        const isInConsoleLog = /console\.(log|error|warn|info|debug|trace)\s*\(\s*['"`]*$/.test(beforeString);
        
        // Filter out regex pattern fragments
        const regexPatterns = [
          /^[\[\](){}.*+?^$\\|]+$/, // Only regex special characters
          /^\[.*\]$/, // Character classes like [^"'`]
          /^\(.*\)$/, // Groups like ([^"'`]+)
          /^\\[a-z]$/, // Escape sequences like \t, \n
          /\[\^[^[\]]*\]/, // Negative character classes
          /\$\{|\}\$/, // Template literal syntax
        ];
        
        const isRegexFragment = regexPatterns.some(pattern => pattern.test(cleanString));
        
        // Filter out translation key patterns (the patterns themselves, not the keys)
        const isTranslationPattern = /\$t\(|\\.t\(|i18n\\.t\(/.test(cleanString);
        
        // Filter out code-like strings that contain translation functions
        const containsTranslationCall = /\bt\s*\(/.test(cleanString);
        
        // Filter out very short strings that are likely code fragments
        const isTooShort = cleanString.length <= 2;
        
        // Filter out strings that are mostly special characters
        const isSpecialChars = /^[^a-zA-Z0-9\s\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF\u0400-\u04FF\u0370-\u03FF\u0590-\u05FF\u0600-\u06FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]+$/.test(cleanString);
        
        // Primary filtering logic: ignore function call parameters and console.log parameters
        shouldIgnore = isRegexFragment || isTranslationPattern || containsTranslationCall || 
                      isTooShort || isSpecialChars || isFunctionCallParam || isInConsoleLog;
      }

      if (!shouldIgnore) {
        // Remove quotes and add to results
        const cleanString = str.slice(1, -1);

        if (
          cleanString.trim().length > 2 && // Minimum 3 characters for meaningful text
          !this.isNonTextualContent({ text: cleanString })
        ) {
          // Calculate positions for originalMatch (includes quotes)
          const originalPosition = this.getPositionInfo(
            content,
            stringIndex,
            stringIndex + str.length
          );
          
          // Calculate positions for text content (excludes quotes)
          const textStart = stringIndex + 1; // Skip opening quote
          const textEnd = stringIndex + str.length - 1; // Skip closing quote
          const textPosition = this.getPositionInfo(
            content,
            textStart,
            textEnd
          );
          
          strings.push({
            text: cleanString.replace(/\n/, '').trim(),
            type: 'string',
            context: contextType,
            lineNumber: textPosition.lineNumber,
            startPosition: textPosition.columnStart,
            endPosition: textPosition.columnEnd,
            columnStart: textPosition.columnStart,
            columnEnd: textPosition.columnEnd,
            absoluteStart: textPosition.absoluteStart,
            absoluteEnd: textPosition.absoluteEnd,
            originalStartPosition: originalPosition.columnStart,
            originalEndPosition: originalPosition.columnEnd,
            originalAbsoluteStart: originalPosition.absoluteStart,
            originalAbsoluteEnd: originalPosition.absoluteEnd,
            originalMatch: str,
          });
        }
      }
    });

    return strings;
  }

  /**
   * Mask regex patterns in the string with asterisks and mask comments with spaces
   * to prevent misleading parsing.
   */
  escapeRegExp(str: string) {
    // 1. Clear HTML tags and some URL patterns
    let temp = str.replace(/^https?:\/\//gm, (match) => ' '.repeat(match.length));
    temp = temp.replace(/<[^>]*>/gm, (match) => ' '.repeat(match.length));

    // 2. Clear comments
    let commentMatch;
    const commentEscapePattern = /(\/\*([\s\S]*?)\*\/|[^\\]\/\/.+)/g;

    // - Mask comments with space char
    while ((commentMatch = commentEscapePattern.exec(temp)) !== null) {
      const matched = commentMatch[0];
      for (const item of matched.split('\n')) {
        temp = temp.replace(item, ''.padStart(item.length, ' '));
      }
    }
    
    // 3. Find and clear regex patterns
    const regexPattern = /(\/(.*)\/+([gimuy]*))/gm;
    let regexpMatch;
    let startPosition = -1;
    let endPosition = -1;

    // - Mask regex expressions with asterisks
    while ((regexpMatch = regexPattern.exec(temp)) !== null) {
      if (startPosition === -1) {
        startPosition = regexpMatch.index;
      }
      const foundRegex = regexpMatch[0].replace(/^(!|=)\s{1,}?/, '').trim();
      try {
        // Extract pattern and flags from the found regex
        const match = foundRegex.match(/^\/(.*)\/([gimuy]*)$/);

        if (match) {
          const pattern = match[1];
          const flags = match[2];

          // Try to create a RegExp object to validate
          new RegExp(pattern, flags);

          // Replace with placeholder text
          temp = temp.replace(foundRegex, `"${''.padStart(foundRegex.length - 2, '*')}"`);
          endPosition = regexpMatch.index + foundRegex.length;
        }
      } catch {
        continue;
      }
    }

    const cleanPart = temp.slice(startPosition, endPosition);
    const originalPart = str.slice(startPosition, endPosition);

    // Replace regex patterns with placeholders on original string
    str = str.replace(originalPart, cleanPart);

    return str;
  }

  /**
   * Extract meaningful strings from JavaScript code with position information
   */
  extractMeaningfulStringsWithPosition(content: string, contextType: 'javascript' | 'html' | 'vue' = 'javascript') {
    const strings: ExtractedText[] = [];

    // Extract all string literals with positions - using simpler, more reliable patterns
    const allStrings: RegExpExecArray[] = [];

    // Double quoted strings
    const doubleQuotedPattern = /"(?:[^"\\]|\\.)*"/g;
    let match;
    while ((match = doubleQuotedPattern.exec(content)) !== null) {
      allStrings.push(match);
    }

    // Single quoted strings
    const singleQuotedPattern = /'(?:[^'\\]|\\.)*'/g;
    while ((match = singleQuotedPattern.exec(content)) !== null) {
      allStrings.push(match);
    }

    // Template literals (backticks) - with special handling for regex contexts and multiline content
    const templateLiteralPattern = /`(?:[^`\\]|\\.|[\r\n])*`/g;
    while ((match = templateLiteralPattern.exec(content)) !== null) {
      // Check if this template literal is inside a regex pattern definition
      const contextBefore = content.substring(Math.max(0, match.index - 100), match.index);
      const contextAfter = content.substring(match.index + match[0].length, match.index + match[0].length + 20);
      
      // Skip template literals that are part of regex character classes
      const isRegexCharClass = /\[[^\]]*$/.test(contextBefore) && /^[^\]]*\]/.test(contextAfter);
      
      if (!isRegexCharClass) {
        allStrings.push(match);
      }
    }

    // Basic filtering - only essential patterns
    const ignorePatterns = [
      /require\s*\(/,
      /import\s+.*\s+from\s+/,
      /export\s+.*\s+from\s+/,
    ];

    allStrings.forEach((match) => {
      const str = match[0];
      const stringIndex = match.index;

      // Get some context around the string
      const contextStart = Math.max(0, stringIndex - 100);
      const context = content.substring(
        contextStart,
        stringIndex + str.length + 50
      );

      // Check if this string is in an ignored context
      let shouldIgnore = ignorePatterns.some((pattern) =>
        pattern.test(context)
      );

      // Additional context-based filtering
      if (!shouldIgnore) {
        const cleanString = str.slice(1, -1);
        
        // Enhanced function call detection - check if we're inside any function call parentheses
        const isFunctionCallParam = this.isInsideFunctionCall(content, stringIndex);
        
        // Check if it's in a console.log specifically
        const beforeString = content.substring(Math.max(0, stringIndex - 200), stringIndex);
        const isInConsoleLog = /console\.(log|error|warn|info|debug|trace)\s*\(\s*['"`]*$/.test(beforeString);
        
        // Filter out regex pattern fragments
        const regexPatterns = [
          /^[\[\](){}.*+?^$\\|]+$/, // Only regex special characters
          /^\[.*\]$/, // Character classes like [^"'`]
          /^\(.*\)$/, // Groups like ([^"'`]+)
          /^\\[a-z]$/, // Escape sequences like \t, \n
          /\[\^[^[\]]*\]/, // Negative character classes
          /\$\{|\}\$/, // Template literal syntax
        ];
        
        const isRegexFragment = regexPatterns.some(pattern => pattern.test(cleanString));
        
        // Filter out translation key patterns (the patterns themselves, not the keys)
        const isTranslationPattern = /\$t\(|\\.t\(|i18n\\.t\(/.test(cleanString);
        
        // Filter out code-like strings that contain translation functions
        const containsTranslationCall = /\bt\s*\(/.test(cleanString);
        
        // Filter out very short strings that are likely code fragments
        const isTooShort = cleanString.length <= 2;
        
        // Filter out strings that are mostly special characters
        const isSpecialChars = /^[^a-zA-Z0-9\s\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF\u0400-\u04FF\u0370-\u03FF\u0590-\u05FF\u0600-\u06FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]+$/.test(cleanString);
        
        // Primary filtering logic: ignore function call parameters and console.log parameters
        shouldIgnore = isRegexFragment || isTranslationPattern || containsTranslationCall || 
                      isTooShort || isSpecialChars || isFunctionCallParam || isInConsoleLog;
      }

      if (!shouldIgnore) {
        // Remove quotes and add to results
        const cleanString = str.slice(1, -1);

        if (
          cleanString.trim().length > 2 && // Minimum 3 characters for meaningful text
          !this.isNonTextualContent({ text: cleanString })
        ) {
          // Calculate positions for originalMatch (includes quotes)
          const originalPosition = this.getPositionInfo(
            content,
            stringIndex,
            stringIndex + str.length
          );
          
          // Calculate positions for text content (excludes quotes)
          const textStart = stringIndex + 1; // Skip opening quote
          const textEnd = stringIndex + str.length - 1; // Skip closing quote
          const textPosition = this.getPositionInfo(
            content,
            textStart,
            textEnd
          );
          
          strings.push({
            text: cleanString.replace(/\n/, '').trim(),
            type: 'string',
            context: contextType,
            lineNumber: textPosition.lineNumber,
            startPosition: textPosition.columnStart,
            endPosition: textPosition.columnEnd,
            columnStart: textPosition.columnStart,
            columnEnd: textPosition.columnEnd,
            absoluteStart: textPosition.absoluteStart,
            absoluteEnd: textPosition.absoluteEnd,
            originalStartPosition: originalPosition.columnStart,
            originalEndPosition: originalPosition.columnEnd,
            originalAbsoluteStart: originalPosition.absoluteStart,
            originalAbsoluteEnd: originalPosition.absoluteEnd,
            originalMatch: str,
          });
        }
      }
    });

    return strings;
  }

  /**
   * Check if a string at given position is an HTML attribute value
   */
  isHtmlAttributeValue(content: string, stringIndex: number) {
    // Get context around the string (200 chars before and after)
    const contextStart = Math.max(0, stringIndex - 200);
    const contextEnd = Math.min(content.length, stringIndex + 200);
    const context = content.substring(contextStart, contextEnd);
    const relativeIndex = stringIndex - contextStart;

    // Look for attribute pattern: attributeName="value" or attributeName='value'
    // Pattern should be: word characters followed by = followed by quote
    const beforeString = context.substring(0, relativeIndex);
    const afterQuote = context.substring(relativeIndex + 1); // Skip the opening quote

    // Find the last occurrence of = before our string
    const lastEquals = beforeString.lastIndexOf('=');
    if (lastEquals === -1) return false;

    // Check if there's an attribute name before the =
    const beforeEquals = beforeString.substring(0, lastEquals).trim();
    const attributeMatch = beforeEquals.match(/([\w-]+)\s*$/); // Allow dashes in attribute names
    if (!attributeMatch) return false;

    const attributeName = attributeMatch[1].toLowerCase();

    // Check if there's a closing quote after our string
    const quote = content[stringIndex]; // " or '
    const closingQuoteIndex = afterQuote.indexOf(quote);
    if (closingQuoteIndex === -1) return false;

    // Additional check: make sure this looks like JSX/HTML (has < > nearby)
    const hasHtmlTags = /<[^>]*>/.test(context);

    return (
      hasHtmlTags &&
      // Common HTML/JSX attributes that should be filtered
      (/^(class|classname|id|style|src|href|type|name|role|aria-\w+|data-\w+|key|ref|onclick|onchange|value|checked|disabled|readonly|placeholder|title|alt)$/i.test(
        attributeName
      ) ||
        // Common JSX event handlers
        /^on[A-Z]/.test(attributeName) ||
        // Vue.js directives
        /^(v-|:)/.test(attributeName) ||
        // Additional pattern matching for compound attribute names
        attributeName.includes('-') || // kebab-case attributes like data-position
        attributeName.toLowerCase().startsWith('data')) // data attributes
    );
  }

  /**
   * Check if a string at given position is inside a function call
   */
  isInsideFunctionCall(content: string, stringIndex: number) {
    // Look back from the string position to find function call patterns
    const searchStart = Math.max(0, stringIndex - 300);
    const beforeContent = content.substring(searchStart, stringIndex);
    
    // Find all opening parentheses positions in the before content
    const openParenPositions = [];
    for (let i = beforeContent.length - 1; i >= 0; i--) {
      if (beforeContent[i] === '(') {
        // Check if this is part of a function call
        const beforeParen = beforeContent.substring(0, i).trim();
        
        // Function call patterns:
        // 1. functionName(
        // 2. object.method(
        // 3. object.method.chain(
        // 4. array[index](
        if (/(\w+(\.\w+)*|\]\s*)$/.test(beforeParen)) {
          openParenPositions.push(searchStart + i);
        }
      }
    }
    
    // For each opening parenthesis, check if our string is inside that function call
    for (const openParenPos of openParenPositions) {
      // Find the matching closing parenthesis
      let parenCount = 1;
      let closingParenPos = null;
      
      for (let i = openParenPos + 1; i < content.length && parenCount > 0; i++) {
        if (content[i] === '(') parenCount++;
        else if (content[i] === ')') {
          parenCount--;
          if (parenCount === 0) {
            closingParenPos = i;
            break;
          }
        }
      }
      
      // Check if our string is between the opening and closing parentheses
      if (closingParenPos && stringIndex > openParenPos && stringIndex < closingParenPos) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Extract meaningful strings from JavaScript code, ignoring console functions and other debug/log statements
   */
  extractMeaningfulStrings(content: string) {
    return this.extractMeaningfulStringsWithPosition(content, 'html').map(
      (item) => item.text
    );
  }

  /**
   * Parse Vue files
   */
  parseVueFile(content: string) {
    const result = {
      htmlText: [] as ExtractedText[],
      naturalLanguageAttributes: [] as ExtractedText[],
      strings: [] as ExtractedText[],
    };

    // Extract template section
    const templateMatch = content.match(
      /<template[^>]*>([\s\S]*?)<\/template>/i
    );
    if (templateMatch) {
      const templateContent = templateMatch[1];
      const templateStart =
        content.indexOf(templateMatch[0]) +
        templateMatch[0].indexOf(templateContent);

      const htmlResult = this.parseHtmlContent(templateContent, false, 0, undefined, 'vue');

      // Adjust positions for template content
      htmlResult.htmlText.forEach((item) => {
        item.absoluteStart += templateStart;
        item.absoluteEnd += templateStart;
        result.htmlText.push(item);
      });

      htmlResult.naturalLanguageAttributes.forEach((item) => {
        item.absoluteStart += templateStart;
        item.absoluteEnd += templateStart;
        result.naturalLanguageAttributes.push(item);
      });
    }

    // Extract script section
    const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    if (scriptMatch) {
      const scriptContent = scriptMatch[1];
      const scriptTagStart = content.indexOf(scriptMatch[0]);
      const scriptContentStart =
        scriptTagStart + scriptMatch[0].indexOf(scriptContent);

      // Use the full JavaScript parsing logic for script content
      const jsResult = this.parseJavaScriptTypeFiles(scriptContent);
      
      // Update position info for strings
      jsResult.strings.forEach((item) => {
        const originalPosition = this.getPositionInfo(
          content,
          item.absoluteStart + scriptContentStart,
          item.absoluteEnd + scriptContentStart
        );
        item.lineNumber = originalPosition.lineNumber;
        item.startPosition = originalPosition.startPosition;
        item.endPosition = originalPosition.endPosition;
        item.absoluteStart += scriptContentStart;
        item.absoluteEnd += scriptContentStart;
        result.strings.push(item);
      });

      // Translation key handling disabled
      // No longer processing translation keys from script content
    }

    return result;
  }

  /**
   * Parse HTML files
   */
  parseHtmlFile(content: string) {
    const result = {
      htmlText: [] as ExtractedText[],
      naturalLanguageAttributes: [] as ExtractedText[],
      strings: [] as ExtractedText[],
    };

    // First parse HTML content (excluding script/style)
    const htmlResult = this.parseHtmlContent(content, false, 0, undefined, 'html');
    result.htmlText.push(...htmlResult.htmlText);
    result.naturalLanguageAttributes.push(
      ...htmlResult.naturalLanguageAttributes
    );

    // Extract script sections (like in Vue parsing)
    const scriptMatches = content.matchAll(
      /<script[^>]*>([\s\S]*?)<\/script>/gi
    );
    for (const scriptMatch of scriptMatches) {
      const scriptContent = scriptMatch[1];
      const scriptTagStart = content.indexOf(scriptMatch[0]);
      const scriptContentStart =
        scriptTagStart + scriptMatch[0].indexOf(scriptContent);

      const jsStrings =
        this.extractMeaningfulStringsWithPosition(scriptContent, 'javascript');
      jsStrings.forEach((item) => {
        // Update position info to reflect the original file positions
        const originalPosition = this.getPositionInfo(
          content,
          item.absoluteStart + scriptContentStart,
          item.absoluteEnd + scriptContentStart
        );
        item.lineNumber = originalPosition.lineNumber;
        item.startPosition = originalPosition.startPosition;
        item.endPosition = originalPosition.endPosition;
        item.columnStart = originalPosition.columnStart;
        item.columnEnd = originalPosition.columnEnd;
        item.absoluteStart += scriptContentStart;
        item.absoluteEnd += scriptContentStart;
        result.strings.push(item);
      });
    }

    return result;
  }

  /**
   * Parse HTML content with position information
   */
  parseHtmlContent(
    content: string,
    isJSX = false,
    contentOffset = 0,
    originalContent?: string,
    contextType: 'html' | 'vue' = 'html'
  ) {
    const result = {
      htmlText: [] as ExtractedText[],
      naturalLanguageAttributes: [] as ExtractedText[],
    };

    // Natural language attributes to extract
    const naturalLanguageAttrs = [
      'placeholder',
      'title',
      'alt',
      'aria-label',
      'label',
      'value',
      'aria-description',
      'aria-labelledby',
      'data-tooltip',
      'data-title',
      'data-description',
      'data-placeholder',
      'data-label',
    ];

    // For position calculation, we need to use the original content
    // But for text extraction, we can still filter out script/style content
    const cleanContent = content
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '');

    // Find HTML text content with position - but calculate positions from original content
    const textMatches = [...content.matchAll(/>([^<]*?)</gs)];
    textMatches.forEach((match) => {
      let text = match[1]
        .trim()
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/\n/g, ' '); // Replace newlines with spaces

      if (text && text.length > 0 && !this.isNonTextualContent({ text })) {
        // Check if this match is inside script or style tags by looking at tag structure
        const matchStart = match.index;
        const beforeMatchIncludeTag = content.substring(0, matchStart + 1); // Include the opening >

        // Count opening and closing script/style tags before this match
        const scriptOpenCount = (
          beforeMatchIncludeTag.match(/<script\b[^>]*>/gi) || []
        ).length;
        const scriptCloseCount = (
          beforeMatchIncludeTag.match(/<\/script>/gi) || []
        ).length;
        const styleOpenCount = (
          beforeMatchIncludeTag.match(/<style\b[^>]*>/gi) || []
        ).length;
        const styleCloseCount = (
          beforeMatchIncludeTag.match(/<\/style>/gi) || []
        ).length;

        const isInScriptTag = scriptOpenCount > scriptCloseCount;
        const isInStyleTag = styleOpenCount > styleCloseCount;

        if (!isInScriptTag && !isInStyleTag) {
          // For JSX, skip content that contains JSX expressions (curly braces)
          const isJSXExpression =
            isJSX && (text.includes('{') || text.includes('}'));

          // For Vue, skip template expressions like {{ $t('key') }} and Vue directives
          const isVueTemplateExpression =
            text.includes('{{') && text.includes('}}');
          
          // For Vue, skip content that contains Vue directives (starting with :)
          const containsVueDirectives = text.includes(':') && /:\w+\s*=/.test(text);
          
          // Skip content that looks like JavaScript code (function calls, object properties, etc.)
          const looksLikeJavaScript = 
            /\w+\([^)]*\)/.test(text) || // function calls like func()
            /\w+\.\w+/.test(text) || // object property access like obj.prop
            /\w+:\s*['"]/.test(text) || // object properties like key: 'value'
            text.includes('=>') || // arrow functions
            text.includes('function') || // function declarations
            /\$t\(/.test(text); // Vue i18n function calls

          if (!isJSXExpression && !isVueTemplateExpression && !containsVueDirectives && !looksLikeJavaScript) {
            // Keep the text as is, don't split into sentences
            // Use original content for position calculation if provided (for JSX), otherwise use current content
            const contentForPosition = originalContent || content;
            
            // Calculate positions for originalMatch (includes > and <)
            const originalStart = match.index + contentOffset;
            const originalEnd = match.index + match[0].length + contentOffset;
            const originalPosition = this.getPositionInfo(
              contentForPosition,
              originalStart,
              originalEnd
            );
            
            // For text positions, we need to find where the actual text starts (skip whitespace/newlines)
            const fullTextContent = match[1]; // The content between > and < (original, unprocessed)
            const trimmedText = fullTextContent.trim();
            
            // Find the start of the actual text content (skip leading whitespace)
            const textContentStart = match.index + 1 + fullTextContent.indexOf(trimmedText) + contentOffset;
            
            // For columnEnd, use the trimmed text length (without leading/trailing whitespace but keeping internal \n, \t)
            // Calculate the line and column where the text starts
            const beforeTextStart = contentForPosition.substring(0, textContentStart);
            const linesBeforeText = beforeTextStart.split('\n');
            const textStartLine = linesBeforeText.length;
            const textStartColumn = linesBeforeText[linesBeforeText.length - 1].length;
            
            // Use the trimmed text length (keeps internal whitespace like \n, \t but removes leading/trailing)
            const trimmedTextLength = trimmedText.length;
            const textEndColumn = textStartColumn + trimmedTextLength;
            
            const textPosition = {
              lineNumber: textStartLine,
              columnStart: textStartColumn,
              columnEnd: textEndColumn,
              absoluteStart: textContentStart,
              absoluteEnd: textContentStart + trimmedTextLength,
            };
            
            result.htmlText.push({
              text: text.replace(/\n/, '').trim(),
              type: 'htmlText',
              context: contextType,
              lineNumber: textPosition.lineNumber,
              startPosition: textPosition.columnStart,
              endPosition: textPosition.columnEnd,
              columnStart: textPosition.columnStart,
              columnEnd: textPosition.columnEnd,
              absoluteStart: textPosition.absoluteStart,
              absoluteEnd: textPosition.absoluteEnd,
              originalStartPosition: originalPosition.columnStart,
              originalEndPosition: originalPosition.columnEnd,
              originalAbsoluteStart: originalPosition.absoluteStart,
              originalAbsoluteEnd: originalPosition.absoluteEnd,
              originalMatch: match[0],
            });
          }
        }
      }
    });

    // Extract natural language attributes with position
    naturalLanguageAttrs.forEach((attrName) => {
      // Create pattern that matches both regular attributes and Vue bindings
      const attrPattern = new RegExp(
        `(:|^|\\s)(${attrName})\\s*=\\s*["']([^"']+)["']`,
        'gi'
      );
      const attrMatches = [...content.matchAll(attrPattern)];

      attrMatches.forEach((match) => {
        const prefix = match[1]; // Could be ':', '^', or whitespace
        const attributeName = match[2];
        const attributeValue = match[3].trim();
        const fullMatch = match[0];
        const matchStart = match.index;

        // Skip Vue.js dynamic bindings (attributes starting with :)
        const isVueBinding = prefix === ':';

        // For JSX, check if the attribute value contains JSX expressions (curly braces)
        const isJSXExpression =
          isJSX &&
          (attributeValue.includes('{') || attributeValue.includes('}'));

        if (
          !isVueBinding &&
          !isJSXExpression &&
          attributeValue &&
          attributeValue.length > 0 &&
          !this.isNonTextualContent({ text: attributeValue, isAttribute: true })
        ) {
          // Use original content for position calculation if provided (for JSX), otherwise use current content
          const contentForPosition = originalContent || content;
          
          // Calculate positions for originalMatch (full attribute="value")
          const originalStart = match.index + contentOffset;
          const originalEnd = match.index + fullMatch.length + contentOffset;
          const originalPosition = this.getPositionInfo(
            contentForPosition,
            originalStart,
            originalEnd
          );
          
          // Calculate positions for attribute value text (inside quotes)
          const valueStart = fullMatch.indexOf('"') + 1; // Find opening quote and skip it
          const valueEnd = fullMatch.lastIndexOf('"'); // Find closing quote
          const textStart = match.index + valueStart + contentOffset;
          const textEnd = match.index + valueEnd + contentOffset;
          const textPosition = this.getPositionInfo(
            contentForPosition,
            textStart,
            textEnd
          );
          
          result.naturalLanguageAttributes.push({
            text: attributeValue.replace(/\n/, '').trim(),
            type: 'attribute',
            context: contextType,
            attribute: attributeName, // Use the actual attribute name from the match
            lineNumber: textPosition.lineNumber,
            startPosition: textPosition.columnStart,
            endPosition: textPosition.columnEnd,
            columnStart: textPosition.columnStart,
            columnEnd: textPosition.columnEnd,
            absoluteStart: textPosition.absoluteStart,
            absoluteEnd: textPosition.absoluteEnd,
            originalStartPosition: originalPosition.columnStart,
            originalEndPosition: originalPosition.columnEnd,
            originalAbsoluteStart: originalPosition.absoluteStart,
            originalAbsoluteEnd: originalPosition.absoluteEnd,
            originalMatch: fullMatch,
          });
        }
      });
    });

    return result;
  }

  /**
   * Get position information for a match
   */
  getPositionInfo(content: string, startIndex: number, endIndex: number): PositionInfo {
    const beforeMatch = content.substring(0, startIndex);
    const lines = beforeMatch.split('\n');
    const lineNumber = lines.length;
    
    // Column should be 0-indexed within the line
    const columnStart = lines[lines.length - 1].length;
    
    // For columnEnd, calculate where the text would end if it were on a single line
    const matchLength = endIndex - startIndex;
    const columnEnd = columnStart + matchLength;

    return {
      lineNumber,
      startPosition: columnStart, // Legacy compatibility
      endPosition: columnEnd, // Legacy compatibility
      columnStart,
      columnEnd,
      absoluteStart: startIndex,
      absoluteEnd: endIndex,
    };
  }

  /**
   * Parse a directory recursively
   */
  parseDirectory(dirPath: string) {
    const results: ParsedResult[] = [];

    try {
      const items = fs.readdirSync(dirPath);

      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          // Skip node_modules, .git, and other common directories
          if (
            ![
              'node_modules',
              '.git',
              '.next',
              'dist',
              'build',
              '.vscode',
            ].includes(item)
          ) {
            results.push(...this.parseDirectory(fullPath));
          }
        } else if (stat.isFile()) {
          const result = this.parseFile(fullPath);
          if (result) results.push(result);
        }
      }
    } catch (error: any) {
      console.error(`Error reading directory ${dirPath}:`, error.message);
    }

    return results.filter(Boolean);
  }

  /**
   * Filter out empty or meaningless text
   */
  filterMeaningfulText(texts: any[]) {
    return texts
      .filter((text) => {
        if (!text || typeof text !== 'string') return false;

        // Remove empty strings and whitespace-only strings
        if (text.trim().length === 0) return false;

        // Remove very short strings (less than 2 characters)
        if (text.trim().length < 2) return false;

        // Remove common meaningless strings
        const meaninglessPatterns = [
          /^[0-9]+$/, // Only numbers
          /^[^a-zA-Z]*$/, // No letters
          /^(true|false|null|undefined)$/i,
          /^(div|span|p|h[1-6]|img|a|li|ul|ol)$/i, // HTML tags
          /^[\s\n\r\t]+$/, // Only whitespace
        ];

        return !meaninglessPatterns.some((pattern) =>
          pattern.test(text.trim())
        );
      })
      .map((text) => text.trim());
  }

  /**
   * Generate a summary report
   */
  generateSummary(results: ParsedResult[]) {
    const summary: Summary = {
      totalFiles: results.length,
      fileTypes: {},
      totalTexts: 0,
      textTypes: {
        htmlText: 0,
        naturalLanguageAttributes: 0,
        strings: 0,
      },
      allTexts: [],
    };

    results.forEach((result) => {
      // Count file types
      const ext = result.extension;
      summary.fileTypes[ext] = (summary.fileTypes[ext] || 0) + 1;

      // Collect all texts with position information
      (Object.keys(result.extractedText) as (keyof typeof result.extractedText)[]).forEach((textType) => {
        const texts = result.extractedText[textType];
        if (Array.isArray(texts)) {
          (summary.textTypes as any)[textType] =
            ((summary.textTypes as any)[textType] || 0) + texts.length;
          summary.totalTexts += texts.length;

          texts.forEach((textItem) => {
            if (typeof textItem === 'object' && textItem.text) {
              summary.allTexts.push({
                ...textItem,
                file: result.fileName,
                filePath: result.filePath,
              });
            }/*  else {
              // Backward compatibility for old format
              summary.allTexts.push({
                text: (textItem as any)?.replace(/\n/, '')?.trim(),
                type: textType,
                file: result.fileName,
                filePath: result.filePath,
              });
            } */
          });
        }
      });
    });

    // Sort allTexts by lineNumber first, then by startPosition
    summary.allTexts.sort((a, b) => {      
      if ((a?.lineNumber ?? 0) !== (b?.lineNumber ?? 0)) {
        return (a?.lineNumber ?? 0) - (b?.lineNumber ?? 0);
      }
      return (a?.startPosition ?? 0) - (b?.startPosition ?? 0);
    });

    return summary;
  }

  /**
   * Export results to JSON file
   */
  exportToJson(results: ParsedResult[], outputPath: string) {
    const summary = this.generateSummary(results);
    const output = {
      metadata: {
        timestamp: new Date().toISOString(),
        totalFiles: results.length,
        supportedExtensions: this.supportedExtensions,
      },
      summary,
      detailedResults: results,
    };

    try {
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`Created directory: ${outputDir}`);
      }
      
      fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
      console.log(`Results exported to: ${outputPath}`);
    } catch (error: any) {
      console.error(`Error writing to file: ${error.message}`);
    }
  }

  /**
   * Export meaningful texts to a simple text file
   */
  exportToText(results: ParsedResult[], outputPath: string) {
    const summary = this.generateSummary(results);
    let content = `Document Parser Results\n`;
    content += `======================\n\n`;
    content += `Total Files Processed: ${summary.totalFiles}\n`;
    content += `Total Meaningful Texts Found: ${summary.totalTexts}\n\n`;

    content += `File Types:\n`;
    Object.keys(summary.fileTypes).forEach((ext) => {
      content += `  ${ext}: ${summary.fileTypes[ext]} files\n`;
    });

    content += `\nText Types:\n`;
    (Object.keys(summary.textTypes) as (keyof typeof summary.textTypes)[]).forEach((type) => {
      content += `  ${type}: ${summary.textTypes[type]} items\n`;
    });

    content += `\n\nAll Meaningful Texts with Position Info:\n`;
    content += `========================================\n\n`;

    summary.allTexts.forEach((item, index) => {
      let line = `${index + 1}. [${item.type}] ${item.file}`;

      if (item.lineNumber) {
        line += ` (Line: ${item.lineNumber}, Pos: ${item.startPosition}-${item.endPosition})`;
      }

      if (item.attribute) {
        line += ` [${item.attribute}]`;
      }

      line += `: "${item.text}"`;

      if (item.originalMatch && item.originalMatch !== item.text) {
        line += ` | Original: ${item.originalMatch}`;
      }

      content += line + '\n';
    });

    try {
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`Created directory: ${outputDir}`);
      }
      
      fs.writeFileSync(outputPath, content, 'utf8');
      console.log(`Text results exported to: ${outputPath}`);
    } catch (error: any) {
      console.error(`Error writing to file: ${error.message}`);
    }
  }
}

export default DocumentParser;
