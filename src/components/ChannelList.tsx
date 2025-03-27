
import React, { useState, useMemo } from "react";
import { Playlist, Channel } from "@/lib/types";
import { Search } from "lucide-react";

interface ChannelListProps {
  playlist: Playlist | null;
  selectedChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
}

const ChannelList: React.FC<ChannelListProps> = ({
  playlist,
  selectedChannel,
  onSelectChannel
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  
  // Extract unique groups from the playlist
  const groups = useMemo(() => {
    if (!playlist?.channels) return [];
    
    const uniqueGroups = [...new Set(playlist.channels
      .map(channel => channel.group)
      .filter(Boolean) as string[]
    )];
    
    return uniqueGroups.sort();
  }, [playlist]);
  
  // Filter channels based on search term and active group
  const filteredChannels = useMemo(() => {
    if (!playlist?.channels) return [];
    
    return playlist.channels.filter(channel => {
      const matchesSearch = !searchTerm || 
        channel.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGroup = !activeGroup || channel.group === activeGroup;
      
      return matchesSearch && matchesGroup;
    });
  }, [playlist, searchTerm, activeGroup]);
  
  if (!playlist) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">No playlist loaded</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full overflow-hidden bg-card rounded-lg border border-border">
      {/* Search header */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-input rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
      
      {/* Group filters */}
      {groups.length > 0 && (
        <div className="px-3 py-2 border-b border-border">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            <button
              className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                activeGroup === null 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
              onClick={() => setActiveGroup(null)}
            >
              All
            </button>
            
            {groups.map(group => (
              <button
                key={group}
                className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                  activeGroup === group 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
                onClick={() => setActiveGroup(group)}
              >
                {group}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Channel list */}
      <div className="flex-1 overflow-y-auto p-1">
        {filteredChannels.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-muted-foreground">No channels found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredChannels.map(channel => (
              <div
                key={channel.id}
                className={`channel-item ${selectedChannel?.id === channel.id ? "channel-item-active" : ""}`}
                onClick={() => onSelectChannel(channel)}
              >
                {channel.logo ? (
                  <img 
                    src={channel.logo} 
                    alt={channel.name} 
                    className="w-8 h-8 object-contain rounded bg-background p-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center text-xs font-medium">
                    {channel.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{channel.name}</div>
                  {channel.group && (
                    <div className="text-xs text-muted-foreground truncate">
                      {channel.group}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Playlist info footer */}
      <div className="p-3 border-t border-border bg-secondary/30">
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">{playlist.name}</span> • {playlist.channels.length} channels
        </div>
      </div>
    </div>
  );
};

export default ChannelList;
