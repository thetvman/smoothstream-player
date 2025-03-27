
import { UserProfile, UserPreferences, RecentItem } from './types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  if (!storedProfile) {
    return null;
  }
  
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
  if (!profile) {
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
export const toggleFavoriteChannel = async (channelId: string, channelName: string, channelLogo?: string): Promise<boolean> => {
  const profile = getCurrentProfile();
  if (!profile) {
    toast.error('Sign in to add favorites');
    return false;
  }
  
  // Check if the channel is already a favorite
  const isFavorite = profile.preferences.favoriteChannels.includes(channelId);
  
  if (isFavorite) {
    // Remove from favorites
    profile.preferences.favoriteChannels = profile.preferences.favoriteChannels.filter(id => id !== channelId);
    saveProfile(profile);
    toast.success(`Removed ${channelName} from favorites`);
    
    // If user is authenticated, update in Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // First check if the record exists
        const { data: existingFav } = await supabase
          .from('favorites')
          .select()
          .eq('user_id', user.id)
          .eq('content_id', channelId)
          .eq('content_type', 'channel')
          .single();
          
        if (existingFav) {
          await supabase
            .from('favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('content_id', channelId)
            .eq('content_type', 'channel');
        }
      }
    } catch (error) {
      console.error('Error updating channel favorites in Supabase:', error);
    }
    
    return false;
  } else {
    // Add to favorites
    profile.preferences.favoriteChannels.push(channelId);
    saveProfile(profile);
    toast.success(`Added ${channelName} to favorites`);
    
    // If user is authenticated, save to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('favorites')
          .upsert({
            user_id: user.id,
            content_id: channelId,
            content_type: 'channel',
            title: channelName,
            poster: channelLogo || null,
          });
      }
    } catch (error) {
      console.error('Error saving channel favorites to Supabase:', error);
    }
    
    return true;
  }
};

// Check if a channel is a favorite
export const isChannelFavorite = (channelId: string): boolean => {
  const profile = getCurrentProfile();
  if (!profile) return false;
  
  return profile.preferences.favoriteChannels.includes(channelId);
};

// Add to recently watched - temporarily disabled
export const addToRecentlyWatched = async (item: Omit<RecentItem, 'lastWatched'>): Promise<void> => {
  // Watch history functionality temporarily disabled
  return Promise.resolve();
};

// Get recently watched items - temporarily disabled
export const getRecentlyWatched = (): RecentItem[] => {
  // Watch history functionality temporarily disabled
  return [];
};

// Fetch watch history from Supabase - temporarily disabled
export const fetchWatchHistoryFromSupabase = async (): Promise<RecentItem[]> => {
  // Watch history functionality temporarily disabled
  return [];
};

// Clear watch history - temporarily disabled
export const clearWatchHistory = async (): Promise<boolean> => {
  // Watch history functionality temporarily disabled
  return Promise.resolve(true);
};

// Delete user profile
export const deleteProfile = (): void => {
  localStorage.removeItem(PROFILE_STORAGE_KEY);
};
