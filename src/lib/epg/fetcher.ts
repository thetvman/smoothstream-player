
import { Channel } from '../types';
import { EPGProgram } from './types';
import { getCustomEpgUrl } from './settings';
import { parseXmltvData, generateDemoEPG } from './parser';
import { cacheEPGPrograms, getCachedEPGPrograms } from './cache';

const FETCH_TIMEOUT = 30000; // 30 seconds timeout for fetch

/**
 * Fetch EPG data from the custom EPG service
 */
export const fetchEPGData = async (channel: Channel | null): Promise<EPGProgram[] | null> => {
  if (!channel || !channel.epg_channel_id) {
    return null;
  }

  // Check cache first
  const cachedData = getCachedEPGPrograms(channel.epg_channel_id);
  if (cachedData) {
    return cachedData;
  }

  try {
    // Check if we have a custom EPG URL set
    const userEpgUrl = getCustomEpgUrl();
    
    if (!userEpgUrl) {
      console.log("No custom EPG URL set, returning demo data");
      const demoData = generateDemoEPG(channel.epg_channel_id);
      
      // Cache the demo data
      cacheEPGPrograms(channel.epg_channel_id, demoData);
      
      return demoData;
    }
    
    console.log(`Fetching EPG from custom URL: ${userEpgUrl}`);
    
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
        const programs = parseXmltvData(xmlText, channel.epg_channel_id);
        
        if (programs && programs.length > 0) {
          // Cache the results
          cacheEPGPrograms(channel.epg_channel_id, programs);
          return programs;
        }
      } else {
        console.error(`Failed to fetch EPG from ${userEpgUrl}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      throw error; // Re-throw to be caught by outer try/catch
    }
    
    // If we reach here, we couldn't get data from the custom URL
    console.warn(`No EPG data found for channel ID: ${channel.epg_channel_id}`);
    const demoData = generateDemoEPG(channel.epg_channel_id);
    
    // Cache even demo data to prevent repeated fetching
    cacheEPGPrograms(channel.epg_channel_id, demoData);
    
    return demoData;
  } catch (error) {
    console.error("Error fetching EPG data:", error);
    
    // Fall back to demo data if the API fails
    const demoData = generateDemoEPG(channel.epg_channel_id);
    
    // Cache the demo data
    cacheEPGPrograms(channel.epg_channel_id, demoData);
    
    return demoData;
  }
};
