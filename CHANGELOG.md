# @autorender/react

## 0.4.2

### Patch Changes

- Version-only release so existing lock files resolve `@autorender/js@0.5.0` on `npm update`. No code changes from **0.4.1**.

## 0.4.1

### Patch Changes

- Updated dependencies [8f7d86a]
  - @autorender/js@0.5.0

## 0.4.0

### Minor Changes

- 6b47f67: Move `ARVideo` to its own entry point, and align responsive defaults with the delivery edge.

  **`ARVideo` now lives at `<package>/viewtag/video`.** Importing it from the `viewtag` barrel no longer works:

  ```diff
  - import { ARImage, ARVideo } from '@autorender/react/viewtag';
  + import { ARImage } from '@autorender/react/viewtag';
  + import { ARVideo } from '@autorender/react/viewtag/video';
  ```

  Angular's `ARVideoComponent` moves from `@autorender/angular/viewtag` to `@autorender/angular/viewtag/video`.

  This is what makes `video.js` a genuinely optional peer dependency. Bundlers resolve every specifier in a module graph at build time, including the ones behind a lazy `import()`, so re-exporting `ARVideo` from the barrel made an image-only app fail to build with `Can't resolve 'video.js/dist/video-js.css'` — regardless of `peerDependenciesMeta`. Apps that render video are unaffected beyond the import path; apps that do not can now drop the dependency.

  **Responsive defaults now match the widths the delivery edge serves exactly.** `DEFAULT_DEVICE_BREAKPOINTS` is `[320, 480, 720, 1080, 1440, 1920]` and `DEFAULT_IMAGE_BREAKPOINTS` is `[16, 32, 48, 64, 96, 128, 240, 320, 480]`. Widths above **240 px** are snapped to the nearest of those rungs before the origin renders, so the previous defaults emitted several `srcset` candidates that returned byte-identical images under different cache keys. `@autorender/js` also exports both constants now, and the framework adapters consume them instead of keeping their own copies, which had drifted.

  **`@autorender/vue/viewtag` and `@autorender/svelte/viewtag` are bundlable again.** Both barrels are now emitted at `dist/viewtag/index.js`, next to the `.vue` / `.svelte` single-file components they import. They were emitted at `dist/viewtag.js` and carried `'./provider.vue'` verbatim, which pointed one directory above the file, so any consumer bundling that subpath failed to resolve it. Nothing changes for importers — the `exports` map absorbs the move.

  **`useAutoRender()` works in Vue no matter which module it comes from.** `provider.ts` is now compiled to `dist/viewtag/provider.js` and shared, rather than being bundled into the barrel _and_ copied for the SFCs to import. Two copies meant two module-scoped `Symbol('AutoRender')` injection keys, so a component that called `useAutoRender()` imported from the barrel threw `useAutoRender must be used within AutoRenderProvider` even inside a provider. Svelte was never affected — it keys its context on a string.

  **`@autorender/angular`'s `browser` and `import` conditions resolve.** ng-packagr copies our custom export conditions into `dist/package.json` verbatim, so the `./dist/fesm2022/...` targets, correct at the package root, pointed at a nonexistent `dist/dist/` from inside `dist/`. That manifest is the one that resolves the fesm bundles' self-references, so any bundler taking the `browser` or `import` condition failed on `Could not resolve "@autorender/angular/viewtag"`. Only CommonJS worked, because `require` fell through to the `default` condition ng-packagr generates itself.

  **`AR.url()` and `AR.transformString()` no longer read `window.devicePixelRatio`.** They returned `w_400` on the server and `dpr_2,w_400` on a retina client, which costs a React attribute mismatch on `src` and a second network fetch. A single URL cannot be ratio-correct for every screen; retina is served by the `2x` `srcset` candidate the browser picks. `enableDPR` still defaults to `true` and still governs that candidate — it just no longer reaches these two methods. Pass `dpr` in `TransformOptions` for a fixed ratio in a one-off URL.

  **`srcset` no longer depends on the rendering device.** The width-only strategy always emits both a `1x` and a `2x` candidate and lets the browser choose, instead of reading `devicePixelRatio` at render time — which returned 1 on the server and 2 on a retina client, producing a hydration mismatch on `srcSet` and a second network fetch. The `sizes` and all-breakpoints strategies no longer emit `dpr_` at all: a `w` descriptor already states the candidate's pixel width, and the browser multiplies by the device ratio itself, so `dpr_` double-counted it. The `1x` candidate no longer carries `dpr_1`, which was a no-op that still cost a cache key.

### Patch Changes

- Updated dependencies [6b47f67]
  - @autorender/js@0.4.0

## 0.3.2

### Patch Changes

- 307a0dd: Fix npm package metadata

  Corrects the repository URL, homepage, and issue tracker links shown on the npm package page.

- Updated dependencies [0f2ee5b]
  - @autorender/js@0.3.3

## 0.3.1

### Patch Changes

- 877d415: Fix styles.css resolution and update documentation links

  - react/vue/nextjs: resolve styles.css via installed @autorender/js package so
    standalone installs work correctly
  - All packages: documentation now links to https://autorender.mintlify.app

- Updated dependencies [877d415]
  - @autorender/js@0.3.1

## 0.2.0

### Minor Changes

- ef6a043: Fix prod upload API default URL, add optional video.js peer dependency, and improve viewtag subpath exports. Includes playground dev fixes for monorepo SDK resolution and env loading.

### Patch Changes

- Updated dependencies [ef6a043]
  - @autorender/js@0.2.0
