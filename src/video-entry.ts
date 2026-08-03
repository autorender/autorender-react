'use client';

/**
 * `ARVideo` ships on its own entry point so that `video.js` stays a genuinely
 * optional peer dependency.
 *
 * It cannot live in the `/viewtag` barrel: `ARVideo` statically imports the
 * Video.js loader, and a bundler resolves every specifier in a module graph at
 * build time — including the ones behind a lazy `import()`. Re-exporting it
 * alongside `ARImage` therefore makes an image-only app fail to build with
 * `Can't resolve 'video.js/dist/video-js.css'`, even though it renders no video
 * and `peerDependenciesMeta` marks the package optional.
 */
export { ARVideo } from './components/ARVideo';
export type { ARVideoProps } from './components/ARVideo';
