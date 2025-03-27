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
export const addToRecentlyWatched = async (item: Omit<RecentItem, 'lastWatched'>): Promise<void> => {
  const profile = getCurrentProfile();
  if (!profile) return;
  
  // Remove if it already exists
  const existingIndex = profile.preferences.recentlyWatched.findIndex(i => i.id === item.id && i.type === item.type);
  if (existingIndex !== -1) {
    profile.preferences.recentlyWatched.splice(existingIndex, 1);
  }
  
  // Add to the beginning
  const newItem = {
    ...item,
    lastWatched: new Date()
  };
  
  profile.preferences.recentlyWatched.unshift(newItem);
  
  // Limit to 20 items
  if (profile.preferences.recentlyWatched.length > 20) {
    profile.preferences.recentlyWatched = profile.preferences.recentlyWatched.slice(0, 20);
  }
  
  // Save to localStorage
  saveProfile(profile);
  
  // If user is authenticated, also save to Supabase
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      console.log('Saving watch history to Supabase for user:', user.id);
      console.log('Item details:', {
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
        console.error('Error saving watch history to Supabase:', error);
      } else {
        console.log('Successfully saved watch history to Supabase');
      }
    }
  } catch (error) {
    console.error('Error saving watch history to Supabase:', error);
  }
};

// Get recently watched items
export const getRecentlyWatched = (): RecentItem[] => {
  const profile = getCurrentProfile();
  if (!profile) return [];
  
  return profile.preferences.recentlyWatched;
};

// Fetch watch history from Supabase
export const fetchWatchHistoryFromSupabase = async (): Promise<RecentItem[]> => {
  try {
    const user = supabase.auth.getUser();
    const userId = (await user).data.user?.id;
    
    if (!userId) return [];
    
    const { data, error } = await supabase
      .from('watch_history')
      .select('*')
      .order('watched_at', { ascending: false });
      
    if (error) throw error;
    
    if (!data || data.length === 0) return [];
    
    return data.map(item => ({
      id: item.content_id,
      type: item.content_type as 'channel' | 'movie' | 'episode',
      title: item.title,
      poster: item.poster || undefined,
      lastWatched: new Date(item.watched_at),
      progress: item.progress
    }));
  } catch (error) {
    console.error('Error fetching watch history from Supabase:', error);
    return [];
  }
};

// Clear watch history from both localStorage and Supabase
export const clearWatchHistory = async (): Promise<boolean> => {
  try {
    const profile = getCurrentProfile();
    if (profile) {
      profile.preferences.recentlyWatched = [];
      saveProfile(profile);
    }
    
    const user = supabase.auth.getUser();
    const userId = (await user).data.user?.id;
    
    if (userId) {
      const { error } = await supabase
        .from('watch_history')
        .delete()
        .eq('user_id', userId);
        
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing watch history:', error);
    return false;
  }
};

// Delete user profile
export const deleteProfile = (): void => {
  localStorage.removeItem(PROFILE_STORAGE_KEY);
};
