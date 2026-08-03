import { defineConfig } from 'tsup';
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';

const _require = createRequire(import.meta.url);

export default defineConfig({
  entry: {
    index: 'src/index.tsx',
    viewtag: 'src/viewtag/index.tsx',
    'viewtag-video': 'src/video-entry.ts',
  },
  splitting: false,
  clean: true,
  sourcemap: true,
  format: ['esm', 'cjs'],
  dts: true,
  minify: false,
  target: 'es2020',
  external: [
    'react',
    'react-dom',
    '@autorender/js',
    '@autorender/js/viewtag',
    '@autorender/js/viewtag/load-videojs',
    'video.js',
  ],
  jsx: 'react-jsx',
  onSuccess: async () => {
    const coreStyles = resolve(dirname(_require.resolve('@autorender/js/package.json')), 'dist/styles.css');
    const targetDir = resolve(__dirname, 'dist');
    const target = resolve(targetDir, 'styles.css');
    try {
      mkdirSync(targetDir, { recursive: true });
      copyFileSync(coreStyles, target);
      console.log('Copied styles.css to dist/');
    } catch (error) {
      console.error('Failed to copy styles.css', error);
    }
  },
});
