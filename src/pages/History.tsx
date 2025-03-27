import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Trash2, Clock, Tv, Film } from "lucide-react";
import { useProfile } from "@/context/ProfileContext";
import { RecentItem } from "@/lib/types";
import { optimizeImageUrl } from "@/lib/utils";

const History = () => {
  const navigate = useNavigate();
  const { profile, isLoading, clearHistory } = useProfile();
  
  const navigateToContent = (item: RecentItem) => {
    switch (item.type) {
      case 'channel':
        navigate(`/player/${item.id}`);
        break;
      case 'movie':
        navigate(`/movie/${item.id}`);
        break;
      case 'episode':
        // Assuming episode ID format: seriesId_seasonNo_episodeNo
        const [seriesId, , episodeId] = item.id.split('_');
        navigate(`/series/${seriesId}/episode/${episodeId}`);
        break;
    }
  };
  
  if (isLoading || !profile) {
    return (
      <Layout fullHeight className="py-6 md:py-8">
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-center">
            <p className="text-muted-foreground">Loading history...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  const { recentlyWatched } = profile.preferences;
  
  return (
    <Layout fullHeight className="py-6 md:py-8">
      <div className="flex flex-col space-y-6 max-w-4xl mx-auto">
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/profile")}
              className="h-8 w-8 mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Watch History</h1>
              <p className="text-muted-foreground">Your recently watched content</p>
            </div>
          </div>
          
          {recentlyWatched.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearHistory}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear History
            </Button>
          )}
        </header>
        
        {recentlyWatched.length > 0 ? (
          <div className="space-y-4">
            {recentlyWatched.map((item, index) => (
              <div key={`${item.type}-${item.id}`}>
                <Card 
                  className="overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => navigateToContent(item)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 relative flex-shrink-0 rounded overflow-hidden bg-muted">
                        {item.poster ? (
                          <img
                            src={optimizeImageUrl(item.poster)}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full">
                            {item.type === 'channel' && <Tv className="h-8 w-8 text-muted-foreground" />}
                            {item.type === 'movie' && <Film className="h-8 w-8 text-muted-foreground" />}
                            {item.type === 'episode' && <Tv className="h-8 w-8 text-muted-foreground" />}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">{item.title}</h3>
                          <span className="text-xs text-muted-foreground flex items-center ml-2 whitespace-nowrap">
                            <Clock className="inline h-3 w-3 mr-1" />
                            {formatWatchedTime(item.lastWatched)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {getItemDescription(item)}
                        </p>
                        
                        {item.progress !== undefined && (
                          <div className="w-full h-1 bg-muted mt-2 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {index < recentlyWatched.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No watch history</h3>
            <p className="text-muted-foreground mt-1">
              Content you watch will appear here
            </p>
            <Button className="mt-4" onClick={() => navigate("/")}>
              Start Watching
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

// Helper function to format the watched time
const formatWatchedTime = (dateStr: Date | string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  // Less than a minute
  if (diffMs < 60000) {
    return 'Just now';
  }
  
  // Less than an hour
  if (diffMs < 3600000) {
    const minutes = Math.floor(diffMs / 60000);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // Less than a day
  if (diffMs < 86400000) {
    const hours = Math.floor(diffMs / 3600000);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Less than a week
  if (diffMs < 604800000) {
    const days = Math.floor(diffMs / 86400000);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  
  // Otherwise show the date
  return date.toLocaleDateString();
};

// Helper function to get a description for the item
const getItemDescription = (item: RecentItem) => {
  switch (item.type) {
    case 'channel':
      return 'Live Channel';
    case 'movie':
      return 'Movie';
    case 'episode':
      // Extract series and episode info from ID if available
      const parts = item.id.split('_');
      if (parts.length === 3) {
        return `Season ${parts[1]}, Episode ${parts[2]}`;
      }
      return 'TV Episode';
    default:
      return '';
  }
};

export default History;
