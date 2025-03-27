
import React, { useState } from "react";
import { Upload, Link, Tv } from "lucide-react";
import Button from "./common/Button";
import { parsePlaylistFile, fetchPlaylist, fetchFromXtream } from "@/lib/playlistParser";
import { Playlist, XtreamCredentials } from "@/lib/types";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

interface PlaylistInputProps {
  onPlaylistLoaded: (playlist: Playlist) => void;
  className?: string;
}

const PlaylistInput: React.FC<PlaylistInputProps> = ({ onPlaylistLoaded, className }) => {
  const [loading, setLoading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  
  // Xtream credentials
  const [xtreamCredentials, setXtreamCredentials] = useState<XtreamCredentials>({
    server: "",
    username: "",
    password: ""
  });
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    
    try {
      const playlist = await parsePlaylistFile(file);
      if (playlist.channels.length === 0) {
        toast.error("No channels found in playlist file");
      } else {
        onPlaylistLoaded(playlist);
        toast.success(`Loaded ${playlist.channels.length} channels from "${playlist.name}"`);
      }
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("Failed to parse playlist file. Please check format.");
    } finally {
      setLoading(false);
      // Reset file input
      e.target.value = "";
    }
  };
  
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedUrl = urlInput.trim();
    if (!trimmedUrl) {
      toast.error("Please enter a valid URL");
      return;
    }
    
    // Validate URL format
    try {
      new URL(trimmedUrl);
    } catch (e) {
      toast.error("Please enter a valid URL");
      return;
    }
    
    setLoading(true);
    toast.info("Loading playlist...", { duration: 10000, id: "playlist-loading" });
    
    try {
      const playlist = await fetchPlaylist(trimmedUrl);
      
      if (playlist.channels.length === 0) {
        toast.error("No channels found in playlist");
      } else {
        onPlaylistLoaded(playlist);
        toast.success(`Loaded ${playlist.channels.length} channels from "${playlist.name}"`, { id: "playlist-loading" });
        setUrlInput("");
      }
    } catch (error) {
      console.error("URL fetch error:", error);
      toast.error(`Failed to load playlist from URL: ${error instanceof Error ? error.message : "Unknown error"}`, { id: "playlist-loading" });
    } finally {
      setLoading(false);
    }
  };
  
  const handleXtreamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!xtreamCredentials.server || !xtreamCredentials.username || !xtreamCredentials.password) {
      toast.error("Please fill in all Xtream fields");
      return;
    }
    
    // Validate server URL
    try {
      new URL(xtreamCredentials.server);
    } catch (e) {
      toast.error("Please enter a valid server URL");
      return;
    }
    
    setLoading(true);
    toast.info("Connecting to Xtream server...", { duration: 15000, id: "xtream-loading" });
    
    try {
      const playlist = await fetchFromXtream(xtreamCredentials);
      
      if (playlist.channels.length === 0) {
        toast.error("No channels found from Xtream server");
      } else {
        onPlaylistLoaded(playlist);
        toast.success(`Loaded ${playlist.channels.length} channels from Xtream server`, { id: "xtream-loading" });
        
        // Reset form
        setXtreamCredentials({
          server: "",
          username: "",
          password: ""
        });
      }
    } catch (error) {
      console.error("Xtream error:", error);
      toast.error(`Failed to connect to Xtream server: ${error instanceof Error ? error.message : "Unknown error"}`, { id: "xtream-loading" });
    } finally {
      setLoading(false);
    }
  };
  
  const handleXtreamInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setXtreamCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const loadSamplePlaylist = async (url: string, name: string) => {
    setLoading(true);
    toast.info("Loading sample playlist...", { duration: 10000, id: "sample-loading" });
    
    try {
      const playlist = await fetchPlaylist(url, name);
      
      if (playlist.channels.length === 0) {
        toast.error("No channels found in sample playlist");
      } else {
        onPlaylistLoaded(playlist);
        toast.success(`Loaded ${playlist.channels.length} channels from "${playlist.name}"`, { id: "sample-loading" });
      }
    } catch (error) {
      console.error("Sample playlist error:", error);
      toast.error("Failed to load sample playlist", { id: "sample-loading" });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={`bg-card rounded-lg border border-border p-4 ${className ?? ""}`}>
      <h2 className="text-lg font-medium mb-4">Load Playlist</h2>
      
      <Tabs defaultValue="file" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="file" className="flex-1">File Upload</TabsTrigger>
          <TabsTrigger value="url" className="flex-1">M3U URL</TabsTrigger>
          <TabsTrigger value="xtream" className="flex-1">Xtream Codes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="file" className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Upload a local M3U/M3U8 file</p>
            <label className="block">
              <div className={`flex items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer ${loading ? 'opacity-50' : 'hover:bg-secondary/50'} transition-colors`}>
                {loading ? (
                  <div className="flex flex-col items-center space-y-2">
                    <Skeleton className="w-8 h-8 rounded-full bg-muted" />
                    <span className="text-sm text-muted-foreground">Processing...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to browse or drop file here
                    </span>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept=".m3u,.m3u8,text/plain"
                onChange={handleFileUpload}
                disabled={loading}
                className="hidden"
              />
            </label>
          </div>
          
          {/* Sample playlists */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Sample Playlists</p>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="secondary" 
                size="sm"
                disabled={loading}
                onClick={() => loadSamplePlaylist("https://iptv-org.github.io/iptv/index.m3u", "IPTV.org Sample")}
              >
                IPTV.org Sample
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                disabled={loading}
                onClick={() => loadSamplePlaylist("https://iptv-org.github.io/iptv/categories/documentary.m3u", "Documentaries")}
              >
                Documentaries
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="url">
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Load from URL</p>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="url"
                    placeholder="https://example.com/playlist.m3u8"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    disabled={loading}
                    className="w-full bg-background border border-input rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading || !urlInput.trim()} 
                  loading={loading}
                >
                  Load
                </Button>
              </div>
            </div>
          </form>
        </TabsContent>
        
        <TabsContent value="xtream">
          <form onSubmit={handleXtreamSubmit} className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Connect to Xtream Codes Server</p>
              
              <div className="space-y-3">
                <div className="relative">
                  <Tv className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    name="server"
                    placeholder="Server URL (http://example.com:port)"
                    value={xtreamCredentials.server}
                    onChange={handleXtreamInputChange}
                    disabled={loading}
                    className="pl-9"
                  />
                </div>
                
                <Input
                  name="username"
                  placeholder="Username"
                  value={xtreamCredentials.username}
                  onChange={handleXtreamInputChange}
                  disabled={loading}
                />
                
                <Input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={xtreamCredentials.password}
                  onChange={handleXtreamInputChange}
                  disabled={loading}
                />
                
                <Button 
                  type="submit"
                  className="w-full" 
                  disabled={loading} 
                  loading={loading}
                >
                  Connect
                </Button>
              </div>
              
              <p className="mt-3 text-xs text-muted-foreground">
                Note: Your credentials are stored locally and never sent to any third party.
              </p>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlaylistInput;

