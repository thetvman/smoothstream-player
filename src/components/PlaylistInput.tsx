
import React, { useState } from "react";
import { Upload, Link } from "lucide-react";
import Button from "./common/Button";
import { parsePlaylistFile, fetchPlaylist } from "@/lib/playlistParser";
import { Playlist } from "@/lib/types";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface PlaylistInputProps {
  onPlaylistLoaded: (playlist: Playlist) => void;
  className?: string;
}

const PlaylistInput: React.FC<PlaylistInputProps> = ({ onPlaylistLoaded, className }) => {
  const [loading, setLoading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  
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
      
      <div className="space-y-6">
        {/* File upload */}
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
        
        <div className="relative flex items-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-2 text-xs text-muted-foreground">OR</span>
          </div>
        </div>
        
        {/* URL input */}
        <form onSubmit={handleUrlSubmit}>
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
        </form>
        
        {/* Demo playlists */}
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
      </div>
    </div>
  );
};

export default PlaylistInput;
