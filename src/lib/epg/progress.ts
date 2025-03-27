
import { EPGProgressInfo } from './types';
import { Channel } from '../types';

// Track loading progress
let progressInfo: EPGProgressInfo = {
  total: 0,
  processed: 0,
  progress: 0,
  isLoading: false
};

/**
 * Get current EPG loading progress
 */
export const getEPGLoadingProgress = (): EPGProgressInfo => {
  return { ...progressInfo };
};

/**
 * Update EPG loading progress
 */
export const updateEPGLoadingProgress = (
  update: Partial<EPGProgressInfo>
): EPGProgressInfo => {
  progressInfo = { ...progressInfo, ...update };
  return progressInfo;
};

/**
 * Initialize progress tracking
 */
export const initializeProgress = (
  channels: Channel[]
): EPGProgressInfo => {
  const startTime = Date.now();
  progressInfo = {
    total: channels.length,
    processed: 0,
    progress: 0,
    isLoading: true,
    message: "Preparing EPG data...",
    startTime: startTime
  };
  
  return progressInfo;
};

/**
 * Calculate estimated time remaining based on current parsing speed
 */
export const calculateTimeRemaining = (
  processed: number, 
  total: number, 
  startTime: number
): string => {
  const elapsedMs = Date.now() - startTime;
  if (processed === 0 || elapsedMs < 1000) return "calculating...";
  
  const msPerItem = elapsedMs / processed;
  const remainingItems = total - processed;
  const remainingMs = msPerItem * remainingItems;
  
  // Convert to seconds
  const remainingSecs = Math.round(remainingMs / 1000);
  
  if (remainingSecs < 60) {
    return `${remainingSecs} seconds`;
  } else if (remainingSecs < 3600) {
    return `${Math.floor(remainingSecs / 60)} minutes ${remainingSecs % 60} seconds`;
  } else {
    const hours = Math.floor(remainingSecs / 3600);
    const minutes = Math.floor((remainingSecs % 3600) / 60);
    return `${hours} hours ${minutes} minutes`;
  }
};

/**
 * Update progress for a processed channel
 */
export const updateChannelProgress = (
  channelName: string, 
  total: number
): EPGProgressInfo => {
  progressInfo.processed++;
  progressInfo.progress = progressInfo.processed / total;
  progressInfo.message = `Loading EPG: ${channelName}`;
  
  // Calculate parsing speed and estimated time
  if (progressInfo.startTime) {
    const elapsedSecs = (Date.now() - progressInfo.startTime) / 1000;
    if (elapsedSecs > 0) {
      progressInfo.parsingSpeed = progressInfo.processed / elapsedSecs;
      progressInfo.estimatedTimeRemaining = calculateTimeRemaining(
        progressInfo.processed, 
        total, 
        progressInfo.startTime
      );
    }
  }
  
  return { ...progressInfo };
};

/**
 * Mark progress as complete
 */
export const completeProgress = (): EPGProgressInfo => {
  progressInfo.progress = 1;
  progressInfo.isLoading = false;
  progressInfo.message = "EPG data loaded";
  
  return { ...progressInfo };
};
