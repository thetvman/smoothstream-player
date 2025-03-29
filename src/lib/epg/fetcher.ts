
import { Channel } from '../types';
import { EPGProgram } from './types';
import { getCustomEpgUrl } from './settings';
import { parseXmltvData } from './parser';
import { cacheEPGPrograms, getCachedEPGPrograms } from './cache';

const FETCH_TIMEOUT = 30000; // 30 seconds timeout for fetch

/**
 * Fetch EPG data from the custom EPG service for a single channel
 */
export const fetchEPGData = async (channel: Channel | null): Promise<EPGProgram[] | null> => {
  if (!channel || !channel.epg_channel_id) {
    return null;
  }

  // Check cache first
  const cachedData = getCachedEPGPrograms(channel.epg_channel_id);
  if (cachedData) {
    console.log(`Using cached EPG data for ${channel.name} (${channel.epg_channel_id})`);
    return cachedData;
  }

  try {
    // Check if we have a custom EPG URL set
    const userEpgUrl = getCustomEpgUrl();
    
    if (!userEpgUrl) {
      console.log(`No custom EPG URL set for ${channel.name}`);
      return null;
    }
    
    console.log(`Fetching EPG data for ${channel.name} (${channel.epg_channel_id}) from: ${userEpgUrl}`);
    
    // Use fetch with cache control and timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    
    try {
      const response = await fetch(userEpgUrl, { 
        method: 'GET',
        cache: 'force-cache', // Use browser cache when possible
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const xmlText = await response.text();
        // Only parse EPG data for the current channel ID to save resources
        const programs = parseXmltvData(xmlText, channel.epg_channel_id, true);
        
        if (programs && programs.length > 0) {
          console.log(`Successfully loaded ${programs.length} EPG entries for ${channel.name}`);
          // Cache the results
          cacheEPGPrograms(channel.epg_channel_id, programs);
          return programs;
        } else {
          console.log(`No EPG data found for ${channel.name} in the XMLTV file`);
        }
      } else {
        console.error(`Failed to fetch EPG from ${userEpgUrl}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      throw error; // Re-throw to be caught by outer try/catch
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching EPG data for ${channel.name}:`, error);
    return null;
  }
};

/**
 * Clear function to remove batch prefetching logic
 * This is a placeholder to maintain API compatibility with any code that might call it
 */
export const prefetchEPGDataForChannels = async (channels: Channel[]): Promise<void> => {
  console.log("EPG prefetching disabled - EPG data will be loaded on-demand only");
  return;
};
