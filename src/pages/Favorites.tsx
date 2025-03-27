
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Heart, Film, Tv } from "lucide-react";
import { useProfile } from "@/context/ProfileContext";
import { Channel } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";
import { optimizeImageUrl } from "@/lib/utils";

const Favorites = () => {
  const navigate = useNavigate();
  const { profile, isLoading } = useProfile();
  const [favoriteChannels, setFavoriteChannels] = useState<Channel[]>([]);
  
  useEffect(() => {
    // Load channels from playlist in localStorage
    const savedPlaylist = localStorage.getItem("iptv-playlist");
    if (savedPlaylist && profile) {
      const parsedPlaylist = safeJsonParse(savedPlaylist, { channels: [] });
      if (parsedPlaylist && parsedPlaylist.channels) {
        // Filter to only show favorite channels
        const favorites = parsedPlaylist.channels.filter(
          (channel: Channel) => profile.preferences.favoriteChannels.includes(channel.id)
        );
        setFavoriteChannels(favorites);
      }
    }
  }, [profile]);
  
  const handlePlayChannel = (channelId: string) => {
    navigate(`/player/${channelId}`);
  };
  
  if (isLoading || !profile) {
    return (
      <Layout fullHeight className="py-6 md:py-8">
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-center">
            <p className="text-muted-foreground">Loading favorites...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout fullHeight className="py-6 md:py-8">
      <div className="flex flex-col space-y-6 max-w-4xl mx-auto">
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/")}
              className="h-8 w-8 mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Favorites</h1>
              <p className="text-muted-foreground">Your favorite content</p>
            </div>
          </div>
        </header>
        
        <Tabs defaultValue="channels">
          <TabsList>
            <TabsTrigger value="channels" className="flex items-center gap-1">
              <Tv className="h-4 w-4 mr-1" />
              Channels
            </TabsTrigger>
            <TabsTrigger value="movies" className="flex items-center gap-1">
              <Film className="h-4 w-4 mr-1" />
              Movies
            </TabsTrigger>
            <TabsTrigger value="series" className="flex items-center gap-1">
              <Tv className="h-4 w-4 mr-1" />
              Series
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="channels" className="mt-6">
            {favoriteChannels.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {favoriteChannels.map((channel) => (
                  <Card 
                    key={channel.id}
                    className="overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handlePlayChannel(channel.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 relative flex-shrink-0 rounded overflow-hidden bg-muted">
                          {channel.logo ? (
                            <img
                              src={optimizeImageUrl(channel.logo)}
                              alt={channel.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full">
                              <Tv className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{channel.name}</h3>
                          {channel.group_title && (
                            <p className="text-sm text-muted-foreground truncate">
                              {channel.group_title}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No favorite channels</h3>
                <p className="text-muted-foreground mt-1">
                  Add channels to your favorites to see them here
                </p>
                <Button className="mt-4" onClick={() => navigate("/")}>
                  Browse Channels
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="movies" className="mt-6">
            <div className="text-center py-12">
              <Film className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No favorite movies</h3>
              <p className="text-muted-foreground mt-1">
                Add movies to your favorites to see them here
              </p>
              <Button className="mt-4" onClick={() => navigate("/movies")}>
                Browse Movies
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="series" className="mt-6">
            <div className="text-center py-12">
              <Tv className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No favorite series</h3>
              <p className="text-muted-foreground mt-1">
                Add series to your favorites to see them here
              </p>
              <Button className="mt-4" onClick={() => navigate("/series")}>
                Browse Series
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Favorites;
