'use client';

import {
  type ForwardedRef,
  type MutableRefObject,
  forwardRef,
  useEffect,
  useRef,
} from 'react';
import { createUploader } from '@autorender/js';
import type { CreateUploaderOptions, UploaderInstance } from '@autorender/js';

export type AutorenderUploaderProps = Omit<CreateUploaderOptions, 'target'> & {
  containerClassName?: string;
};

export const AutorenderUploader = forwardRef<UploaderInstance | null, AutorenderUploaderProps>(
  ({ containerClassName, ...props }: AutorenderUploaderProps, ref: ForwardedRef<UploaderInstance | null>) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const instanceRef = useRef<UploaderInstance | null>(null);

    const assignRef = (value: UploaderInstance | null) => {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref) {
        ref.current = value;
      }
    };

    useEffect(() => {
      if (!containerRef.current) return;

      instanceRef.current = createUploader({
        ...props,
        target: containerRef.current,
      });
      assignRef(instanceRef.current);

      return () => {
        instanceRef.current?.destroy();
        assignRef(null);
        instanceRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      if (!instanceRef.current) return;
      instanceRef.current.updateOptions(props);
    }, [props]);

    return <div ref={containerRef} className={containerClassName} style={{ width: '100%' }} />;
  }
);

export function useAutorenderUploader(
  options: AutorenderUploaderProps
): MutableRefObject<UploaderInstance | null> {
  const ref = useRef<UploaderInstance | null>(null);
  useEffect(() => {
    const { containerClassName: _containerClassName, ...rest } = options;
    ref.current?.updateOptions(rest);
  }, [options]);
  return ref;
}


