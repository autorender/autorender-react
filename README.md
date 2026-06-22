# @autorender/react

Autorender SDK adapter for React - Upload and ViewTag functionality.

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

See [ViewTag API reference](https://autorender.mintlify.app) in `@autorender/js` for details.

### Setup Provider

```tsx
import { AutoRenderProvider } from '@autorender/react';

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
import { ARImage } from '@autorender/react';

function ProductImage() {
  return (
    <ARImage
      src="products/shoe.jpg"
      width={400}
      height={400}
      alt="Shoe"
      transformations={{
        fit: 'cover',
        // See TransformOptions below for all available options
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

### Complete Transform Example

```tsx
import { ARImage } from '@autorender/react';

function AdvancedImage() {
  return (
    <ARImage
      src="hero.jpg"
      width={1200}
      height={800}
      alt="Hero image"
      transformations={{
        // Size & Crop
        w: 1200,
        h: 800,
        fit: 'cover', // 'crop' | 'fill' | 'fit' | 'scale'
        ar: '16:9', // Aspect ratio
        position: 'center', // Position: 'p_c' | 'p_tl' | 'p_tr' | 'p_bl' | 'p_br' | 'p_t' | 'p_b' | 'p_l' | 'p_r' or full names
        position_startagy: 'attention', // User passes: 'entropy' | 'attention' (SDK generates ps_*)
        
        // Transform
        r: 0, // Rotation: number (0-360) | 'portrait' | 'landscape'
        z: 1.2, // Zoom level
        flip: 'h', // 'h' | 'v' | 'hv' | 'vh'
        br: 20, // Border radius in pixels
        
        // Format & Quality
        f: 'auto', // 'auto' | 'webp' | 'jpg' | 'png' | 'avif'
        q: 'auto', // 'auto' | 'auto:best' | number (1-100)
        
        // Background
        bg: 'rgb:FF5733', // Background color: 'rgb:RRGGBB' | 'white' | 'black'
        
        // DPR
        dpr: 2, // Device pixel ratio (0.1-10)
        
        // Effects
        improve: true, // Auto-enhancement: boolean | 'indoor' | 'outdoor' | { mode?: 'indoor' | 'outdoor', blend?: number }
        unsharpMask: 100, // Unsharp mask strength (1-2000)
        saturation: 20, // Saturation adjustment (-100 to 100)
        contrast: 15, // Contrast adjustment (-100 to 100)
        brightness: 10, // Brightness adjustment (-99 to 100)
        gamma: 0, // Gamma correction (-50 to 150)
        sharpen: 50, // Sharpen: boolean | number (1-2000)
        grayscale: false, // Convert to grayscale
        blackwhite: 50, // Black and white balance (0-100)
        hue: 0, // Hue rotation (-180 to 180)
        warmth: 0, // Warmth adjustment (-100 to 100)
        tint: 0, // Tint adjustment (-100 to 100)
        normalize: false, // Normalize histogram
        invert: false, // Invert colors
        fade: 0, // Fade effect (0-100)
        vignette: 0, // Vignette strength (0-100)
        highlights: 0, // Highlights adjustment (-100 to 100)
        shadows: 0, // Shadows adjustment (-100 to 100)
        exposure: 0, // Exposure adjustment (-100 to 100)
        structure: 0, // Structure/clarity (0-100)
        autoEnhance: false, // Auto enhance
        temperature: 0, // Temperature adjustment (-100 to 100)
        linear: '1:0', // Linear adjustment (a:b format)
        recomb: '', // Recombination matrix
        threshold: undefined, // Threshold: number | 'number:gray'
        convolve: '', // Convolution kernel matrix
        unflatten: false, // Unflatten layers
        flatten: false, // Flatten layers
        median: undefined, // Median filter (number)
        blur: 0, // Blur amount (0-20)
        extend: '', // Extend: 'top:right:bottom:left:color'
        affine: '', // Affine transform: 'a,b,c,d'
        extract: undefined, // Extract channel: 'red' | 'r' | 'green' | 'g' | 'blue' | 'b' | 'alpha' | 'a'
        ensureAlpha: false, // Ensure alpha channel
        removeAlpha: undefined, // Remove alpha: 'white' | 'black' | 'rgb:RRGGBB'
        
        // Layers
        layers: [
          {
            type: 'image',
            imagePath: 'logo.png',
            layerType: 'overlay', // 'overlay' | 'underlay'
            width: 200,
            height: 200,
            placement: 'north-east', // Use human-readable placement values
            x: 0, // X offset
            y: 0, // Y offset
            opacity: 100, // Opacity (0-100)
            rotation: 0, // Rotation in degrees
          },
          {
            type: 'text',
            text: 'Hello World',
            fontFamily: 'arial',
            fontSize: 24,
            fontStyle: 'bold', // 'bold' | 'italic' | 'underline'
            fontColor: 'FF0000', // Hex color without #
            placement: 'south',
            x: 0,
            y: -20,
            rotation: 0,
          }
        ],
        
        // Blend mode (for layers)
        blend: 'overlay', // 'screen' | 'overlay' | 'multiply' | 'mask' | 'anti_removal'
      }}
      responsive={true}
      lazy={true}
      sizes="(min-width: 1200px) 1200px, 100vw"
      className="product-image"
      style={{ maxWidth: '100%' }}
    />
  );
}
```

### Use AR Instance Directly

```tsx
import { useAutoRender } from '@autorender/react';

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

## TransformOptions Reference

All transformation parameters available in the `transformations` prop:

### Size & Crop
- `w?: number` - Width in pixels (can be decimal for relative sizing)
- `h?: number` - Height in pixels (can be decimal for relative sizing)
- `fit?: 'crop' | 'fill' | 'fit' | 'scale'` - Crop mode
- `ar?: string` - Aspect ratio (e.g., `"16:9"`, `"1:1"`, `"4:3"`)
- `position?: 'p_c' | 'p_tl' | 'p_tr' | 'p_bl' | 'p_br' | 'p_t' | 'p_b' | 'p_l' | 'p_r' | 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top' | 'bottom' | 'left' | 'right'` - Position
- `position_startagy?: 'entropy' | 'attention'` - Position strategy (SDK generates `ps_` prefix)

### Transform
- `r?: number | 'portrait' | 'landscape'` - Rotation in degrees (0-360) or special modes
- `z?: number` - Zoom level multiplier (> 0)
- `flip?: 'h' | 'v' | 'hv' | 'vh'` - Flip direction
- `br?: number` - Border radius in pixels (>= 0)

### Format & Quality
- `f?: string` - Format: `"auto"` | `"webp"` | `"jpg"` | `"png"` | `"avif"` | `"gif"` | `"tiff"`
- `q?: string | number` - Quality: `"auto"` | `"auto:best"` | number (1-100)

### Background
- `bg?: string` - Background color: `"rgb:FF5733"` | `"white"` | `"black"`

### DPR
- `dpr?: number` - Device pixel ratio (0.1-10)

### Effects
- `improve?: boolean | string | { mode?: 'indoor' | 'outdoor', blend?: number }` - Auto-enhancement
- `unsharpMask?: number` - Unsharp mask strength (1-2000)
- `saturation?: number` - Saturation adjustment (-100 to 100)
- `contrast?: number` - Contrast adjustment (-100 to 100)
- `brightness?: number` - Brightness adjustment (-99 to 100)
- `gamma?: number` - Gamma correction (-50 to 150)
- `sharpen?: boolean | number` - Sharpen (boolean or strength 1-2000)
- `grayscale?: boolean` - Convert to grayscale
- `blackwhite?: number` - Black and white balance (0-100)
- `hue?: number` - Hue rotation (-180 to 180)
- `warmth?: number` - Warmth adjustment (-100 to 100)
- `tint?: number` - Tint adjustment (-100 to 100)
- `normalize?: boolean` - Normalize histogram
- `invert?: boolean` - Invert colors
- `fade?: number` - Fade effect (0-100)
- `vignette?: number` - Vignette strength (0-100)
- `highlights?: number` - Highlights adjustment (-100 to 100)
- `shadows?: number` - Shadows adjustment (-100 to 100)
- `exposure?: number` - Exposure adjustment (-100 to 100)
- `structure?: number` - Structure/clarity (0-100)
- `autoEnhance?: boolean` - Auto enhance
- `temperature?: number` - Temperature adjustment (-100 to 100)
- `linear?: string` - Linear adjustment (`"a:b"` format)
- `recomb?: string` - Recombination matrix
- `threshold?: number | string` - Threshold (number or `"number:gray"`)
- `convolve?: string` - Convolution kernel matrix
- `unflatten?: boolean` - Unflatten layers
- `flatten?: boolean` - Flatten layers
- `median?: number` - Median filter
- `blur?: number` - Blur amount (0-20)
- `extend?: string` - Extend (`"top:right:bottom:left:color"`)
- `affine?: string` - Affine transform (`"a,b,c,d"`)
- `extract?: 'red' | 'r' | 'green' | 'g' | 'blue' | 'b' | 'alpha' | 'a'` - Extract channel
- `ensureAlpha?: boolean` - Ensure alpha channel
- `removeAlpha?: string` - Remove alpha (`"white"` | `"black"` | `"rgb:RRGGBB"`)

### Layers
- `layers?: LayerOptions[]` - Array of layer options (see below)
- `blend?: 'screen' | 'overlay' | 'multiply' | 'mask' | 'anti_removal'` - Blend mode for layers

### LayerOptions

#### Image Layer
```typescript
{
  type: 'image',
  imagePath: string, // Path to overlay image
  layerType?: 'overlay' | 'underlay',
  width?: number,
  height?: number,
  placement?:
    | 'none'
    | 'north'
    | 'south'
    | 'east'
    | 'west'
    | 'center'
    | 'north-west'
    | 'north-east'
    | 'south-west'
    | 'south-east',
  x?: number, // X offset
  y?: number, // Y offset
  opacity?: number, // 0-100
  rotation?: number, // Rotation in degrees
  // ... other image layer options
}
```

#### Text Layer
```typescript
{
  type: 'text',
  text: string, // Text content
  fontFamily?: string, // Font family (e.g., 'arial')
  fontSize?: number, // Font size in pixels
  fontStyle?: 'bold' | 'italic' | 'underline',
  fontColor?: string, // Hex color without # (e.g., 'FF0000')
  placement?:
    | 'none'
    | 'north'
    | 'south'
    | 'east'
    | 'west'
    | 'center'
    | 'north-west'
    | 'north-east'
    | 'south-west'
    | 'south-east',
  x?: number, // X offset
  y?: number, // Y offset
  rotation?: number, // Rotation in degrees
}
```

## Documentation

See the [full documentation](https://autorender.mintlify.app) for complete API reference.
