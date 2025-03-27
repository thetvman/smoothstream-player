
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface UserPreferencesType {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  notification_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export const useUserPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferencesType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) {
        setPreferences(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          // PGRST116 is the error code for "no rows returned"
          throw error;
        }

        if (data) {
          setPreferences(data as UserPreferencesType);
        } else {
          // Create default preferences if none exist
          const { data: newPrefs, error: insertError } = await supabase
            .from('user_preferences')
            .insert([
              {
                user_id: user.id,
                theme: 'light',
                notification_enabled: true
              }
            ])
            .select()
            .single();

          if (insertError) throw insertError;
          setPreferences(newPrefs as UserPreferencesType);
        }
      } catch (error: any) {
        console.error('Error fetching user preferences:', error);
        toast.error('Failed to load preferences');
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [user]);

  const updatePreferences = async (newPrefs: Partial<Omit<UserPreferencesType, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user || !preferences) return null;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_preferences')
        .update(newPrefs)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setPreferences(data as UserPreferencesType);
      toast.success('Preferences updated');
      return data as UserPreferencesType;
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    preferences,
    loading,
    updatePreferences
  };
};
