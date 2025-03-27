
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// Make sure to define the parameters explicitly in the interface
export interface CreatePostParams {
  title: string;
  content: string;
  is_published?: boolean;
}

export const useUserPosts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) {
        setPosts([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setPosts(data as Post[]);
      } catch (error: any) {
        console.error('Error fetching user posts:', error);
        toast.error('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [user]);

  // Update to accept the explicitly typed parameter
  const createPost = async (newPost: CreatePostParams) => {
    if (!user) return null;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            user_id: user.id,
            title: newPost.title,
            content: newPost.content,
            is_published: newPost.is_published ?? true
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      setPosts(prev => [data as Post, ...prev]);
      toast.success('Post created successfully');
      return data as Post;
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updatePost = async (id: string, updates: Partial<Omit<Post, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return null;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id) // Extra security check
        .select()
        .single();

      if (error) throw error;
      
      setPosts(prev => prev.map(post => post.id === id ? (data as Post) : post));
      toast.success('Post updated successfully');
      return data as Post;
    } catch (error: any) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Extra security check

      if (error) throw error;
      
      setPosts(prev => prev.filter(post => post.id !== id));
      toast.success('Post deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    posts,
    loading,
    createPost,
    updatePost,
    deletePost
  };
};
