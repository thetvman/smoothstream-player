
import { Channel } from "./types";

interface EPGProgram {
  title: string;
  description?: string;
  start: Date;
  end: Date;
  channelId: string;
}

// Cache EPG data to reduce API calls
const EPG_CACHE: Record<string, { data: EPGProgram[], timestamp: number }> = {};
const CACHE_EXPIRY = 15 * 60 * 1000; // 15 minutes cache expiry

/**
 * Fetch EPG data from a real EPG service
 */
export const fetchEPGData = async (channel: Channel | null): Promise<EPGProgram[] | null> => {
  if (!channel || !channel.epg_channel_id) {
    return null;
  }

  // Check cache first
  const now = Date.now();
  const cacheEntry = EPG_CACHE[channel.epg_channel_id];
  if (cacheEntry && (now - cacheEntry.timestamp) < CACHE_EXPIRY) {
    return cacheEntry.data;
  }

  try {
    // Use the XMLTV EPG API from iptv-org
    // This is an open source EPG service that provides guide data
    const epgChannelId = encodeURIComponent(channel.epg_channel_id);
    const response = await fetch(`https://iptv-org.github.io/epg/guides/${epgChannelId}.json`);
    
    if (!response.ok) {
      // Try alternative format, some EPG IDs might be country-specific
      const countryParts = epgChannelId.split('.');
      if (countryParts.length > 1) {
        const countryCode = countryParts[0];
        const channelId = countryParts[1];
        const altResponse = await fetch(`https://iptv-org.github.io/epg/guides/${countryCode}/${channelId}.json`);
        
        if (!altResponse.ok) {
          console.error(`EPG API error: ${response.status} - Channel ID: ${channel.epg_channel_id}`);
          return null;
        }
        
        const data = await altResponse.json();
        return processEPGData(data, channel.epg_channel_id);
      }
      
      console.error(`EPG API error: ${response.status} - Channel ID: ${channel.epg_channel_id}`);
      return null;
    }
    
    const data = await response.json();
    return processEPGData(data, channel.epg_channel_id);
  } catch (error) {
    console.error("Error fetching EPG data:", error);
    
    // Fall back to demo data if the API fails
    return generateDemoEPG(channel.epg_channel_id);
  }
};

/**
 * Process the EPG data from the API response 
 */
const processEPGData = (data: any, channelId: string): EPGProgram[] => {
  if (!data || !data.programmes) {
    return [];
  }
  
  try {
    const programs = data.programmes
      .filter((program: any) => program.channel === channelId)
      .map((program: any) => ({
        title: program.title || "Unknown Program",
        description: program.description || program.sub_title || "",
        start: new Date(program.start),
        end: new Date(program.stop),
        channelId: channelId
      }));
    
    // Sort by start time
    programs.sort((a: EPGProgram, b: EPGProgram) => a.start.getTime() - b.start.getTime());
    
    // Cache the results
    EPG_CACHE[channelId] = {
      data: programs,
      timestamp: Date.now()
    };
    
    return programs;
  } catch (e) {
    console.error("Error processing EPG data:", e);
    return [];
  }
};

// For fallback or testing - Generate demo EPG data
const generateDemoEPG = (channelId: string): EPGProgram[] => {
  const now = new Date();
  const startHour = now.getHours();
  
  // Generate programs for the next 24 hours
  const programs: EPGProgram[] = [];
  
  for (let i = -2; i < 10; i++) {
    const start = new Date();
    start.setHours(startHour + i, 0, 0, 0);
    
    const end = new Date(start);
    end.setHours(startHour + i + 1, 0, 0, 0);
    
    const program: EPGProgram = {
      title: `Program ${i + 3}`,
      description: `This is a sample program description for program ${i + 3} on channel ${channelId}.`,
      start,
      end,
      channelId
    };
    
    // Custom titles for current and upcoming shows
    if (i === 0) {
      program.title = "News Today";
      program.description = "Latest news and current affairs from around the world.";
    } else if (i === 1) {
      program.title = "Sports Update";
      program.description = "Catch up with all the latest sporting action and highlights.";
    } else if (i === 2) {
      program.title = "Movie Time";
      program.description = "A family-friendly movie for your evening entertainment.";
    }
    
    programs.push(program);
  }
  
  return programs;
};

// Export the EPGProgram type so it can be imported elsewhere
export type { EPGProgram };
