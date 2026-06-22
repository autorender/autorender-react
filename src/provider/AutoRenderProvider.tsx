/**
 * AutoRender Provider for React
 * Provides AR instance via React Context
 */

import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import { createAR, type CreateARConfig, type ARInstance } from '@autorender/js/viewtag';

interface AutoRenderContextValue {
  ar: ARInstance;
}

const AutoRenderContext = createContext<AutoRenderContextValue | null>(null);

export interface AutoRenderProviderProps extends CreateARConfig {
  children: ReactNode;
}

export function AutoRenderProvider({
  children,
  ...config
}: AutoRenderProviderProps) {
  const ar = useMemo(() => createAR(config), [
    config.baseUrl,
    config.workspace,
    JSON.stringify(config.defaults), // Stringify to handle object comparison
    JSON.stringify(config.deviceBreakpoints),
    JSON.stringify(config.imageBreakpoints),
    config.enableDPR,
    config.enableResponsive
  ]);

  const value = useMemo(() => ({ ar }), [ar]);

  return (
    <AutoRenderContext.Provider value={value}>
      {children}
    </AutoRenderContext.Provider>
  );
}

export function useAutoRender(): ARInstance {
  const context = useContext(AutoRenderContext);
  if (!context) {
    throw new Error('useAutoRender must be used within AutoRenderProvider');
  }
  return context.ar;
}

