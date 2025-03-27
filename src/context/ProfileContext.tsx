
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { UserProfile, UserPreferences } from '@/lib/types';
import { getCurrentProfile, createProfile, saveProfile, updatePreferences } from '@/lib/profileService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProfileContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  createUserProfile: (username: string, email?: string) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
  signOut: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Load profile from localStorage on component mount or when auth user changes
    const loadProfile = async () => {
      try {
        if (user) {
          // Try to fetch profile from Supabase first if user is authenticated
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (data) {
            // If we have a Supabase profile, convert it to our local format
            // This is a temporary measure until we fully migrate to Supabase
            const supabaseProfile = {
              id: data.id,
              username: data.username,
              email: user.email,
              createdAt: new Date(data.created_at),
              preferences: {
                theme: 'system',
                showEPG: true,
                autoPlayNext: true,
                defaultVolume: 70,
                favoriteChannels: [],
                favoriteMovies: [],
                favoriteSeries: [],
                recentlyWatched: []
              }
            };
            setProfile(supabaseProfile);
          } else {
            // Fallback to localStorage
            const savedProfile = getCurrentProfile();
            setProfile(savedProfile);
          }
        } else {
          // No authenticated user, try localStorage
          const savedProfile = getCurrentProfile();
          setProfile(savedProfile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your profile',
          variant: 'destructive',
        });
        
        // Fallback to localStorage
        const savedProfile = getCurrentProfile();
        setProfile(savedProfile);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [toast, user]);

  const createUserProfile = (username: string, email?: string) => {
    try {
      const newProfile = createProfile(username, email);
      setProfile(newProfile);
      toast({
        title: 'Profile Created',
        description: `Welcome, ${username}!`,
      });
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to create profile',
        variant: 'destructive',
      });
    }
  };

  const updateProfile = (updatedProfile: Partial<UserProfile>) => {
    if (!profile) return;

    try {
      const updated = { ...profile, ...updatedProfile };
      saveProfile(updated);
      setProfile(updated);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const updateUserPreferences = (preferences: Partial<UserPreferences>) => {
    if (!profile) return;

    try {
      const updatedProfile = updatePreferences(preferences);
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to update preferences',
        variant: 'destructive',
      });
    }
  };

  const signOut = () => {
    setProfile(null);
    localStorage.removeItem('iptv-user-profile');
    toast({
      title: 'Signed Out',
      description: 'You have been signed out successfully',
    });
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading,
        createUserProfile,
        updateProfile,
        updateUserPreferences,
        signOut,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
