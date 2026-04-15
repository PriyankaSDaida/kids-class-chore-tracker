// ─── useMediaQuery — reactive breakpoint hook ──────────────────────────────────
import { useState, useEffect } from 'react';

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);
  return matches;
};

// Convenience exports
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
export const useIsTablet  = () => useMediaQuery('(min-width: 768px)');
export const useIsMobile  = () => useMediaQuery('(max-width: 767px)');
