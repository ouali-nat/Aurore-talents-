import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  appType: 'mpa',
  input: {
    main: resolve(import.meta.dirname, 'index.html'),
    diagnostic: resolve(import.meta.dirname, 'diagnostic.html')
  }
});
