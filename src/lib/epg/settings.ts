
// Store custom EPG URL
let customEpgUrl: string | null = null;

/**
 * Set a custom EPG URL for the application
 */
export const setCustomEpgUrl = (url: string | null) => {
  // Check if the URL is changing
  const isChanging = url !== customEpgUrl;
  
  customEpgUrl = url;
  
  // Save to localStorage
  if (url) {
    localStorage.setItem("iptv-epg-url", url);
  } else {
    localStorage.removeItem("iptv-epg-url");
  }
  
  return {
    url,
    isChanged: isChanging
  };
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
