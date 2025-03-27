
import { Channel } from '../types';
import { EPGProgressInfo } from './types';
import { hasValidCachedEPG, saveCache } from './cache';
import { fetchEPGData } from './fetcher';
import { getCustomEpgUrl } from './settings';
import { 
  getEPGLoadingProgress, 
  initializeProgress, 
  updateChannelProgress,
  completeProgress
} from './progress';

const PREFETCH_CONCURRENCY = 8; // Number of parallel requests

/**
 * Prefetch EPG data for multiple channels
 */
export const prefetchEPGDataForChannels = async (
  channels: Channel[], 
  onProgress?: (info: EPGProgressInfo) => void
) => {
  const channelsWithEpg = channels.filter(c => c.epg_channel_id);
  
  if (channelsWithEpg.length === 0) {
    console.log("No channels with EPG IDs to prefetch");
    return;
  }
  
  // Check for already cached channels to skip
  const channelsToFetch = channelsWithEpg.filter(c => !hasValidCachedEPG(c.epg_channel_id!));
  
  if (channelsToFetch.length === 0) {
    console.log("All channels already have valid cached EPG data");
    return;
  }
  
  // Check if we have a custom EPG URL set
  const userEpgUrl = getCustomEpgUrl();
  if (!userEpgUrl) {
    console.log("No custom EPG URL set, skipping prefetch");
    
    // Update progress info to show we're not loading
    const noEpgProgress: EPGProgressInfo = {
      total: 0,
      processed: 0,
      progress: 1,
      isLoading: false,
      message: "No EPG source configured"
    };
    
    if (onProgress) onProgress(noEpgProgress);
    return;
  }
  
  console.log(`Starting EPG prefetch for ${channelsToFetch.length} channels (${channelsWithEpg.length - channelsToFetch.length} from cache)`);
  
  // Initialize progress tracking with timing information
  const progressInfo = initializeProgress(channelsToFetch);
  
  if (onProgress) onProgress(progressInfo);
  
  // Create a batching queue with controlled concurrency
  const processBatch = async (batch: Channel[]) => {
    const promises = batch.map(channel => {
      // Check cache again just to be sure
      if (hasValidCachedEPG(channel.epg_channel_id!)) {
        console.log(`Using cached EPG for ${channel.name}`);
        const updatedProgress = updateChannelProgress(channel.name, progressInfo.total);
        
        if (onProgress) onProgress({ ...updatedProgress });
        return Promise.resolve();
      }
      
      return fetchEPGData(channel)
        .then(() => {
          console.log(`Prefetched EPG for ${channel.name}`);
          const updatedProgress = updateChannelProgress(channel.name, progressInfo.total);
          
          if (onProgress) onProgress({ ...updatedProgress });
          
          // Save cache periodically
          if (progressInfo.processed % 10 === 0) {
            saveCache();
          }
        })
        .catch(err => {
          console.warn(`Failed to prefetch EPG for ${channel.name}:`, err);
          const updatedProgress = updateChannelProgress(channel.name, progressInfo.total);
          
          if (onProgress) onProgress({ ...updatedProgress });
        });
    });
    
    await Promise.all(promises);
  };
  
  // Process in batches for better performance and memory usage
  const batchSize = PREFETCH_CONCURRENCY;
  for (let i = 0; i < channelsToFetch.length; i += batchSize) {
    const batch = channelsToFetch.slice(i, i + batchSize);
    await processBatch(batch);
    
    // Don't add delay between batches to improve performance
    // Just yield to the event loop briefly
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  // Finalize progress
  const finalProgress = completeProgress();
  if (onProgress) onProgress(finalProgress);
  
  // Save complete cache
  saveCache();
  
  console.log("EPG prefetch completed");
};
