#!/usr/bin/env node
interface CliOptions {
    target: string | null;
    outputJson: string | null;
    outputText: string | null;
    showHelp: boolean;
}
declare function showUsage(): void;
declare function parseArgs(args: string[]): CliOptions;
declare function main(): void;
export { main, parseArgs, showUsage };
//# sourceMappingURL=parse-cli.d.ts.map