
import { UserProfile, UserPreferences, RecentItem } from './types';
import { v4 as uuidv4 } from 'uuid';

const PROFILE_STORAGE_KEY = 'iptv-user-profile';

// Default preferences for new users
const defaultPreferences: UserPreferences = {
  theme: 'system',
  showEPG: true,
  autoPlayNext: true,
  defaultVolume: 70,
  favoriteChannels: [],
  favoriteMovies: [],
  favoriteSeries: [],
  recentlyWatched: []
};

// Get the current user profile from localStorage
export const getCurrentProfile = (): UserProfile | null => {
  const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!storedProfile) return null;
  
  try {
    const profile = JSON.parse(storedProfile) as UserProfile;
    
    // Convert stored date strings back to Date objects
    profile.createdAt = new Date(profile.createdAt);
    profile.preferences.recentlyWatched.forEach(item => {
      item.lastWatched = new Date(item.lastWatched);
    });
    
    return profile;
  } catch (error) {
    console.error('Error parsing profile:', error);
    return null;
  }
};

// Create a new user profile
export const createProfile = (username: string, email?: string): UserProfile => {
  const newProfile: UserProfile = {
    id: uuidv4(),
    username,
    email,
    createdAt: new Date(),
    preferences: defaultPreferences
  };
  
  saveProfile(newProfile);
  return newProfile;
};

// Save profile to localStorage
export const saveProfile = (profile: UserProfile): void => {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
};

// Update user preferences
export const updatePreferences = (preferences: Partial<UserPreferences>): UserProfile | null => {
  const profile = getCurrentProfile();
  if (!profile) return null;
  
  profile.preferences = {
    ...profile.preferences,
    ...preferences
  };
  
  saveProfile(profile);
  return profile;
};

// Add channel to favorites
export const toggleFavoriteChannel = (channelId: string): boolean => {
  const profile = getCurrentProfile();
  if (!profile) return false;
  
  const index = profile.preferences.favoriteChannels.indexOf(channelId);
  if (index === -1) {
    profile.preferences.favoriteChannels.push(channelId);
  } else {
    profile.preferences.favoriteChannels.splice(index, 1);
  }
  
  saveProfile(profile);
  return index === -1; // Return true if added, false if removed
};

// Check if a channel is a favorite
export const isChannelFavorite = (channelId: string): boolean => {
  const profile = getCurrentProfile();
  if (!profile) return false;
  
  return profile.preferences.favoriteChannels.includes(channelId);
};

// Add item to recently watched
export const addToRecentlyWatched = (item: Omit<RecentItem, 'lastWatched'>): void => {
  const profile = getCurrentProfile();
  if (!profile) return;
  
  // Remove if it already exists
  const existingIndex = profile.preferences.recentlyWatched.findIndex(i => i.id === item.id && i.type === item.type);
  if (existingIndex !== -1) {
    profile.preferences.recentlyWatched.splice(existingIndex, 1);
  }
  
  // Add to the beginning
  profile.preferences.recentlyWatched.unshift({
    ...item,
    lastWatched: new Date()
  });
  
  // Limit to 20 items
  if (profile.preferences.recentlyWatched.length > 20) {
    profile.preferences.recentlyWatched = profile.preferences.recentlyWatched.slice(0, 20);
  }
  
  saveProfile(profile);
};

// Get recently watched items
export const getRecentlyWatched = (): RecentItem[] => {
  const profile = getCurrentProfile();
  if (!profile) return [];
  
  return profile.preferences.recentlyWatched;
};

// Delete user profile
export const deleteProfile = (): void => {
  localStorage.removeItem(PROFILE_STORAGE_KEY);
};
