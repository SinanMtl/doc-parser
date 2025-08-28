import { defineConfig } from 'vite';
import dts from "vite-plugin-dts";
import { resolve } from 'path';
import { minifyPublicJsPlugin } from './plugins/minifyPublicJs';

export default defineConfig({
  build: {
    lib: {
      entry: {
        'document-parser': resolve(__dirname, 'src/document-parser.ts'),
        'parse-cli': resolve(__dirname, 'src/parse-cli.ts'),
        'string-replace': resolve(__dirname, 'src/string-replace.ts')
      },
      formats: ['es']
    },
    outDir: 'dist',
    rollupOptions: {
      external: ['fs', 'path', 'process'],
      output: {
        preserveModules: false,
        entryFileNames: '[name].js',
        format: 'es',
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  plugins: [
    dts(),
    minifyPublicJsPlugin()
  ]
});
