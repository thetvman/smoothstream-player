
import { EPGProgram, EPGParsingOptions } from './types';

// Use a faster XML parsing method
const parser = new DOMParser();

/**
 * Parse XMLTV data format with optimized approach
 */
export const parseXmltvData = (
  xmlText: string, 
  channelId: string, 
  singleChannelMode: boolean = false
): EPGProgram[] => {
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
    
    if (singleChannelMode) {
      console.log(`Single channel mode: Found ${programmeElements.length} programmes for channel ${channelId}`);
    } else {
      console.log(`Found ${programmeElements.length} programmes for channel ${channelId}`);
    }
    
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
    
    return programs;
  } catch (error) {
    console.error("Error parsing XMLTV data:", error);
    return [];
  }
};

// Optimized time parsing for XMLTV format
export const parseXmltvTime = (timeString: string): Date | null => {
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
