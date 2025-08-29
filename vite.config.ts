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
      }
    },
    outDir: 'dist',
    rollupOptions: {
      external: ['fs', 'path', 'process'],
      output: [
        {
          format: 'es',
          entryFileNames: '[name].js',
          preserveModules: false,
          exports: 'named'
        },
        {
          format: 'cjs',
          entryFileNames: '[name].cjs',
          preserveModules: false,
          exports: 'named'
        }
      ]
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
