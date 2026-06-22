/**
 * ARVideo component for React
 * Wrapper around Video.js with AutoRender URL generation.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { loadVideoJs } from '@autorender/js/viewtag/load-videojs';
import { useAutoRender } from '../provider/AutoRenderProvider';
import type { TransformOptions } from '@autorender/js/viewtag';

type VideoJsPlayer = any;
type StreamingType = 'hls' | 'dash';

interface VideoStreamingOptions {
  type: StreamingType;
  resolutions: number[];
}

type ARVideoTransformations = TransformOptions & {
  streaming?: VideoStreamingOptions;
};

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export interface ARVideoProps {
  src: string;
  width?: number;
  height?: number;
  transformations?: ARVideoTransformations;
  fallback?: string;
  poster?: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  preload?: 'auto' | 'metadata' | 'none';
  playsInline?: boolean;
  className?: string;
  style?: React.CSSProperties;
  playerOptions?: Record<string, unknown>;
}

export const ARVideo = React.forwardRef<HTMLVideoElement, ARVideoProps>(
  (
    {
      src,
      width,
      height,
      transformations,
      fallback,
      controls = true,
      autoPlay = false,
      muted = false,
      loop = false,
      preload = 'metadata',
      playsInline = true,
      poster,
      className,
      style,
      playerOptions,
    },
    ref
  ) => {
    const ar = useAutoRender();
    const playerRef = useRef<VideoJsPlayer | null>(null);
    const initIdRef = useRef(0);
    const lastSrcRef = useRef<string | null>(null);
    const fallbackAppliedRef = useRef(false);
    const [showPlaceholder, setShowPlaceholder] = useState(false);

    const resolvedSrc = useMemo(() => {
      const streamingConfig = transformations?.streaming;
      const streamingType: StreamingType | undefined = streamingConfig?.type;
      const streamingResolutions = streamingConfig?.resolutions || [];
      const streamingToken =
        streamingResolutions.length > 0
          ? `st_${streamingResolutions.map((v: number) => Math.round(v)).join('_')}`
          : undefined;

      const manifestSuffix =
        streamingType === 'hls'
          ? '/ar-master.m3u8'
          : streamingType === 'dash'
          ? '/ar-master.mpd'
          : '';

      const normalizedSrc =
        manifestSuffix &&
        !src.endsWith('/ar-master.m3u8') &&
        !src.endsWith('/ar-master.mpd')
          ? `${src.replace(/\/+$/, '')}${manifestSuffix}`
          : src;

      const fullTransform: Record<string, unknown> = {
        ...transformations,
        streaming: undefined,
        ...(streamingToken && { [streamingToken]: true }),
        ...(width && { w: width }),
        ...(height && { h: height }),
      };

      Object.keys(fullTransform).forEach(
        k => fullTransform[k] === undefined && delete fullTransform[k]
      );

      const hasTransform = Object.keys(fullTransform).length > 0;
      if (isAbsoluteUrl(normalizedSrc) && !hasTransform) {
        return normalizedSrc;
      }

      return ar.url(normalizedSrc, fullTransform);
    }, [ar, src, width, height, transformations]);

    const resolvedSrcRef = useRef(resolvedSrc);
    resolvedSrcRef.current = resolvedSrc;

    const resolvedFallback = useMemo(() => {
      if (!fallback) return undefined;
      return isAbsoluteUrl(fallback) ? fallback : ar.url(fallback);
    }, [ar, fallback]);

    const resolvedFallbackRef = useRef(resolvedFallback);
    resolvedFallbackRef.current = resolvedFallback;

    const videoCallbackRef = useCallback(
      (node: HTMLVideoElement | null) => {
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;

        if (!node) {
          initIdRef.current += 1;
          if (playerRef.current) {
            playerRef.current.dispose();
            playerRef.current = null;
          }
          return;
        }

        if (playerRef.current) return;

        const initId = initIdRef.current + 1;
        initIdRef.current = initId;

        void loadVideoJs().then((videojs) => {
          if (initId !== initIdRef.current || playerRef.current) return;

          const player = videojs(node, {
          controls,
          autoplay: autoPlay,
          muted,
          loop,
          preload,
          playsinline: playsInline,
          poster,
          restoreEl: true,
          // Always use fluid+aspectRatio — VJS drives sizing via CSS,
          // and the outer wrapper enforces the actual pixel dimensions.
          // This avoids fill:true collapsing when parent has no explicit height.
          fluid: true,
          aspectRatio: '16:9',
          responsive: false,
          sources: [{ src: resolvedSrcRef.current }],
          ...playerOptions,
        });

        playerRef.current = player;
        lastSrcRef.current = resolvedSrcRef.current;

        // After VJS init, override the .video-js element size directly.
        // VJS fluid mode sets width:100% and uses padding-top for height.
        // We override both so explicit width/height props are respected.
        if (width !== undefined || height !== undefined) {
          const vjsEl = player.el() as HTMLElement;
          if (vjsEl) {
            vjsEl.style.width = width !== undefined ? `${width}px` : '100%';
            vjsEl.style.height = height !== undefined ? `${height}px` : 'auto';
            vjsEl.style.paddingTop = '0'; // remove fluid's padding-top hack
          }
        }

        const handleError = () => {
          const fb = resolvedFallbackRef.current;
          if (fb && !fallbackAppliedRef.current) {
            fallbackAppliedRef.current = true;
            player.src([{ src: fb }]);
            lastSrcRef.current = fb;
            return;
          }
          setShowPlaceholder(true);
        };

        const handlePlayable = () => setShowPlaceholder(false);

        player.on('error', handleError);
        player.on('loadeddata', handlePlayable);
        player.on('canplay', handlePlayable);
        });
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    // Sync prop + dimension changes to existing player
    useEffect(() => {
      if (!playerRef.current) return;

      playerRef.current.poster(poster || '');
      playerRef.current.autoplay(autoPlay);
      playerRef.current.muted(muted);
      playerRef.current.loop(loop);

      // Re-apply explicit dimensions whenever they change
      if (width !== undefined || height !== undefined) {
        const vjsEl = playerRef.current.el() as HTMLElement;
        if (vjsEl) {
          vjsEl.style.width = width !== undefined ? `${width}px` : '100%';
          vjsEl.style.height = height !== undefined ? `${height}px` : 'auto';
          vjsEl.style.paddingTop = '0';
        }
      }

      if (lastSrcRef.current !== resolvedSrc) {
        fallbackAppliedRef.current = false;
        setShowPlaceholder(false);
        playerRef.current.src([{ src: resolvedSrc }]);
        lastSrcRef.current = resolvedSrc;
      }
    }, [resolvedSrc, autoPlay, muted, loop, poster, width, height]);

    const rootClassName = ['ar-video', className].filter(Boolean).join(' ');

    return (
      <div
        data-vjs-player
        className={rootClassName}
        style={{
          // The wrapper only needs to constrain width when explicit.
          // Height is driven by VJS fluid aspect-ratio OR explicit override on .video-js el.
          width: width !== undefined ? width : '100%',
          // Do NOT set height here — let VJS fluid or the .video-js override drive it.
          position: 'relative',
          display: 'block',
          backgroundColor: showPlaceholder ? '#e5e7eb' : undefined,
          ...style,
        }}
      >
        <video
          ref={videoCallbackRef}
          className="video-js vjs-default-skin"
          style={{ visibility: showPlaceholder ? 'hidden' : 'visible' }}
        />
      </div>
    );
  }
);

ARVideo.displayName = 'ARVideo';