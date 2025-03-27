
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PlaylistInput from "@/components/PlaylistInput";
import { Playlist } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";
import { toast } from "sonner";
import { Film, Tv, Clapperboard } from "lucide-react";
import NavBar from "@/components/NavBar";

const Index = () => {
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  
  // Load playlist from localStorage on component mount
  useEffect(() => {
    const savedPlaylist = localStorage.getItem("iptv-playlist");
    
    if (savedPlaylist) {
      try {
        const parsedPlaylist = safeJsonParse(savedPlaylist, null);
        
        if (parsedPlaylist && parsedPlaylist.channels) {
          setPlaylist(parsedPlaylist);
        }
      } catch (error) {
        console.error("Error parsing saved playlist:", error);
        toast.error("Failed to load saved playlist");
      }
    }
  }, []);
  
  // Handle playlist loaded
  const handlePlaylistLoaded = (newPlaylist: Playlist) => {
    setPlaylist(newPlaylist);
  };

  // Handle logout/clear playlist
  const handleLogout = () => {
    localStorage.removeItem("iptv-playlist");
    setPlaylist(null);
    toast.success("Playlist cleared");
  };
  
  return (
    <>
      <NavBar onLogout={handleLogout} />
      
      <div className="container mx-auto p-4 max-w-7xl min-h-[calc(100vh-128px)] flex flex-col">
        {!playlist ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-lg border border-border">
              <h1 className="text-2xl font-bold mb-6 text-center">Welcome to HarmonyIPTV</h1>
              <PlaylistInput onPlaylistLoaded={handlePlaylistLoaded} />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <h1 className="text-3xl font-bold mb-6">Welcome to HarmonyIPTV</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div 
                className="bg-card border border-border hover:border-primary rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => navigate("/")}
              >
                <div className="p-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Tv className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Live TV</h2>
                  <p className="text-muted-foreground">
                    Watch live TV channels from your playlist
                  </p>
                  <p className="mt-4 text-sm font-medium text-primary">
                    {playlist.channels.length} Channels
                  </p>
                </div>
              </div>
              
              <div 
                className="bg-card border border-border hover:border-primary rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => navigate("/movies")}
              >
                <div className="p-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Film className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Movies</h2>
                  <p className="text-muted-foreground">
                    Browse and watch movies on demand
                  </p>
                  <p className="mt-4 text-sm font-medium text-primary">
                    VOD Movies
                  </p>
                </div>
              </div>
              
              <div 
                className="bg-card border border-border hover:border-primary rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => navigate("/series")}
              >
                <div className="p-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Clapperboard className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">TV Series</h2>
                  <p className="text-muted-foreground">
                    Enjoy series and episodes on demand
                  </p>
                  <p className="mt-4 text-sm font-medium text-primary">
                    VOD Series
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-auto text-center text-sm text-muted-foreground py-4">
              <p>HarmonyIPTV - Your Personal IPTV Experience</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Index;
