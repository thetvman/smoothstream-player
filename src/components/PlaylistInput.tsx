import React, { useState } from "react";
import { Upload, Link, Tv } from "lucide-react";
import Button from "./common/Button";
import { parsePlaylistFile, fetchPlaylist, fetchFromXtream, validateAllowedUrl } from "@/lib/playlistParser";
import { Playlist, XtreamCredentials } from "@/lib/types";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

interface PlaylistInputProps {
  onPlaylistLoaded: (playlist: Playlist) => void;
  className?: string;
}

const PlaylistInput: React.FC<PlaylistInputProps> = ({ onPlaylistLoaded, className }) => {
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  
  const [xtreamCredentials, setXtreamCredentials] = useState<XtreamCredentials>({
    server: "",
    username: "",
    password: ""
  });
  const [serverError, setServerError] = useState<string | null>(null);
  
  const handlePlaylistProcessed = (playlist: Playlist) => {
    if (playlist.channels.length > 0) {
      toast.info(`Playlist loaded with ${playlist.channels.length} channels`, { duration: 3000 });
    }
    
    onPlaylistLoaded(playlist);
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    setLoadingProgress(10);
    
    try {
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          const newProgress = prev + Math.floor(Math.random() * 10);
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);
      
      const playlist = await parsePlaylistFile(file);
      
      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      if (playlist.channels.length === 0) {
        toast.error("No channels found in playlist file");
      } else {
        handlePlaylistProcessed(playlist);
        toast.success(`Loaded ${playlist.channels.length} channels from "${playlist.name}"`);
      }
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("Failed to parse playlist file. Please check format.");
      setLoadingProgress(0);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
      }, 500);
      
      e.target.value = "";
    }
  };
  
  const validateUrl = (url: string): boolean => {
    if (!url.trim()) {
      setUrlError("Please enter a URL");
      return false;
    }
    
    try {
      new URL(url);
    } catch (e) {
      setUrlError("Please enter a valid URL");
      return false;
    }
    
    if (!validateAllowedUrl(url)) {
      setUrlError("Only URLs from amri.wtf or deliverynetwork.online are allowed");
      return false;
    }
    
    setUrlError(null);
    return true;
  };
  
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedUrl = urlInput.trim();
    if (!validateUrl(trimmedUrl)) {
      return;
    }
    
    setLoading(true);
    setLoadingProgress(10);
    
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + Math.floor(Math.random() * 8);
        return newProgress > 80 ? 80 : newProgress;
      });
    }, 300);
    
    toast.info("Loading playlist...", { duration: 10000, id: "playlist-loading" });
    
    try {
      const playlist = await fetchPlaylist(trimmedUrl);
      
      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      if (playlist.channels.length === 0) {
        toast.error("No channels found in playlist");
      } else {
        handlePlaylistProcessed(playlist);
        toast.success(`Loaded ${playlist.channels.length} channels from "${playlist.name}"`, { id: "playlist-loading" });
        setUrlInput("");
      }
    } catch (error) {
      console.error("URL fetch error:", error);
      toast.error(`Failed to load playlist from URL: ${error instanceof Error ? error.message : "Unknown error"}`, { id: "playlist-loading" });
      clearInterval(progressInterval);
      setLoadingProgress(0);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
      }, 500);
    }
  };
  
  const validateXtreamServer = (server: string): boolean => {
    if (!server.trim()) {
      setServerError("Please enter a server URL");
      return false;
    }
    
    try {
      new URL(server);
    } catch (e) {
      setServerError("Please enter a valid server URL");
      return false;
    }
    
    if (!validateAllowedUrl(server)) {
      setServerError("Only servers from amri.wtf or deliverynetwork.online are allowed");
      return false;
    }
    
    setServerError(null);
    return true;
  };
  
  const handleXtreamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateXtreamServer(xtreamCredentials.server)) {
      return;
    }
    
    if (!xtreamCredentials.username || !xtreamCredentials.password) {
      toast.error("Please fill in all Xtream fields");
      return;
    }
    
    setLoading(true);
    setLoadingProgress(10);
    
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + Math.floor(Math.random() * 5);
        return newProgress > 70 ? 70 : newProgress;
      });
    }, 300);
    
    toast.info("Connecting to Xtream server...", { duration: 15000, id: "xtream-loading" });
    
    try {
      const playlist = await fetchFromXtream(xtreamCredentials);
      
      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      if (playlist.channels.length === 0) {
        toast.error("No channels found from Xtream server");
      } else {
        handlePlaylistProcessed(playlist);
        toast.success(`Loaded ${playlist.channels.length} channels from Xtream server`, { id: "xtream-loading" });
        
        setXtreamCredentials({
          server: "",
          username: "",
          password: ""
        });
      }
    } catch (error) {
      console.error("Xtream error:", error);
      toast.error(`Failed to connect to Xtream server: ${error instanceof Error ? error.message : "Unknown error"}`, { id: "xtream-loading" });
      clearInterval(progressInterval);
      setLoadingProgress(0);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
      }, 500);
    }
  };
  
  const handleXtreamInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setXtreamCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'server') {
      setServerError(null);
    }
  };
  
  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
    setUrlError(null);
  };
  
  const loadSamplePlaylist = async (url: string, name: string) => {
    if (!validateAllowedUrl(url)) {
      toast.error("Only URLs from amri.wtf or deliverynetwork.online are allowed");
      return;
    }
    
    setLoading(true);
    setLoadingProgress(10);
    
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + Math.floor(Math.random() * 8);
        return newProgress > 80 ? 80 : newProgress;
      });
    }, 300);
    
    toast.info("Loading sample playlist...", { duration: 10000, id: "sample-loading" });
    
    try {
      const playlist = await fetchPlaylist(url, name);
      
      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      if (playlist.channels.length === 0) {
        toast.error("No channels found in sample playlist");
      } else {
        handlePlaylistProcessed(playlist);
        toast.success(`Loaded ${playlist.channels.length} channels from "${playlist.name}"`, { id: "sample-loading" });
      }
    } catch (error) {
      console.error("Sample playlist error:", error);
      toast.error("Failed to load sample playlist", { id: "sample-loading" });
      clearInterval(progressInterval);
      setLoadingProgress(0);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
      }, 500);
    }
  };
  
  return (
    <div className={`bg-card rounded-lg border border-border p-4 ${className ?? ""}`}>
      <h2 className="text-lg font-medium mb-4">Load Playlist</h2>
      
      {loading && (
        <div className="mb-4">
          <Progress value={loadingProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {loadingProgress < 100 ? 'Loading playlist...' : 'Processing channels...'}
          </p>
        </div>
      )}
      
      <Tabs defaultValue="file" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="file" className="flex-1" disabled={loading}>File Upload</TabsTrigger>
          <TabsTrigger value="url" className="flex-1" disabled={loading}>M3U URL</TabsTrigger>
          <TabsTrigger value="xtream" className="flex-1" disabled={loading}>Xtream Codes</TabsTrigger>
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
          
          <div className="text-xs text-amber-500 mt-2 mb-4">
            Note: Only playlists with URLs from amri.wtf or deliverynetwork.online will be allowed to load.
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-2">Sample Playlists</p>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="secondary" 
                size="sm"
                disabled={loading}
                onClick={() => loadSamplePlaylist("http://amri.wtf/iptv/index.m3u", "AMRI Sample")}
              >
                AMRI Sample
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                disabled={loading}
                onClick={() => loadSamplePlaylist("http://amri.wtf/iptv/documentaries.m3u", "Documentaries")}
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
                    placeholder="http://amri.wtf/playlist.m3u8"
                    value={urlInput}
                    onChange={handleUrlInputChange}
                    disabled={loading}
                    className={`w-full bg-background border ${urlError ? 'border-red-500' : 'border-input'} rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 ${urlError ? 'focus:ring-red-500' : 'focus:ring-primary'}`}
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
              {urlError && (
                <p className="text-xs text-red-500 mt-1">{urlError}</p>
              )}
              <p className="text-xs text-amber-500 mt-2">
                Only URLs from amri.wtf or deliverynetwork.online are allowed.
              </p>
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
                    placeholder="http://amri.wtf:port"
                    value={xtreamCredentials.server}
                    onChange={handleXtreamInputChange}
                    disabled={loading}
                    className={`pl-9 ${serverError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  {serverError && (
                    <p className="text-xs text-red-500 mt-1">{serverError}</p>
                  )}
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
              
              <p className="mt-3 text-xs text-amber-500">
                Only servers from amri.wtf or deliverynetwork.online are allowed.
              </p>
              
              <p className="mt-1 text-xs text-muted-foreground">
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
