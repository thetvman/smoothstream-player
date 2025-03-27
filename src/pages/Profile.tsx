
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { User, Settings, Heart, Clock, LogOut, Save, Tv, Link, MapPin } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useUserPosts, CreatePostParams } from "@/hooks/useUserPosts";

const profileFormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  bio: z.string().optional(),
  location: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
});

// Update the post form schema to match the required fields
const postFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters" }),
  is_published: z.boolean().default(true),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PostFormValues = z.infer<typeof postFormSchema>;

const Profile = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut, updateProfile } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { preferences, loading: preferencesLoading, updatePreferences } = useUserPreferences();
  const { posts, loading: postsLoading, createPost, updatePost, deletePost } = useUserPosts();
  
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const isLoading = authLoading || profileLoading || preferencesLoading;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/signin");
    }
  }, [user, authLoading, navigate]);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      bio: "",
      location: "",
      website: "",
    },
  });

  const postForm = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: "",
      content: "",
      is_published: true,
    },
  });

  // Update form when profile data is loaded
  useEffect(() => {
    if (profile) {
      profileForm.reset({
        username: profile.username || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
      });
    }
  }, [profile, profileForm]);

  const onProfileSubmit = async (values: ProfileFormValues) => {
    try {
      await updateProfile({
        username: values.username,
        bio: values.bio || null,
        location: values.location || null,
        website: values.website || null,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Fixed: Ensure we're passing a complete PostFormValues object to createPost and updatePost
  const onPostSubmit = async (values: PostFormValues) => {
    try {
      if (editingPostId) {
        // For updating, we pass a partial object which is fine
        await updatePost(editingPostId, {
          title: values.title,
          content: values.content,
          is_published: values.is_published
        });
        setEditingPostId(null);
      } else {
        // For creating, we need to pass a complete object with required fields
        await createPost({
          title: values.title,
          content: values.content,
          is_published: values.is_published
        });
      }
      postForm.reset({
        title: "",
        content: "",
        is_published: true,
      });
      setIsCreatingPost(false);
    } catch (error) {
      console.error("Error with post:", error);
    }
  };

  const handleEditPost = (post: any) => {
    postForm.reset({
      title: post.title,
      content: post.content,
      is_published: post.is_published,
    });
    setEditingPostId(post.id);
    setIsCreatingPost(true);
  };

  const handleCancelPost = () => {
    postForm.reset();
    setEditingPostId(null);
    setIsCreatingPost(false);
  };

  const handleDeletePost = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deletePost(id);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleToggleTheme = async () => {
    if (!preferences) return;
    
    const newTheme = preferences.theme === 'dark' ? 'light' : 'dark';
    await updatePreferences({ theme: newTheme });
    
    // Apply theme change immediately
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleToggleNotifications = async () => {
    if (!preferences) return;
    await updatePreferences({ 
      notification_enabled: !preferences.notification_enabled 
    });
  };

  if (isLoading) {
    return (
      <Layout fullHeight className="py-6 md:py-8">
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-center">
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user || !profile) {
    return (
      <Layout fullHeight className="py-6 md:py-8">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-muted-foreground">Profile not found</p>
            <Button onClick={() => navigate("/")} className="mt-4">
              Go to Home
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout fullHeight className="py-6 md:py-8">
      <div className="flex flex-col space-y-6 max-w-4xl mx-auto">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/")} className="flex items-center gap-1">
            Back to Home
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col items-center space-y-3">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
                  <AvatarFallback className="text-xl">
                    {profile.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-xl font-semibold">{profile.username}</h2>
                  {profile.bio && (
                    <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
                  )}
                  {profile.location && (
                    <p className="text-xs flex items-center justify-center gap-1 text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" /> {profile.location}
                    </p>
                  )}
                  {profile.website && (
                    <p className="text-xs flex items-center justify-center gap-1 text-muted-foreground mt-1">
                      <Link className="h-3 w-3" /> 
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {new URL(profile.website).hostname}
                      </a>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Member since {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <nav className="flex flex-col space-y-1">
                <Button variant="ghost" className="justify-start" onClick={() => navigate("/favorites")}>
                  <Heart className="mr-2 h-4 w-4" />
                  Favorites
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => navigate("/history")}>
                  <Clock className="mr-2 h-4 w-4" />
                  Watch History
                </Button>
                <Separator className="my-2" />
                <Button variant="destructive" className="justify-start" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </nav>
            </CardContent>
          </Card>

          <Tabs defaultValue="account">
            <TabsList className="grid w-full md:w-[400px] grid-cols-3">
              <TabsTrigger value="account">
                <User className="mr-2 h-4 w-4" />
                Account
              </TabsTrigger>
              <TabsTrigger value="preferences">
                <Settings className="mr-2 h-4 w-4" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="posts">
                <Tv className="mr-2 h-4 w-4" />
                Posts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Update your personal information here
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <FormField
                        control={profileForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              This is your public display name.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Tell us about yourself" />
                            </FormControl>
                            <FormDescription>
                              A brief description about yourself.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="City, Country" />
                            </FormControl>
                            <FormDescription>
                              Your location (optional).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input {...field} type="url" placeholder="https://example.com" />
                            </FormControl>
                            <FormDescription>
                              Your personal website or social media (optional).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="flex items-center gap-1">
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>
                    Customize your experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="theme">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Toggle between light and dark theme
                      </p>
                    </div>
                    <Switch
                      id="theme"
                      checked={preferences?.theme === 'dark'}
                      onCheckedChange={handleToggleTheme}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifications">Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable or disable notifications
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={preferences?.notification_enabled}
                      onCheckedChange={handleToggleNotifications}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="posts" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Your Posts</CardTitle>
                      <CardDescription>
                        Manage your content
                      </CardDescription>
                    </div>
                    {!isCreatingPost && (
                      <Button onClick={() => setIsCreatingPost(true)}>
                        Create Post
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isCreatingPost ? (
                    <Form {...postForm}>
                      <form onSubmit={postForm.handleSubmit(onPostSubmit)} className="space-y-4">
                        <FormField
                          control={postForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Post title" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={postForm.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Content</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Write your post content here..." rows={5} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={postForm.control}
                          name="is_published"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Published</FormLabel>
                                <FormDescription>
                                  Make this post visible to others
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button type="button" variant="outline" onClick={handleCancelPost}>
                            Cancel
                          </Button>
                          <Button type="submit">
                            {editingPostId ? 'Update Post' : 'Create Post'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  ) : postsLoading ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Loading posts...</p>
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">You haven't created any posts yet.</p>
                      <Button onClick={() => setIsCreatingPost(true)} className="mt-4">
                        Create Your First Post
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <Card key={post.id}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-lg">{post.title}</CardTitle>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(post.created_at).toLocaleDateString()} • 
                                  {post.is_published ? ' Published' : ' Draft'}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleEditPost(post)}>
                                  Edit
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleDeletePost(post.id)}>
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="whitespace-pre-wrap">{post.content}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
