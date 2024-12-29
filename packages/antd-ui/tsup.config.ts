import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src'],
  dts: true,
  splitting: false,
  sourcemap: false,
  clean: true,
  format: ['esm'],
  outDir: 'es',
  external: [
    'react',
    'react-dom'
  ],
  treeshake: true,
  minify: true
});
