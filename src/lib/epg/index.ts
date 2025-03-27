
// Main EPG service module that exports all functionality

// Re-export from modules
export { EPGProgram, EPGProgressInfo } from './types';
export { getEPGLoadingProgress } from './progress';
export { hasValidCachedEPG, saveCache, clearCache } from './cache';
export { getCustomEpgUrl, setCustomEpgUrl } from './settings';
export { fetchEPGData } from './fetcher';
export { prefetchEPGDataForChannels } from './prefetch';

// Register event listeners for cache management
if (typeof window !== 'undefined') {
  // Save cache before page unload
  window.addEventListener('beforeunload', () => {
    saveCache();
  });
}
