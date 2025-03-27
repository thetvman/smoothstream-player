
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
  // Initialize from localStorage if not set yet
  if (customEpgUrl === null) {
    try {
      customEpgUrl = localStorage.getItem("iptv-epg-url");
    } catch (error) {
      console.error("Error accessing localStorage:", error);
    }
  }
  return customEpgUrl;
};

// Initialize the URL from localStorage when the module loads
try {
  customEpgUrl = localStorage.getItem("iptv-epg-url");
  if (customEpgUrl) {
    console.log("Loaded EPG URL from localStorage:", customEpgUrl);
  }
} catch (error) {
  console.error("Error initializing EPG URL from localStorage:", error);
}
