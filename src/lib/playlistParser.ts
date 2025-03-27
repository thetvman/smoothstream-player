import { Channel, Playlist, XtreamCredentials, XtreamCategory, XtreamStream } from "./types";
import { v4 as uuidv4 } from "uuid";

/**
 * Parses an M3U8 playlist string into a structured Playlist object
 * with improved performance for large playlists
 */
export const parseM3U8 = (content: string, playlistName = "My Playlist"): Playlist => {
  const lines = content.split("\n");
  const channels: Channel[] = [];
  
  if (!content.startsWith("#EXTM3U")) {
    throw new Error("Invalid M3U8 format");
  }
  
  let currentChannel: Partial<Channel> = {};
  let lineCount = 0;
  const totalLines = lines.length;
  
  for (let i = 0; i < totalLines; i++) {
    // Process in chunks to avoid UI freezing
    lineCount++;
    
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

      // Extract EPG channel ID if available
      const epgMatch = line.match(/tvg-id="([^"]+)"/);
      if (epgMatch && epgMatch[1]) {
        currentChannel.epg_channel_id = epgMatch[1];
      }
    }
    // Parse URL line (any non-comment line after an EXTINF)
    else if (!line.startsWith("#") && currentChannel.name) {
      currentChannel.url = line;
      // Determine stream type from URL
      if (line.endsWith(".ts")) {
        currentChannel.stream_type = "ts";
      } else if (line.endsWith(".m3u8")) {
        currentChannel.stream_type = "m3u8";
      }
      channels.push(currentChannel as Channel);
      currentChannel = {};
    }
  }
  
  return {
    id: uuidv4(),
    name: playlistName,
    channels,
    source: "m3u8"
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

/**
 * Get the proper URL format for an Xtream stream
 * This function handles different stream types and formats the URL accordingly
 */
const getXtreamStreamUrl = (
  baseUrl: string, 
  username: string, 
  password: string, 
  streamId: number, 
  streamType: string = ""
): string => {
  // Default container format
  let container = "ts";
  
  // Use m3u8 container for live streams when possible for better compatibility
  if (streamType === "live") {
    container = "m3u8";
  }
  
  // Build the appropriate URL format
  return `${baseUrl}/live/${username}/${password}/${streamId}.${container}`;
};

/**
 * Fetch channels from Xtream Codes API
 */
export const fetchFromXtream = async (credentials: XtreamCredentials): Promise<Playlist> => {
  const { server, username, password } = credentials;
  console.log("Connecting to Xtream server:", server);
  
  // Clean the server URL by removing trailing slashes
  const baseUrl = server.replace(/\/$/, "");
  
  try {
    // Validate credentials by fetching user info
    const userInfoUrl = `${baseUrl}/player_api.php?username=${username}&password=${password}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const infoResponse = await fetch(userInfoUrl, { signal: controller.signal });
    
    clearTimeout(timeoutId);
    
    if (!infoResponse.ok) {
      throw new Error(`Authentication failed: ${infoResponse.statusText}`);
    }
    
    const userInfo = await infoResponse.json();
    
    if (userInfo.user_info?.auth === 0) {
      throw new Error("Invalid Xtream credentials");
    }
    
    // Fetch live TV channels
    console.log("Fetching Xtream live channels...");
    const liveCategoriesUrl = `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_live_categories`;
    const liveStreamsUrl = `${baseUrl}/player_api.php?username=${username}&password=${password}&action=get_live_streams`;
    
    const [categoriesResponse, streamsResponse] = await Promise.all([
      fetch(liveCategoriesUrl),
      fetch(liveStreamsUrl)
    ]);
    
    const categories = await categoriesResponse.json() as XtreamCategory[];
    const streams = await streamsResponse.json() as XtreamStream[];
    
    if (!Array.isArray(streams)) {
      throw new Error("Invalid response from Xtream server");
    }
    
    console.log(`Found ${streams.length} channels from Xtream`);
    
    // Create category lookup
    const categoryMap: Record<string, string> = {};
    if (Array.isArray(categories)) {
      categories.forEach((cat) => {
        if (cat.category_id && cat.category_name) {
          categoryMap[cat.category_id] = cat.category_name;
        }
      });
    }
    
    // Create channels from streams
    const channels: Channel[] = streams.map((stream) => {
      // Generate both TS and M3U8 URLs for better compatibility
      const streamUrl = getXtreamStreamUrl(baseUrl, username, password, stream.stream_id, "live");
      
      return {
        id: uuidv4(),
        name: stream.name || `Channel ${stream.stream_id}`,
        url: streamUrl,
        logo: stream.stream_icon || undefined,
        group: stream.category_id ? categoryMap[stream.category_id] : undefined,
        epg_channel_id: stream.epg_channel_id || undefined,
        stream_type: streamUrl.endsWith('.m3u8') ? 'm3u8' : 'ts'
      };
    });
    
    const serverName = new URL(baseUrl).hostname;
    
    return {
      id: uuidv4(),
      name: `${serverName} (Xtream)`,
      channels,
      source: "xtream",
      credentials // Store credentials for potential refresh
    };
  } catch (error) {
    console.error("Xtream API error:", error);
    throw new Error(`Failed to connect to Xtream server: ${error instanceof Error ? error.message : String(error)}`);
  }
};
