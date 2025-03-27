
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
    // Try XMLTV format first (most common for IPTV)
    const epgChannelId = encodeURIComponent(channel.epg_channel_id);
    
    // Try different XMLTV URLs
    const xmltvUrls = [
      `https://iptv-org.github.io/epg/guides/${epgChannelId}.xml`,
      `https://xmltv.ch/xmltv/xmltv-${epgChannelId}.xml`,
      `https://github.com/iptv-org/epg/raw/master/sites/${epgChannelId}/guide.xml`
    ];
    
    // Try each URL in order until we get a valid response
    for (const url of xmltvUrls) {
      try {
        console.log(`Trying to fetch EPG from: ${url}`);
        const response = await fetch(url, { method: 'GET' });
        
        if (response.ok) {
          const xmlText = await response.text();
          const programs = parseXmltvData(xmlText, channel.epg_channel_id);
          
          if (programs && programs.length > 0) {
            // Cache the results
            EPG_CACHE[channel.epg_channel_id] = {
              data: programs,
              timestamp: Date.now()
            };
            
            return programs;
          }
        }
      } catch (error) {
        console.log(`Failed to fetch or parse XMLTV EPG from ${url}:`, error);
        // Continue to the next URL
      }
    }
    
    // Fallback to JSON format
    try {
      const jsonUrl = `https://iptv-org.github.io/epg/guides/${epgChannelId}.json`;
      console.log(`Trying to fetch EPG from JSON: ${jsonUrl}`);
      const response = await fetch(jsonUrl);
      
      if (response.ok) {
        const data = await response.json();
        return processEPGData(data, channel.epg_channel_id);
      }
      
      // Try alternative format, some EPG IDs might be country-specific
      const countryParts = epgChannelId.split('.');
      if (countryParts.length > 1) {
        const countryCode = countryParts[0];
        const channelId = countryParts[1];
        const altJsonUrl = `https://iptv-org.github.io/epg/guides/${countryCode}/${channelId}.json`;
        
        console.log(`Trying alternative JSON format: ${altJsonUrl}`);
        const altResponse = await fetch(altJsonUrl);
        
        if (altResponse.ok) {
          const data = await altResponse.json();
          return processEPGData(data, channel.epg_channel_id);
        }
      }
    } catch (error) {
      console.log("Error fetching JSON EPG data:", error);
    }
    
    console.warn(`No EPG data found for channel ID: ${channel.epg_channel_id}`);
    return generateDemoEPG(channel.epg_channel_id);
  } catch (error) {
    console.error("Error fetching EPG data:", error);
    
    // Fall back to demo data if the API fails
    return generateDemoEPG(channel.epg_channel_id);
  }
};

/**
 * Parse XMLTV data format
 */
const parseXmltvData = (xmlText: string, channelId: string): EPGProgram[] => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      console.error("XML parsing error:", parserError.textContent);
      return [];
    }
    
    // Get all programme elements
    const programmeElements = xmlDoc.querySelectorAll('programme');
    const programs: EPGProgram[] = [];
    
    programmeElements.forEach(programme => {
      // Check if this program is for our channel
      const channel = programme.getAttribute('channel');
      if (channel && channel.includes(channelId)) {
        const startAttr = programme.getAttribute('start');
        const stopAttr = programme.getAttribute('stop');
        
        if (startAttr && stopAttr) {
          // XMLTV time format is usually YYYYMMDDHHMMSS +0000
          const start = parseXmltvTime(startAttr);
          const end = parseXmltvTime(stopAttr);
          
          const titleElement = programme.querySelector('title');
          const descElement = programme.querySelector('desc');
          
          if (titleElement && start && end) {
            const program: EPGProgram = {
              title: titleElement.textContent || "Unknown Program",
              description: descElement ? descElement.textContent || "" : "",
              start,
              end,
              channelId
            };
            
            programs.push(program);
          }
        }
      }
    });
    
    // Sort by start time
    programs.sort((a, b) => a.start.getTime() - b.start.getTime());
    
    // Cache the results
    if (programs.length > 0) {
      EPG_CACHE[channelId] = {
        data: programs,
        timestamp: Date.now()
      };
    }
    
    return programs;
  } catch (error) {
    console.error("Error parsing XMLTV data:", error);
    return [];
  }
};

/**
 * Parse XMLTV time format (YYYYMMDDHHMMSS +0000) to Date
 */
const parseXmltvTime = (timeString: string): Date | null => {
  try {
    // Remove timezone offset for now
    const cleanTime = timeString.replace(/\s+[+-]\d{4}/, '');
    
    // Extract components
    const year = parseInt(cleanTime.substring(0, 4));
    const month = parseInt(cleanTime.substring(4, 6)) - 1; // Month is 0-based in JavaScript
    const day = parseInt(cleanTime.substring(6, 8));
    const hour = parseInt(cleanTime.substring(8, 10));
    const minute = parseInt(cleanTime.substring(10, 12));
    const second = cleanTime.length >= 14 ? parseInt(cleanTime.substring(12, 14)) : 0;
    
    return new Date(year, month, day, hour, minute, second);
  } catch (error) {
    console.error("Error parsing XMLTV time:", timeString, error);
    return null;
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
