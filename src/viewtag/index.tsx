'use client';

// `ARVideo` is deliberately absent — it lives at '@autorender/react/viewtag/video'
// so that image-only apps never pull `video.js` into their module graph. See
// ../video-entry.ts.
export { AutoRenderProvider, useAutoRender } from '../provider/AutoRenderProvider';
export { ARImage } from '../components/ARImage';
export type { AutoRenderProviderProps } from '../provider/AutoRenderProvider';
export type { ARImageProps } from '../components/ARImage';
