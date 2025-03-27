
import { Channel } from "./types";

interface EPGProgram {
  title: string;
  description?: string;
  start: Date;
  end: Date;
  channelId: string;
}

// Demo EPG data (replace with actual API integration)
const DEMO_EPG_DATA: Record<string, EPGProgram[]> = {};

// Create some demo data
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

// Function to fetch EPG data for a channel
export const fetchEPGData = async (channel: Channel | null): Promise<EPGProgram[] | null> => {
  if (!channel || !channel.epg_channel_id) {
    return null;
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate demo data if we don't have it yet
  if (!DEMO_EPG_DATA[channel.epg_channel_id]) {
    DEMO_EPG_DATA[channel.epg_channel_id] = generateDemoEPG(channel.epg_channel_id);
  }
  
  return DEMO_EPG_DATA[channel.epg_channel_id];
};

// For a real implementation, you would connect to an actual EPG API
// Example integration with a real EPG service:
/*
export const fetchEPGData = async (channel: Channel | null): Promise<EPGProgram[] | null> => {
  if (!channel || !channel.epg_channel_id) {
    return null;
  }

  try {
    // Replace with your actual EPG API endpoint
    const response = await fetch(`https://api.epg.com/guide?channel=${channel.epg_channel_id}`);
    
    if (!response.ok) {
      throw new Error(`EPG API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform the API response to our EPGProgram format
    return data.programs.map((program: any) => ({
      title: program.title,
      description: program.description,
      start: new Date(program.start_time),
      end: new Date(program.end_time),
      channelId: channel.epg_channel_id
    }));
  } catch (error) {
    console.error("Error fetching EPG data:", error);
    return null;
  }
};
*/

// Export the EPGProgram type so it can be imported elsewhere
export type { EPGProgram };
