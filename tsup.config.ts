import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  // Node 18 en adelante: fetch y crypto nativos, sin dependencias.
  target: 'node18',
  // .js (ESM) y .cjs (CommonJS): sirve igual en NestJS, Express, Next o un script.
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs' : '.js' };
  },
});
