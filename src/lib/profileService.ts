
import { UserProfile, UserPreferences, RecentItem } from './types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

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
  console.log('[profileService] Getting current profile from localStorage');
  const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!storedProfile) {
    console.log('[profileService] No profile found in localStorage');
    return null;
  }
  
  try {
    const profile = JSON.parse(storedProfile) as UserProfile;
    
    // Convert stored date strings back to Date objects
    profile.createdAt = new Date(profile.createdAt);
    profile.preferences.recentlyWatched.forEach(item => {
      item.lastWatched = new Date(item.lastWatched);
    });
    
    console.log(`[profileService] Found profile for user: ${profile.username}`);
    console.log(`[profileService] Profile has ${profile.preferences.recentlyWatched.length} recently watched items`);
    
    return profile;
  } catch (error) {
    console.error('[profileService] Error parsing profile:', error);
    return null;
  }
};

// Create a new user profile
export const createProfile = (username: string, email?: string): UserProfile => {
  console.log(`[profileService] Creating new profile for user: ${username}`);
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
  console.log(`[profileService] Saving profile for user: ${profile.username}`);
  console.log(`[profileService] Profile has ${profile.preferences.recentlyWatched.length} recently watched items`);
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
};

// Update user preferences
export const updatePreferences = (preferences: Partial<UserPreferences>): UserProfile | null => {
  console.log('[profileService] Updating user preferences');
  const profile = getCurrentProfile();
  if (!profile) {
    console.warn('[profileService] Cannot update preferences: No profile found');
    return null;
  }
  
  profile.preferences = {
    ...profile.preferences,
    ...preferences
  };
  
  saveProfile(profile);
  return profile;
};

// Add channel to favorites
export const toggleFavoriteChannel = (channelId: string): boolean => {
  console.log(`[profileService] Toggling favorite status for channel: ${channelId}`);
  const profile = getCurrentProfile();
  if (!profile) {
    console.warn('[profileService] Cannot toggle favorite: No profile found');
    return false;
  }
  
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
export const addToRecentlyWatched = async (item: Omit<RecentItem, 'lastWatched'>): Promise<void> => {
  console.log(`[profileService] Adding to recently watched: ${item.type} "${item.title}" (${item.progress}%)`);
  
  const profile = getCurrentProfile();
  if (!profile) {
    console.warn('[profileService] Cannot add to recently watched: No profile found');
    console.log('[profileService] Creating profile is required before using watch history');
    return Promise.resolve(); // Return resolved promise instead of rejecting
  }
  
  // Remove if it already exists
  const existingIndex = profile.preferences.recentlyWatched.findIndex(i => i.id === item.id && i.type === item.type);
  if (existingIndex !== -1) {
    console.log(`[profileService] Updating existing item at index ${existingIndex}`);
    profile.preferences.recentlyWatched.splice(existingIndex, 1);
  }
  
  // Add to the beginning
  const newItem = {
    ...item,
    lastWatched: new Date()
  };
  
  profile.preferences.recentlyWatched.unshift(newItem);
  console.log(`[profileService] New item added. Total watched items: ${profile.preferences.recentlyWatched.length}`);
  
  // Limit to 20 items
  if (profile.preferences.recentlyWatched.length > 20) {
    console.log('[profileService] Trimming watch history to 20 items');
    profile.preferences.recentlyWatched = profile.preferences.recentlyWatched.slice(0, 20);
  }
  
  // Save to localStorage
  saveProfile(profile);
  
  // If user is authenticated, also save to Supabase
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      console.log('[profileService] User is authenticated, saving to Supabase');
      console.log('[profileService] User ID:', user.id);
      console.log('[profileService] Item details:', {
        content_id: item.id,
        content_type: item.type,
        title: item.title,
        poster: item.poster,
        progress: item.progress,
      });
      
      const { error } = await supabase
        .from('watch_history')
        .upsert({
          user_id: user.id,
          content_id: item.id,
          content_type: item.type,
          title: item.title,
          poster: item.poster || null,
          progress: item.progress || null,
        }, {
          onConflict: 'user_id, content_id, content_type'
        });
        
      if (error) {
        console.error('[profileService] Error saving watch history to Supabase:', error);
      } else {
        console.log('[profileService] Successfully saved watch history to Supabase');
      }
    } else {
      console.log('[profileService] User is not authenticated, only saved to localStorage');
    }
  } catch (error) {
    console.error('[profileService] Error saving watch history to Supabase:', error);
  }
  
  return Promise.resolve();
};

// Get recently watched items
export const getRecentlyWatched = (): RecentItem[] => {
  console.log('[profileService] Getting recently watched items');
  const profile = getCurrentProfile();
  if (!profile) {
    console.warn('[profileService] Cannot get recently watched: No profile found');
    return [];
  }
  
  console.log(`[profileService] Returning ${profile.preferences.recentlyWatched.length} recently watched items`);
  return profile.preferences.recentlyWatched;
};

// Fetch watch history from Supabase
export const fetchWatchHistoryFromSupabase = async (): Promise<RecentItem[]> => {
  console.log('[profileService] Fetching watch history from Supabase');
  try {
    const user = supabase.auth.getUser();
    const userId = (await user).data.user?.id;
    
    if (!userId) {
      console.warn('[profileService] Cannot fetch watch history: No authenticated user');
      return [];
    }
    
    console.log(`[profileService] Fetching watch history for user: ${userId}`);
    
    const { data, error } = await supabase
      .from('watch_history')
      .select('*')
      .order('watched_at', { ascending: false });
      
    if (error) {
      console.error('[profileService] Error fetching watch history:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('[profileService] No watch history found in Supabase');
      return [];
    }
    
    console.log(`[profileService] Fetched ${data.length} watch history items from Supabase`);
    
    return data.map(item => ({
      id: item.content_id,
      type: item.content_type as 'channel' | 'movie' | 'episode',
      title: item.title,
      poster: item.poster || undefined,
      lastWatched: new Date(item.watched_at),
      progress: item.progress
    }));
  } catch (error) {
    console.error('[profileService] Error fetching watch history from Supabase:', error);
    return [];
  }
};

// Clear watch history from both localStorage and Supabase
export const clearWatchHistory = async (): Promise<boolean> => {
  console.log('[profileService] Clearing watch history');
  try {
    const profile = getCurrentProfile();
    if (profile) {
      console.log('[profileService] Clearing watch history from localStorage');
      profile.preferences.recentlyWatched = [];
      saveProfile(profile);
    }
    
    const user = supabase.auth.getUser();
    const userId = (await user).data.user?.id;
    
    if (userId) {
      console.log('[profileService] Clearing watch history from Supabase');
      const { error } = await supabase
        .from('watch_history')
        .delete()
        .eq('user_id', userId);
        
      if (error) {
        console.error('[profileService] Error clearing watch history from Supabase:', error);
        throw error;
      }
      
      console.log('[profileService] Successfully cleared watch history from Supabase');
    }
    
    return true;
  } catch (error) {
    console.error('[profileService] Error clearing watch history:', error);
    return false;
  }
};

// Delete user profile
export const deleteProfile = (): void => {
  console.log('[profileService] Deleting user profile');
  localStorage.removeItem(PROFILE_STORAGE_KEY);
};
