import type { BrandingConfig } from '../../branding-schema';
import { defaultBranding } from '../../branding-schema';
import { createContext, useContext } from 'react';

export const BrandingContext = createContext<BrandingConfig>(defaultBranding);

export function useBranding(): BrandingConfig {
  return useContext(BrandingContext);
}
