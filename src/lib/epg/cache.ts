
import { EPGProgram } from './types';

// Cache EPG data to reduce API calls
const EPG_CACHE: Record<string, { data: EPGProgram[], timestamp: number }> = {};
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours cache expiry

/**
 * Check if we already have valid cached data for a channel
 */
export const hasValidCachedEPG = (channelId: string): boolean => {
  if (!channelId) return false;
  
  const cacheEntry = EPG_CACHE[channelId];
  if (!cacheEntry) return false;
  
  const now = Date.now();
  return (now - cacheEntry.timestamp) < CACHE_EXPIRY && cacheEntry.data.length > 0;
};

/**
 * Initialize cache from localStorage on module load
 */
export const initializeCache = () => {
  try {
    const cachedData = localStorage.getItem("iptv-epg-cache");
    if (cachedData) {
      const parsedCache = JSON.parse(cachedData);
      
      // Convert date strings back to Date objects
      Object.keys(parsedCache).forEach(key => {
        if (parsedCache[key] && parsedCache[key].data) {
          parsedCache[key].data = parsedCache[key].data.map((program: any) => ({
            ...program,
            start: new Date(program.start),
            end: new Date(program.end)
          }));
        }
      });
      
      // Merge with in-memory cache
      Object.assign(EPG_CACHE, parsedCache);
      console.log(`Loaded EPG cache from localStorage with ${Object.keys(parsedCache).length} channels`);
    }
  } catch (error) {
    console.error("Error loading EPG cache from localStorage:", error);
    // If there's an error loading the cache, we'll just continue with an empty cache
  }
};

/**
 * Save cache to localStorage
 */
export const saveCache = () => {
  try {
    localStorage.setItem("iptv-epg-cache", JSON.stringify(EPG_CACHE));
  } catch (error) {
    console.error("Error saving EPG cache to localStorage:", error);
    
    // If the error is likely due to localStorage size limits, try to trim the cache
    if (error instanceof DOMException && (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED")) {
      console.log("LocalStorage quota exceeded, trimming cache...");
      trimCache();
      try {
        localStorage.setItem("iptv-epg-cache", JSON.stringify(EPG_CACHE));
      } catch (e) {
        console.error("Still unable to save cache after trimming:", e);
      }
    }
  }
};

/**
 * Trim cache to reduce size if localStorage quota is exceeded
 */
const trimCache = () => {
  const keys = Object.keys(EPG_CACHE);
  if (keys.length <= 10) return; // Keep at least some channels
  
  // Remove oldest entries first
  const keysToRemove = keys
    .map(key => ({ key, timestamp: EPG_CACHE[key].timestamp }))
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(0, Math.floor(keys.length / 2)) // Remove half of the cache
    .map(item => item.key);
  
  keysToRemove.forEach(key => {
    delete EPG_CACHE[key];
  });
  
  console.log(`Trimmed EPG cache, removed ${keysToRemove.length} channels`);
};

/**
 * Store a program in the cache
 */
export const cacheEPGPrograms = (channelId: string, programs: EPGProgram[]) => {
  if (!channelId || !programs) return;
  
  EPG_CACHE[channelId] = {
    data: programs,
    timestamp: Date.now()
  };
};

/**
 * Get cached EPG programs for a channel
 */
export const getCachedEPGPrograms = (channelId: string): EPGProgram[] | null => {
  if (!hasValidCachedEPG(channelId)) return null;
  return EPG_CACHE[channelId].data;
};

/**
 * Clear the EPG cache
 */
export const clearCache = () => {
  Object.keys(EPG_CACHE).forEach(key => delete EPG_CACHE[key]);
  console.log("EPG cache cleared");
  saveCache();
};

// Initialize cache when module is loaded
initializeCache();
