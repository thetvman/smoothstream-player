
import { Channel, Playlist } from "./types";
import { v4 as uuidv4 } from "uuid";

/**
 * Parses an M3U8 playlist string into a structured Playlist object
 */
export const parseM3U8 = (content: string, playlistName = "My Playlist"): Playlist => {
  const lines = content.split("\n");
  const channels: Channel[] = [];
  
  if (!content.startsWith("#EXTM3U")) {
    throw new Error("Invalid M3U8 format");
  }
  
  let currentChannel: Partial<Channel> = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Parse channel info line
    if (line.startsWith("#EXTINF:")) {
      // Extract channel name
      const nameMatch = line.match(/,(.+)$/);
      if (nameMatch && nameMatch[1]) {
        currentChannel = {
          id: uuidv4(),
          name: nameMatch[1].trim(),
        };
      }
      
      // Extract logo if available
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      if (logoMatch && logoMatch[1]) {
        currentChannel.logo = logoMatch[1];
      }
      
      // Extract group if available
      const groupMatch = line.match(/group-title="([^"]+)"/);
      if (groupMatch && groupMatch[1]) {
        currentChannel.group = groupMatch[1];
      }
    }
    // Parse URL line (any non-comment line after an EXTINF)
    else if (!line.startsWith("#") && currentChannel.name) {
      currentChannel.url = line;
      channels.push(currentChannel as Channel);
      currentChannel = {};
    }
  }
  
  return {
    id: uuidv4(),
    name: playlistName,
    channels
  };
};

/**
 * Parse an uploaded file and return the playlist
 */
export const parsePlaylistFile = (file: File): Promise<Playlist> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const playlist = parseM3U8(content, file.name.replace(/\.\w+$/, ""));
        resolve(playlist);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Fetch a playlist from a URL with timeout and CORS handling
 */
export const fetchPlaylist = async (url: string, name = "Remote Playlist"): Promise<Playlist> => {
  console.log("Fetching playlist from:", url);
  
  try {
    // Add timeout to prevent eternal loading
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    // Try direct fetch first
    try {
      const response = await fetch(url, { 
        signal: controller.signal,
        headers: {
          'Accept': '*/*',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error("Failed to fetch playlist:", response.status, response.statusText);
        throw new Error(`Failed to fetch playlist: ${response.statusText}`);
      }
      
      const content = await response.text();
      console.log("Playlist content received, length:", content.length);
      
      if (!content.includes("#EXTM3U")) {
        console.error("Invalid M3U8 format, missing #EXTM3U header");
        throw new Error("Invalid playlist format");
      }
      
      const playlist = parseM3U8(content, name);
      console.log("Playlist parsed successfully, channels:", playlist.channels.length);
      return playlist;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.error("Playlist fetch error:", error);
    throw new Error(`Failed to fetch playlist: ${error instanceof Error ? error.message : String(error)}`);
  }
};
