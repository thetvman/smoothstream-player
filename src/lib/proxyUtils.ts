/**
 * Utility functions for proxying HTTP content in an HTTPS environment
 */

// Configure your proxy server URL here
export const PROXY_SERVER_URL = "https://cors-anywhere.herokuapp.com/"; // Example proxy - replace with your own

/**
 * Transforms an HTTP URL to use the proxy
 * @param url The original stream URL
 * @returns The proxied URL
 */
export const getProxiedUrl = (url: string): string => {
  // If URL is already HTTPS, no need to proxy
  if (url.startsWith("https://")) {
    return url;
  }
  
  // If URL is not HTTP (e.g., relative URL), return as is
  if (!url.startsWith("http://")) {
    return url;
  }
  
  // Otherwise, proxy the HTTP URL
  return `${PROXY_SERVER_URL}${url}`;
};

/**
 * Apply proxy to a channel URL
 * @param channel The channel to update
 * @returns A channel with proxied URL
 */
export const proxyChannel = <T extends { url: string }>(channel: T): T => {
  return {
    ...channel,
    url: getProxiedUrl(channel.url)
  };
};

/**
 * Check if the application is running in HTTPS
 * @returns boolean indicating if the app is on HTTPS
 */
export const isRunningOnHttps = (): boolean => {
  return window.location.protocol === "https:";
};

/**
 * Determines if proxying is needed for the current environment
 * @returns boolean indicating if proxying is needed
 */
export const needsProxying = (): boolean => {
  // Only proxy if we're running on HTTPS
  return isRunningOnHttps();
};
