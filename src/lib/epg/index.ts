
// Main EPG service module that exports all functionality

// Re-export from modules
export type { EPGProgram, EPGParsingOptions } from './types';
export { hasValidCachedEPG, saveCache, clearCache } from './cache';
export { getCustomEpgUrl, setCustomEpgUrl } from './settings';
export { fetchEPGData } from './fetcher';

// Register event listeners for cache management
if (typeof window !== 'undefined') {
  // Import saveCache from the cache module for use in the event listener
  import('./cache').then(({ saveCache }) => {
    // Save cache before page unload
    window.addEventListener('beforeunload', () => {
      saveCache();
    });
  });
}
