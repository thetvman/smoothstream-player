
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
  try {
    // First check if the user is authenticated with Supabase
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // User is authenticated with Supabase, use Supabase for favorite management
      const profile = getCurrentProfile();
      
      // Check if the channel is already a favorite
      const isFavorite = profile?.preferences.favoriteChannels.includes(channelId) || false;
      
      if (isFavorite) {
        // Remove from favorites in Supabase
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', channelId)
          .eq('content_type', 'channel');
          
        if (error) {
          console.error('Error removing from favorites:', error);
          toast.error('Failed to remove from favorites');
          return true; // Keep it as favorite if removal failed
        }
        
        // Also update local profile if it exists
        if (profile) {
          profile.preferences.favoriteChannels = profile.preferences.favoriteChannels.filter(id => id !== channelId);
          saveProfile(profile);
        }
        
        toast.success(`Removed ${channelName} from favorites`);
        return false;
      } else {
        // Add to favorites in Supabase
        const { error } = await supabase
          .from('favorites')
          .upsert({
            user_id: user.id,
            content_id: channelId,
            content_type: 'channel',
            title: channelName,
            poster: channelLogo || null,
          });
          
        if (error) {
          console.error('Error adding to favorites:', error);
          toast.error('Failed to add to favorites');
          return false; // Keep it as not favorite if adding failed
        }
        
        // Also update local profile if it exists
        if (profile) {
          profile.preferences.favoriteChannels.push(channelId);
          saveProfile(profile);
        }
        
        toast.success(`Added ${channelName} to favorites`);
        return true;
      }
    } else {
      // Fall back to localStorage if not authenticated
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
        return false;
      } else {
        // Add to favorites
        profile.preferences.favoriteChannels.push(channelId);
        saveProfile(profile);
        toast.success(`Added ${channelName} to favorites`);
        return true;
      }
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    toast.error('An error occurred');
    return isChannelFavorite(channelId); // Return current state
  }
};

// Check if a channel is a favorite
export const isChannelFavorite = (channelId: string): boolean => {
  try {
    const profile = getCurrentProfile();
    if (!profile) return false;
    
    return profile.preferences.favoriteChannels.includes(channelId);
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
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
