import { Channel } from "./types";

interface EPGProgram {
  title: string;
  description?: string;
  start: Date;
  end: Date;
  channelId: string;
}

interface EPGProgressInfo {
  total: number;
  processed: number;
  progress: number;
  isLoading: boolean;
  message?: string;
  parsingSpeed?: number;
  estimatedTimeRemaining?: string;
  startTime?: number;
}

// Cache EPG data to reduce API calls
const EPG_CACHE: Record<string, { data: EPGProgram[], timestamp: number }> = {};
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours cache expiry
const PREFETCH_CONCURRENCY = 8; // Increased from 5 to 8 for better performance

// Store custom EPG URL
let customEpgUrl: string | null = null;

// Track loading progress
let progressInfo: EPGProgressInfo = {
  total: 0,
  processed: 0,
  progress: 0,
  isLoading: false
};

// Initialize cache from localStorage on module load
const initializeCache = () => {
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

// Save cache to localStorage
const saveCache = () => {
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

// Trim cache to reduce size if localStorage quota is exceeded
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

// Call initialize on module load
initializeCache();

/**
 * Get current EPG loading progress
 */
export const getEPGLoadingProgress = (): EPGProgressInfo => {
  return { ...progressInfo };
};

/**
 * Set a custom EPG URL for the application
 */
export const setCustomEpgUrl = (url: string | null) => {
  if (url !== customEpgUrl) {
    // Clear cache when changing EPG source
    Object.keys(EPG_CACHE).forEach(key => delete EPG_CACHE[key]);
    console.log("EPG cache cleared due to EPG URL change");
    saveCache();
  }
  
  customEpgUrl = url;
  
  // Save to localStorage
  if (url) {
    localStorage.setItem("iptv-epg-url", url);
  } else {
    localStorage.removeItem("iptv-epg-url");
  }
  
  return url;
};

/**
 * Get the currently set custom EPG URL
 */
export const getCustomEpgUrl = (): string | null => {
  if (customEpgUrl === undefined) {
    // Initialize from localStorage if not set yet
    customEpgUrl = localStorage.getItem("iptv-epg-url");
  }
  return customEpgUrl;
};

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
 * Calculate estimated time remaining based on current parsing speed
 */
const calculateTimeRemaining = (processed: number, total: number, startTime: number): string => {
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
 * Prefetch EPG data for multiple channels
 */
export const prefetchEPGDataForChannels = async (channels: Channel[], onProgress?: (info: EPGProgressInfo) => void) => {
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
  
  console.log(`Starting EPG prefetch for ${channelsToFetch.length} channels (${channelsWithEpg.length - channelsToFetch.length} from cache)`);
  
  // Initialize progress tracking with timing information
  const startTime = Date.now();
  progressInfo = {
    total: channelsToFetch.length,
    processed: 0,
    progress: 0,
    isLoading: true,
    message: "Preparing EPG data...",
    startTime: startTime
  };
  
  if (onProgress) onProgress(progressInfo);
  
  // Pre-fetch and cache XML templates for better performance
  await prefetchCommonXmlTemplates();
  
  // Create a batching queue with controlled concurrency
  const processBatch = async (batch: Channel[]) => {
    const promises = batch.map(channel => {
      // Check cache again just to be sure
      if (hasValidCachedEPG(channel.epg_channel_id!)) {
        console.log(`Using cached EPG for ${channel.name}`);
        progressInfo.processed++;
        progressInfo.progress = progressInfo.processed / progressInfo.total;
        progressInfo.message = `Loading EPG: ${channel.name}`;
        
        // Calculate parsing speed and estimated time
        if (progressInfo.startTime) {
          const elapsedSecs = (Date.now() - progressInfo.startTime) / 1000;
          if (elapsedSecs > 0) {
            progressInfo.parsingSpeed = progressInfo.processed / elapsedSecs;
            progressInfo.estimatedTimeRemaining = calculateTimeRemaining(
              progressInfo.processed, 
              progressInfo.total, 
              progressInfo.startTime
            );
          }
        }
        
        if (onProgress) onProgress({ ...progressInfo });
        return Promise.resolve();
      }
      
      return fetchEPGData(channel)
        .then(() => {
          console.log(`Prefetched EPG for ${channel.name}`);
          progressInfo.processed++;
          progressInfo.progress = progressInfo.processed / progressInfo.total;
          progressInfo.message = `Loading EPG: ${channel.name}`;
          
          // Calculate parsing speed and estimated time
          if (progressInfo.startTime) {
            const elapsedSecs = (Date.now() - progressInfo.startTime) / 1000;
            if (elapsedSecs > 0) {
              progressInfo.parsingSpeed = progressInfo.processed / elapsedSecs;
              progressInfo.estimatedTimeRemaining = calculateTimeRemaining(
                progressInfo.processed, 
                progressInfo.total, 
                progressInfo.startTime
              );
            }
          }
          
          if (onProgress) onProgress({ ...progressInfo });
          
          // Save cache periodically
          if (progressInfo.processed % 10 === 0) {
            saveCache();
          }
        })
        .catch(err => {
          console.warn(`Failed to prefetch EPG for ${channel.name}:`, err);
          progressInfo.processed++;
          progressInfo.progress = progressInfo.processed / progressInfo.total;
          
          // Update speed metrics even on error
          if (progressInfo.startTime) {
            const elapsedSecs = (Date.now() - progressInfo.startTime) / 1000;
            if (elapsedSecs > 0) {
              progressInfo.parsingSpeed = progressInfo.processed / elapsedSecs;
              progressInfo.estimatedTimeRemaining = calculateTimeRemaining(
                progressInfo.processed, 
                progressInfo.total, 
                progressInfo.startTime
              );
            }
          }
          
          if (onProgress) onProgress({ ...progressInfo });
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
  progressInfo.progress = 1;
  progressInfo.isLoading = false;
  progressInfo.message = "EPG data loaded";
  if (onProgress) onProgress({ ...progressInfo });
  
  // Save complete cache
  saveCache();
  
  console.log("EPG prefetch completed");
};

// Templates cache for common EPG XML templates
const xmlTemplatesCache: Record<string, Document> = {};

/**
 * Prefetch common XML templates to avoid repeated network requests
 */
const prefetchCommonXmlTemplates = async () => {
  const templateUrls = [
    'https://iptv-org.github.io/epg/guides/template.xml',
    'https://xmltv.ch/xmltv/xmltv-template.xml'
  ];
  
  for (const url of templateUrls) {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        cache: 'force-cache'
      });
      
      if (response.ok) {
        console.log(`Validated EPG template URL: ${url}`);
      }
    } catch (error) {
      console.log(`Failed to prefetch template: ${url}`, error);
    }
  }
  
  return true;
};

/**
 * Fetch EPG data from a real EPG service
 */
export const fetchEPGData = async (channel: Channel | null): Promise<EPGProgram[] | null> => {
  if (!channel || !channel.epg_channel_id) {
    return null;
  }

  // Check cache first
  if (hasValidCachedEPG(channel.epg_channel_id)) {
    return EPG_CACHE[channel.epg_channel_id].data;
  }

  try {
    // Check if we have a custom EPG URL set
    const userEpgUrl = getCustomEpgUrl();
    
    if (userEpgUrl) {
      try {
        console.log(`Trying to fetch EPG from custom URL: ${userEpgUrl}`);
        
        // Use fetch with cache control
        const response = await fetch(userEpgUrl, { 
          method: 'GET',
          cache: 'force-cache' // Use browser cache when possible
        });
        
        if (response.ok) {
          const xmlText = await response.text();
          const programs = parseXmltvData(xmlText, channel.epg_channel_id);
          
          if (programs && programs.length > 0) {
            // Cache the results
            EPG_CACHE[channel.epg_channel_id] = {
              data: programs,
              timestamp: Date.now()
            };
            
            saveCache();
            return programs;
          }
        }
      } catch (error) {
        console.error(`Failed to fetch or parse custom EPG from ${userEpgUrl}:`, error);
        // Fall back to default sources if custom fails
      }
    }
    
    // Try XMLTV format first (most common for IPTV)
    const epgChannelId = encodeURIComponent(channel.epg_channel_id);
    
    // Try different XMLTV URLs with parallel fetching
    const xmltvUrls = [
      `https://iptv-org.github.io/epg/guides/${epgChannelId}.xml`,
      `https://xmltv.ch/xmltv/xmltv-${epgChannelId}.xml`,
      `https://github.com/iptv-org/epg/raw/master/sites/${epgChannelId}/guide.xml`
    ];
    
    // Try all URLs in parallel instead of sequentially
    const fetchPromises = xmltvUrls.map(url => 
      fetch(url, { 
        method: 'GET',
        cache: 'force-cache' // Use browser cache
      })
      .then(response => ({ url, response, ok: response.ok }))
      .catch(error => ({ url, error, ok: false }))
    );
    
    const results = await Promise.all(fetchPromises);
    
    // Process the first successful result
    for (const result of results) {
      if (result.ok) {
        try {
          console.log(`Successfully fetched EPG from: ${result.url}`);
          // Fix TypeScript error by checking for 'response' property
          if ('response' in result) {
            const xmlText = await result.response.text();
            const programs = parseXmltvData(xmlText, channel.epg_channel_id);
            
            if (programs && programs.length > 0) {
              // Cache the results
              EPG_CACHE[channel.epg_channel_id] = {
                data: programs,
                timestamp: Date.now()
              };
              
              saveCache();
              return programs;
            }
          }
        } catch (error) {
          console.log(`Failed to parse XMLTV EPG from ${result.url}:`, error);
          // Continue to the next URL
        }
      }
    }
    
    // Fallback to JSON format
    try {
      const jsonUrl = `https://iptv-org.github.io/epg/guides/${epgChannelId}.json`;
      console.log(`Trying to fetch EPG from JSON: ${jsonUrl}`);
      const response = await fetch(jsonUrl, { cache: 'force-cache' });
      
      if (response.ok) {
        const data = await response.json();
        const programs = processEPGData(data, channel.epg_channel_id);
        
        // Save to cache
        if (programs && programs.length > 0) {
          EPG_CACHE[channel.epg_channel_id] = {
            data: programs,
            timestamp: Date.now()
          };
          saveCache();
        }
        
        return programs;
      }
      
      // Try alternative format, some EPG IDs might be country-specific
      const countryParts = epgChannelId.split('.');
      if (countryParts.length > 1) {
        const countryCode = countryParts[0];
        const channelId = countryParts[1];
        const altJsonUrl = `https://iptv-org.github.io/epg/guides/${countryCode}/${channelId}.json`;
        
        console.log(`Trying alternative JSON format: ${altJsonUrl}`);
        const altResponse = await fetch(altJsonUrl, { cache: 'force-cache' });
        
        if (altResponse.ok) {
          const data = await altResponse.json();
          const programs = processEPGData(data, channel.epg_channel_id);
          
          // Save to cache
          if (programs && programs.length > 0) {
            EPG_CACHE[channel.epg_channel_id] = {
              data: programs,
              timestamp: Date.now()
            };
            saveCache();
          }
          
          return programs;
        }
      }
    } catch (error) {
      console.log("Error fetching JSON EPG data:", error);
    }
    
    console.warn(`No EPG data found for channel ID: ${channel.epg_channel_id}`);
    const demoData = generateDemoEPG(channel.epg_channel_id);
    
    // Cache even demo data to prevent repeated fetching
    EPG_CACHE[channel.epg_channel_id] = {
      data: demoData,
      timestamp: Date.now()
    };
    saveCache();
    
    return demoData;
  } catch (error) {
    console.error("Error fetching EPG data:", error);
    
    // Fall back to demo data if the API fails
    const demoData = generateDemoEPG(channel.epg_channel_id);
    
    // Cache the demo data
    EPG_CACHE[channel.epg_channel_id] = {
      data: demoData,
      timestamp: Date.now()
    };
    saveCache();
    
    return demoData;
  }
};

// Use a faster XML parsing method
const parser = new DOMParser();

/**
 * Parse XMLTV data format with optimized approach
 */
const parseXmltvData = (xmlText: string, channelId: string): EPGProgram[] => {
  try {
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      console.error("XML parsing error:", parserError.textContent);
      return [];
    }
    
    // Use a more efficient selector that targets just what we need
    // First check if this channel exists in the document
    const channelSelector = `channel[id*="${channelId}"]`;
    const channelExists = xmlDoc.querySelector(channelSelector);
    
    if (!channelExists) {
      console.log(`Channel ${channelId} not found in EPG XML`);
      return [];
    }
    
    // Get all programme elements for this channel only (more efficient)
    const programmeSelector = `programme[channel*="${channelId}"]`;
    const programmeElements = xmlDoc.querySelectorAll(programmeSelector);
    
    // If no programmes found for this channel
    if (programmeElements.length === 0) {
      console.log(`No programmes found for channel ${channelId}`);
      return [];
    }
    
    console.log(`Found ${programmeElements.length} programmes for channel ${channelId}`);
    
    // Pre-allocate array size for better performance
    const programCount = programmeElements.length;
    const programs: EPGProgram[] = new Array(programCount);
    let validProgramCount = 0;
    
    // Process all programme elements
    programmeElements.forEach(programme => {
      const startAttr = programme.getAttribute('start');
      const stopAttr = programme.getAttribute('stop');
      
      if (startAttr && stopAttr) {
        // Parse times more efficiently
        const start = parseXmltvTime(startAttr);
        const end = parseXmltvTime(stopAttr);
        
        // Only get the first title and description to save time
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
          
          programs[validProgramCount++] = program;
        }
      }
    });
    
    // Trim the array to actual size if needed
    if (validProgramCount < programCount) {
      programs.length = validProgramCount;
    }
    
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

// Optimized time parsing for XMLTV format
const parseXmltvTime = (timeString: string): Date | null => {
  try {
    // Remove timezone offset for now - use substring for better performance
    const cleanTime = timeString.length > 14 ? timeString.substring(0, 14) : timeString;
    
    // Extract components with parseInt (slightly faster)
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
 * Process the EPG data from the API response with optimized approach
 */
const processEPGData = (data: any, channelId: string): EPGProgram[] => {
  if (!data || !data.programmes) {
    return [];
  }
  
  try {
    // Use filter first to get only relevant programmes
    const relevantPrograms = data.programmes.filter(
      (program: any) => program.channel === channelId
    );
    
    if (relevantPrograms.length === 0) {
      return [];
    }
    
    console.log(`Found ${relevantPrograms.length} programmes for channel ${channelId} in JSON data`);
    
    // Pre-allocate array for better performance
    const programCount = relevantPrograms.length;
    const programs: EPGProgram[] = new Array(programCount);
    
    // Map is more efficient than forEach for transformations
    for (let i = 0; i < programCount; i++) {
      const program = relevantPrograms[i];
      programs[i] = {
        title: program.title || "Unknown Program",
        description: program.description || program.sub_title || "",
        start: new Date(program.start),
        end: new Date(program.stop),
        channelId: channelId
      };
    }
    
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
export type { EPGProgram, EPGProgressInfo };
