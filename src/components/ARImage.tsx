/**
 * ARImage component for React
 * Wrapper around <img> with AutoRender URL generation and responsive images
 */

import React, { useMemo, type ImgHTMLAttributes } from 'react';
import { useAutoRender } from '../provider/AutoRenderProvider';
import { isGifFormatOutput, type TransformOptions } from '@autorender/js/viewtag';

export interface ARImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes' | 'width'> {
  src: string;
  width?: number;
  height?: number;
  transformations?: TransformOptions;
  responsive?: boolean;
  lazy?: boolean;
  sizes?: string;
  /**
   * Optional named preset, mapped to a leading t_<preset> segment in the URL.
   * Example: preset=\"unavailable\" -> t_unavailable
   */
  preset?: string;
}

export const ARImage = React.forwardRef<HTMLImageElement, ARImageProps>(
  (
    {
      src,
      width,
      height,
      transformations,
      responsive = true,
      lazy = true,
      sizes,
      alt,
      preset,
      ...imgProps
    },
    ref
  ) => {
    const ar = useAutoRender();

    const imageAttributes = useMemo(() => {
      // Merge width and height into transform
      const fullTransform: TransformOptions & Record<string, unknown> = {
        ...(transformations || {}),
        ...(width && { w: width }),
        ...(height && { h: height })
      };

      // If a preset is provided, map it to a raw t_<preset> flag
      if (preset) {
        fullTransform[`t_${preset}`] = true;
      }

      const useResponsiveLayout = responsive && !isGifFormatOutput(fullTransform);

      if (useResponsiveLayout) {
        return ar.responsiveImageAttributes({
          src,
          width,
          sizes,
          transform: fullTransform
        });
      } else {
        // Non-responsive: just generate URL
        return {
          src: ar.url(src, fullTransform),
          srcSet: undefined,
          sizes: undefined,
          width
        };
      }
    }, [ar, src, width, height, sizes, transformations, responsive, preset]);

    return (
      <img
        ref={ref}
        src={imageAttributes.src}
        srcSet={imageAttributes.srcSet}
        sizes={imageAttributes.sizes}
        width={imageAttributes.width}
        height={height}
        alt={alt}
        loading={lazy ? 'lazy' : 'eager'}
        style={{
          ...(width && { width: `${width}px` }),
          ...(height && { height: `${height}px` }),
          ...(imgProps.style as any)
        }}
        {...imgProps}
      />
    );
  }
);

ARImage.displayName = 'ARImage';

