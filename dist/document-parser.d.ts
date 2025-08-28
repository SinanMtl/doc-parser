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
export declare class DocumentParser {
    supportedExtensions: string[];
    extractedTexts: ExtractedText[];
    constructor();
    /**
     * Check if text content is likely non-textual (like code, URLs, etc.)
     */
    isNonTextualContent(payload: {
        text: string;
        isAttribute?: boolean;
        isJS?: boolean;
    }): boolean;
    getFileExtension(fileName: string): string;
    /**
     * Parse a single file and extract meaningful text
     */
    parseFile(filePath: string): ParsedResult | null;
    /**
     * Parse content and extract meaningful text
     */
    parseContent(content: string, extension: string, params?: ParseContentParams): ParsedResult | null;
    /**
     * Extract text based on file type
     */
    extractTextByType(content: string, extension: string): {
        strings: ExtractedText[];
    };
    /**
     * Parse JavaScript/TypeScript files
     */
    parseJavaScriptTypeFiles(content: string): {
        strings: ExtractedText[];
    };
    /**
     * Parse JSX/TSX files - combines JavaScript parsing with HTML content extraction
     */
    parseJSXFile(content: string): {
        strings: ExtractedText[];
        classNames: string[];
        ids: string[];
    };
    /**
     * Extract JavaScript strings while excluding JSX ranges
     */
    extractJavaScriptStringsExcludingJSX(content: string, jsxRanges: {
        start: number;
        end: number;
    }[], contextType?: 'javascript' | 'html' | 'vue'): ExtractedText[];
    /**
     * Mask regex patterns in the string with asterisks and mask comments with spaces
     * to prevent misleading parsing.
     */
    escapeRegExp(str: string): string;
    /**
     * Extract meaningful strings from JavaScript code with position information
     */
    extractMeaningfulStringsWithPosition(content: string, contextType?: 'javascript' | 'html' | 'vue'): ExtractedText[];
    /**
     * Check if a string at given position is an HTML attribute value
     */
    isHtmlAttributeValue(content: string, stringIndex: number): boolean;
    /**
     * Check if a string at given position is inside a function call
     */
    isInsideFunctionCall(content: string, stringIndex: number): boolean;
    /**
     * Extract meaningful strings from JavaScript code, ignoring console functions and other debug/log statements
     */
    extractMeaningfulStrings(content: string): string[];
    /**
     * Parse Vue files
     */
    parseVueFile(content: string): {
        htmlText: ExtractedText[];
        naturalLanguageAttributes: ExtractedText[];
        strings: ExtractedText[];
    };
    /**
     * Parse HTML files
     */
    parseHtmlFile(content: string): {
        htmlText: ExtractedText[];
        naturalLanguageAttributes: ExtractedText[];
        strings: ExtractedText[];
    };
    /**
     * Parse HTML content with position information
     */
    parseHtmlContent(content: string, isJSX?: boolean, contentOffset?: number, originalContent?: string, contextType?: 'html' | 'vue'): {
        htmlText: ExtractedText[];
        naturalLanguageAttributes: ExtractedText[];
    };
    /**
     * Get position information for a match
     */
    getPositionInfo(content: string, startIndex: number, endIndex: number): PositionInfo;
    /**
     * Parse a directory recursively
     */
    parseDirectory(dirPath: string): ParsedResult[];
    /**
     * Filter out empty or meaningless text
     */
    filterMeaningfulText(texts: any[]): any[];
    /**
     * Generate a summary report
     */
    generateSummary(results: ParsedResult[]): Summary;
    /**
     * Export results to JSON file
     */
    exportToJson(results: ParsedResult[], outputPath: string): void;
    /**
     * Export meaningful texts to a simple text file
     */
    exportToText(results: ParsedResult[], outputPath: string): void;
}
export default DocumentParser;
//# sourceMappingURL=document-parser.d.ts.map