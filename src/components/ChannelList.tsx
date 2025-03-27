
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Playlist, Channel, PaginatedChannels } from '@/lib/types';
import { Search, Trash2 } from 'lucide-react';
import FavoriteButton from './FavoriteButton';
import { cn } from '@/lib/utils';

interface ChannelListProps {
  playlist: Playlist | null;
  paginatedChannels: PaginatedChannels | null;
  selectedChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
  isLoading?: boolean;
}

const ChannelList: React.FC<ChannelListProps> = ({
  playlist,
  paginatedChannels,
  selectedChannel,
  onSelectChannel,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  if (!playlist) {
    return (
      <Card className="h-full flex-1 overflow-hidden flex flex-col">
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="text-center py-8 flex-1 flex flex-col items-center justify-center gap-2">
            <p className="text-lg font-medium">No Playlist Loaded</p>
            <p className="text-sm text-muted-foreground">
              Load a playlist to view channels
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (isLoading || !paginatedChannels) {
    return (
      <Card className="h-full flex-1 overflow-hidden flex flex-col">
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="text-center py-8 animate-pulse">
            <p className="text-muted-foreground">Loading channels...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const filteredChannels = searchTerm
    ? paginatedChannels.channels.filter((channel) =>
        channel.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : paginatedChannels.channels;
  
  const clearPlaylist = () => {
    if (window.confirm("Are you sure you want to clear the playlist?")) {
      localStorage.removeItem("iptv-playlist");
      localStorage.removeItem("iptv-last-channel");
      window.location.reload();
    }
  };
  
  return (
    <Card className="h-full flex-1 overflow-hidden flex flex-col">
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search channels..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={clearPlaylist}
            title="Clear playlist"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-1 overflow-y-auto flex-1">
          {filteredChannels.length > 0 ? (
            filteredChannels.map((channel) => (
              <div
                key={channel.id}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors",
                  selectedChannel?.id === channel.id
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                )}
                onClick={() => onSelectChannel(channel)}
              >
                <div className="w-10 h-10 overflow-hidden bg-muted rounded-md flex-shrink-0">
                  {channel.logo ? (
                    <img
                      src={channel.logo}
                      alt={channel.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      No Logo
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{channel.name}</p>
                  {channel.group_title && (
                    <p className="text-xs text-muted-foreground truncate">
                      {channel.group_title}
                    </p>
                  )}
                </div>
                
                <div className="flex-shrink-0">
                  <FavoriteButton channel={channel} size="sm" iconOnly />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No channels found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChannelList;
