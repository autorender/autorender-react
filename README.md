# Autorender React SDK

[![npm version](https://img.shields.io/npm/v/@autorender/react)](https://www.npmjs.com/package/@autorender/react)
[![CI](https://github.com/autorender/autorender-react/workflows/CI/badge.svg)](https://github.com/autorender/autorender-react/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Follow on X](https://img.shields.io/twitter/follow/AutoRenderHQ?label=Follow&style=social)](https://x.com/AutoRenderHQ)

## Introduction

Autorender React SDK provides a simple way to integrate Autorender with your React applications. It allows you to:

- Upload files with a fully-featured, customizable upload widget (`<AutorenderUploader>`)
- Serve optimized images with automatic format selection, responsive sizes, and real-time transformations (`<ARImage>`, `<AutoRenderProvider>`)
- Stream video with HLS and DASH support via an optional Video.js integration (`<ARVideo>`)

## TypeScript support

The SDK is written in TypeScript with full type definitions included. No additional `@types` packages needed.

> **Browser-only:** The upload widget and ViewTag components use browser APIs. In Next.js App Router, import from `@autorender/react` or `@autorender/react/viewtag` (both include `'use client'`). In other SSR setups, render inside `useEffect` or a client boundary.

## Installation

```bash
npm install @autorender/react
```

## Authentication

- **Upload API key**: Required for the upload widget. Never hardcode it in source — use an environment variable (e.g. `REACT_APP_AUTORENDER_KEY` for CRA, `VITE_AUTORENDER_KEY` for Vite) loaded at build time. Scope and rotate keys in the Autorender dashboard.
- **Workspace**: The `workspace` value is not secret; it appears in public image URLs.
- **ViewTag (ARImage / AutoRenderProvider)**: No API key required — image delivery is public CDN.

## Upload SDK Usage

```tsx
import { AutorenderUploader } from '@autorender/react';
import '@autorender/react/styles';

function App() {
  return (
    <AutorenderUploader
      apiKey={process.env.REACT_APP_AUTORENDER_KEY}
      type="inline"
      allowMultiple
      theme="system"
      sources={['local', 'camera']}
      onSuccess={({ files }) => console.log('Uploaded', files)}
    />
  );
}
```

## ViewTag SDK Usage

### ARImage & AutoRenderProvider

`AutoRenderProvider` creates a shared `createAR()` instance for the React tree. Child components use `ARImage`, `ARVideo`, or `useAutoRender()`.

**Lazy loading:** `ARImage` sets `loading="lazy"` by default (`lazy={true}`). Pass `lazy={false}` for above-the-fold images.

**Automatic optimizations** (via provider defaults and `enableDPR`):

- **Format** — `defaults={{ f: 'auto' }}` picks AVIF, WebP, or JPEG based on browser support
- **DPR** — `enableDPR={true}` (default) injects `dpr_2` on high-DPI displays
- **Quality** — `defaults={{ q: 'auto' }}` adjusts quality from connection type (2g/3g/4g)

See [ViewTag API reference](https://autorender.io/docs) in `@autorender/js` for details.

### Setup Provider

```tsx
import { AutoRenderProvider } from '@autorender/react/viewtag';

function App() {
  return (
    <AutoRenderProvider
      baseUrl="https://assets.autorender.io"
      workspace="ws_123"
      defaults={{}}
    >
      <YourComponents />
    </AutoRenderProvider>
  );
}
```

### Use ARImage Component

```tsx
import { ARImage } from '@autorender/react/viewtag';

function ProductImage() {
  return (
    <ARImage
      src="products/shoe.jpg"
      width={400}
      height={400}
      alt="Shoe"
      transformations={{
        fit: 'cover',
      }}
      responsive={true}
      lazy={true}
      sizes="(min-width: 800px) 50vw, 100vw"
    />
  );
}
```

### Use ARVideo Component (Video.js)

Install `video.js` when you use `<ARVideo>` (optional peer dependency — upload-only apps do not need it):

```bash
npm install video.js
```

Import ViewTag components from `@autorender/react/viewtag`:

```tsx
import { ARVideo } from '@autorender/react/viewtag';

function ProductVideo() {
  return (
    <ARVideo
      src="docs/skateboarding.mp4"
      width={720}
      height={405}
      controls
      preload="metadata"
      transformations={{ w: 720, h: 405 }}
    />
  );
}
```

Supports MP4, HLS (`.m3u8`), and DASH (`.mpd`) sources.

### Common video transformations

Some transforms produce an image (thumbnail, GIF) — use `<ARImage>` for those instead of `<ARVideo>`.

```tsx
// Thumbnail frame — use ARImage, not ARVideo
<ARImage
  src="docs/skateboarding.mp4"
  width={320}
  height={220}
  alt="Thumbnail"
  transformations={{ thumb_ar: true }}
/>

// Animated GIF — use ARImage
<ARImage
  src="docs/skateboarding.mp4"
  width={320}
  height={220}
  alt="GIF preview"
  transformations={{ f: 'gif' }}
/>

// Trim a clip (2s – 8s)
<ARVideo
  src="docs/skateboarding.mp4"
  width={720}
  height={405}
  controls
  transformations={{ so: 2, eo: 8 }}
/>

// Pad to 16:9 with white background
<ARVideo
  src="docs/skateboarding.mp4"
  width={720}
  height={405}
  controls
  transformations={{ ar: '16:9', cm_pad_resize: true, bg: 'white' }}
/>
```


### Use AR Instance Directly

```tsx
import { useAutoRender } from '@autorender/react/viewtag';

function MyComponent() {
  const AR = useAutoRender();
  
  const url = AR.url('image.jpg', { w: 300, h: 300, fit: 'cover' });
  const transformString = AR.transformString({ w: 300, h: 300 });
  const dpr = AR.getDPR();
    
  // Generate responsive attributes
  const attrs = AR.responsiveImageAttributes({
    src: 'hero.jpg',
    width: 1200,
    sizes: '(min-width: 800px) 50vw, 100vw',
    transform: { fit: 'cover' }
  });
  
  return (
    <img
      src={attrs.src}
      srcSet={attrs.srcSet}
      sizes={attrs.sizes}
      width={attrs.width}
      alt="Image"
    />
  );
}
```

## API Reference

### `<AutorenderUploader />`

React component that wraps the uploader.

**Props:** All `CreateUploaderOptions` except `target` (automatically handled).

### `<AutoRenderProvider />`

React Context Provider that makes AR instance available to child components.

**Props:**
- `baseUrl?: string` - Base URL (default: `'https://assets.autorender.io'`)
- `workspace: string` - Your workspace ID
- `defaults?: { f?: string, q?: string | number }` - Default transformations
- `deviceBreakpoints?: number[]` - Device breakpoints for responsive images
- `imageBreakpoints?: number[]` - Image breakpoints for responsive images
- `enableDPR?: boolean` - Enable device pixel ratio (default: `true`)
- `enableResponsive?: boolean` - Enable responsive images (default: `true`)

### `<ARImage />`

React component that wraps `<img>` with AutoRender transformations.

**Props:**
- `src: string` - Image source path (required)
  - Supports workspace paths (e.g., `products/shoe.jpg`) and absolute remote URLs (e.g., `https://example.com/image.jpg`).
- `width?: number` - Image width in pixels
- `height?: number` - Image height in pixels
- `transformations?: TransformOptions` - Transformation options (see below)
- `responsive?: boolean` - Enable responsive images (default: `true`)
- `lazy?: boolean` - Enable lazy loading (default: `true`)
- `sizes?: string` - Sizes attribute for responsive images (e.g., `"(min-width: 800px) 50vw, 100vw"`)
- All standard `<img>` HTML attributes are forwarded (e.g., `alt`, `className`, `style`, `onClick`, etc.)

### `useAutoRender(): ARInstance`

Hook to access the AR instance from context.

**Returns:** `ARInstance` with methods:
- `url(src: string, transform?: TransformOptions): string` - Generate image URL
- `transformString(transform: TransformOptions): string` - Get transformation string only
- `responsiveImageAttributes(options: ResponsiveOptions): ResponsiveAttributes` - Generate responsive image attributes
- `getDPR(): number` - Get device pixel ratio

### `useAutorenderUploader(options)`

Hook that returns a ref to the uploader instance.

## Documentation

See the [full documentation](https://autorender.io/docs) for the complete API reference, including all `TransformOptions` parameters (crop, effects, layers, and more).
