
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useProfile } from "@/context/ProfileContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { User, Settings, Heart, Clock, LogOut, Save } from "lucide-react";
import { getRecentlyWatched } from "@/lib/profileService";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const profileFormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }).optional().or(z.literal('')),
});

const Profile = () => {
  const navigate = useNavigate();
  const { profile, isLoading, updateProfile, updateUserPreferences, signOut } = useProfile();
  const [recentItems, setRecentItems] = useState(getRecentlyWatched());

  useEffect(() => {
    if (!isLoading && !profile) {
      navigate("/");
    }
  }, [profile, isLoading, navigate]);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: profile?.username || "",
      email: profile?.email || "",
    },
  });

  const onSubmit = (values: z.infer<typeof profileFormSchema>) => {
    updateProfile({
      username: values.username,
      email: values.email || undefined,
    });
    toast("Profile updated successfully");
  };

  // Update form values when profile changes
  useEffect(() => {
    if (profile) {
      form.reset({
        username: profile.username,
        email: profile.email || "",
      });
    }
  }, [profile, form]);

  const handleToggleTheme = () => {
    if (!profile) return;
    
    const newTheme = profile.preferences.theme === 'dark' ? 'light' : 'dark';
    updateUserPreferences({ theme: newTheme });
    
    // Apply theme change immediately
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleToggleEPG = () => {
    if (!profile) return;
    updateUserPreferences({ showEPG: !profile.preferences.showEPG });
  };

  const handleToggleAutoPlay = () => {
    if (!profile) return;
    updateUserPreferences({ autoPlayNext: !profile.preferences.autoPlayNext });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    updateUserPreferences({ defaultVolume: parseInt(e.target.value) });
  };

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  if (isLoading || !profile) {
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
                  <AvatarImage src={profile.avatar} alt={profile.username} />
                  <AvatarFallback className="text-xl">
                    {profile.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-xl font-semibold">{profile.username}</h2>
                  {profile.email && (
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Member since {profile.createdAt.toLocaleDateString()}
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
            <TabsList className="grid w-full md:w-[400px] grid-cols-2">
              <TabsTrigger value="account">
                <User className="mr-2 h-4 w-4" />
                Account
              </TabsTrigger>
              <TabsTrigger value="preferences">
                <Settings className="mr-2 h-4 w-4" />
                Preferences
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
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
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
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormDescription>
                              Your email address (optional).
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
                    Customize your viewing experience
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
                      checked={profile.preferences.theme === 'dark'}
                      onCheckedChange={handleToggleTheme}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="epg">Show EPG Guide</Label>
                      <p className="text-sm text-muted-foreground">
                        Display program guide when available
                      </p>
                    </div>
                    <Switch
                      id="epg"
                      checked={profile.preferences.showEPG}
                      onCheckedChange={handleToggleEPG}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoplay">Auto Play Next</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically play next episode or recommended content
                      </p>
                    </div>
                    <Switch
                      id="autoplay"
                      checked={profile.preferences.autoPlayNext}
                      onCheckedChange={handleToggleAutoPlay}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="volume">Default Volume ({profile.preferences.defaultVolume}%)</Label>
                    <div className="flex items-center gap-2">
                      <input
                        id="volume"
                        type="range"
                        min="0"
                        max="100"
                        value={profile.preferences.defaultVolume}
                        onChange={handleVolumeChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Set your preferred default volume level
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {recentItems.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Recently Watched</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {recentItems.slice(0, 6).map((item) => (
                <Card key={`${item.type}-${item.id}`} className="overflow-hidden">
                  <div className="flex items-center p-4">
                    <div className="w-12 h-12 mr-4 rounded bg-muted flex items-center justify-center">
                      {item.type === 'channel' && <Tv className="h-6 w-6 text-primary" />}
                      {item.type === 'movie' && <User className="h-6 w-6 text-primary" />}
                      {item.type === 'episode' && <Settings className="h-6 w-6 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        Watched {new Date(item.lastWatched).toLocaleDateString()}
                      </p>
                      {item.progress && (
                        <div className="w-full h-1 bg-secondary mt-2 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
