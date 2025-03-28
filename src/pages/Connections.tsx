
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Trash2, BarChart3, Globe, Clock, Film, Tv } from "lucide-react";
import { XtreamCredentials, Channel, Movie, Series } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";

interface ConnectionStats {
  id: string;
  name: string;
  url: string;
  username: string;
  password: string;
  added: string;
  lastAccessed: string;
  totalWatchTime: number;
  channels: number;
  watchedChannels: string[];
  watchedMovies: string[];
  watchedEpisodes: string[];
}

interface WatchHistoryItem {
  id: string;
  name: string;
  type: "channel" | "movie" | "episode";
  watchTime: number;
  lastWatched: string;
  thumbnailUrl?: string;
}

const Connections = () => {
  const navigate = useNavigate();
  const [connections, setConnections] = useState<ConnectionStats[]>([]);
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([]);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
  const [activeTab, setActiveTab] = useState("connections");

  useEffect(() => {
    // Load connections and stats from localStorage
    loadConnectionStats();
    loadWatchHistory();
  }, []);

  const loadConnectionStats = () => {
    // Load playlist (for connection info)
    const savedPlaylist = localStorage.getItem("iptv-playlist");
    const watchTimeData = safeJsonParse<Record<string, number>>(localStorage.getItem("iptv-watch-time") || "{}", {});
    const watchedChannels = safeJsonParse<Record<string, string[]>>(localStorage.getItem("iptv-watched-channels") || "{}", {});
    const watchedMovies = safeJsonParse<Record<string, string[]>>(localStorage.getItem("iptv-watched-movies") || "{}", {});
    const watchedEpisodes = safeJsonParse<Record<string, string[]>>(localStorage.getItem("iptv-watched-episodes") || "{}", {});
    
    if (savedPlaylist) {
      const playlist = safeJsonParse(savedPlaylist, null);
      if (playlist) {
        const credentials = playlist.credentials as XtreamCredentials;
        if (credentials) {
          const connection: ConnectionStats = {
            id: playlist.id,
            name: playlist.name,
            url: credentials.server,
            username: credentials.username,
            password: credentials.password,
            added: localStorage.getItem("iptv-connection-added") || new Date().toISOString(),
            lastAccessed: localStorage.getItem("iptv-last-accessed") || new Date().toISOString(),
            totalWatchTime: Object.values(watchTimeData).reduce((sum, time) => sum + time, 0),
            channels: playlist.channels.length,
            watchedChannels: watchedChannels[playlist.id] || [],
            watchedMovies: watchedMovies[playlist.id] || [],
            watchedEpisodes: watchedEpisodes[playlist.id] || [],
          };
          setConnections([connection]);
          
          // Save the added date if it doesn't exist
          if (!localStorage.getItem("iptv-connection-added")) {
            localStorage.setItem("iptv-connection-added", new Date().toISOString());
          }
          
          // Update last accessed time
          localStorage.setItem("iptv-last-accessed", new Date().toISOString());
        }
      }
    }
  };
  
  const loadWatchHistory = () => {
    // Load watch history
    const watchTimeData = safeJsonParse<Record<string, number>>(localStorage.getItem("iptv-watch-time") || "{}", {});
    const watchHistoryData = safeJsonParse<Record<string, WatchHistoryItem>>(localStorage.getItem("iptv-watch-history") || "{}", {});
    
    // Convert to array and sort by last watched date
    const historyArray = Object.values(watchHistoryData);
    historyArray.sort((a, b) => new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime());
    
    setWatchHistory(historyArray);
  };
  
  const formatWatchTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };
  
  const formatSensitiveText = (text: string) => {
    if (!showSensitiveInfo) {
      return "••••••••••";
    }
    return text;
  };
  
  const clearWatchData = () => {
    if (confirm("Are you sure you want to clear all watch history data? This cannot be undone.")) {
      localStorage.removeItem("iptv-watch-time");
      localStorage.removeItem("iptv-watch-history");
      localStorage.removeItem("iptv-watched-channels");
      localStorage.removeItem("iptv-watched-movies");
      localStorage.removeItem("iptv-watched-episodes");
      
      // Reload data
      loadConnectionStats();
      loadWatchHistory();
    }
  };
  
  return (
    <Layout fullHeight className="py-6 md:py-8">
      <div className="flex flex-col space-y-6">
        <header className="flex flex-col space-y-1">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight">Connections & Stats</h1>
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              Back
            </Button>
          </div>
          <p className="text-muted-foreground">Manage your connections and view your streaming stats</p>
        </header>
        
        <Tabs defaultValue="connections" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="connections">
              <Globe className="w-4 h-4 mr-2" /> Connections
            </TabsTrigger>
            <TabsTrigger value="stats">
              <BarChart3 className="w-4 h-4 mr-2" /> Watch History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="connections" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">IPTV Connections</h2>
              <div className="flex items-center gap-2">
                <Switch
                  id="show-sensitive"
                  checked={showSensitiveInfo}
                  onCheckedChange={setShowSensitiveInfo}
                />
                <label htmlFor="show-sensitive" className="text-sm cursor-pointer">
                  {showSensitiveInfo ? <Eye className="w-4 h-4 inline mr-1" /> : <EyeOff className="w-4 h-4 inline mr-1" />}
                  {showSensitiveInfo ? "Hide Sensitive Info" : "Show Sensitive Info"}
                </label>
              </div>
            </div>
            
            {connections.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-1">
                {connections.map((connection) => (
                  <Card key={connection.id}>
                    <CardHeader>
                      <CardTitle>{connection.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium w-1/3">URL</TableCell>
                            <TableCell>{formatSensitiveText(connection.url)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Username</TableCell>
                            <TableCell>{formatSensitiveText(connection.username)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Password</TableCell>
                            <TableCell>{formatSensitiveText(connection.password)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Added On</TableCell>
                            <TableCell>{new Date(connection.added).toLocaleDateString()}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Last Used</TableCell>
                            <TableCell>{new Date(connection.lastAccessed).toLocaleDateString()}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Channels</TableCell>
                            <TableCell>{connection.channels}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Total Watch Time</TableCell>
                            <TableCell>{formatWatchTime(connection.totalWatchTime)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 border rounded-md">
                <p className="text-muted-foreground">No connections found</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Watch History</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" /> Clear History
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Clear watch history?</DialogTitle>
                    <DialogDescription>
                      This will permanently delete all your watch history and statistics. This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end space-x-2">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={clearWatchData}>
                      Clear All Data
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {watchHistory.length > 0 ? (
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Watch Time</TableHead>
                          <TableHead>Last Watched</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {watchHistory.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                {item.type === "channel" && <Tv className="w-4 h-4" />}
                                {item.type === "movie" && <Film className="w-4 h-4" />}
                                {item.type === "episode" && <Tv className="w-4 h-4" />}
                                {item.name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="capitalize">{item.type}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                {formatWatchTime(item.watchTime)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(item.lastWatched).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center p-8 border rounded-md">
                <p className="text-muted-foreground">No watch history found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Connections;
