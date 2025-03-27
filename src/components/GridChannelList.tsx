
import React, { useState, useMemo, useEffect } from "react";
import { Channel, ChannelListProps } from "@/lib/types";
import { Search, Tv, Grid, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface GridChannelListProps extends Omit<ChannelListProps, 'paginatedChannels'> {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
}

const GridChannelList: React.FC<GridChannelListProps> = ({
  playlist,
  channels,
  selectedChannel,
  onSelectChannel,
  isLoading = false
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>(channels);
  
  const groups = useMemo(() => {
    if (!playlist?.channels) return [];
    
    const uniqueGroups = [...new Set(playlist.channels
      .map(channel => channel.group)
      .filter(Boolean) as string[]
    )];
    
    return uniqueGroups.sort();
  }, [playlist]);
  
  useEffect(() => {
    if (!channels) {
      setFilteredChannels([]);
      return;
    }
    
    const filtered = channels.filter(channel => {
      const matchesSearch = !searchTerm || 
        channel.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGroup = !activeGroup || channel.group === activeGroup;
      
      return matchesSearch && matchesGroup;
    });
    
    setFilteredChannels(filtered);
  }, [channels, searchTerm, activeGroup]);
  
  const handleChannelClick = (channel: Channel) => {
    onSelectChannel(channel);
    navigate(`/player/${channel.id}`);
  };
  
  if (isLoading) {
    return (
      <div className="bg-black min-h-screen">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
          {Array.from({ length: 24 }).map((_, index) => (
            <Card key={index} className="aspect-video animate-pulse glossy-card">
              <CardContent className="p-0 h-full flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gray-700/60"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (!playlist) {
    return (
      <div className="p-4 text-center bg-black min-h-screen">
        <p className="text-gray-300">No playlist loaded</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full overflow-hidden bg-black">
      <div className="p-3 border-b border-gray-800 glossy-header sticky top-0 z-10 shadow-md">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full glossy-input pl-9 pr-3"
            />
          </div>
        </div>
        
        {groups.length > 0 && (
          <ScrollArea className="w-full whitespace-nowrap pb-1">
            <div className="flex items-center gap-1">
              <button
                className={`glossy-pill whitespace-nowrap ${
                  activeGroup === null 
                    ? "bg-gradient-to-r from-primary/80 to-primary/60 border-primary/40" 
                    : ""
                }`}
                onClick={() => setActiveGroup(null)}
              >
                All
              </button>
              
              {groups.map(group => (
                <button
                  key={group}
                  className={`glossy-pill whitespace-nowrap ${
                    activeGroup === group 
                      ? "bg-gradient-to-r from-primary/80 to-primary/60 border-primary/40" 
                      : ""
                  }`}
                  onClick={() => setActiveGroup(group)}
                >
                  {group}
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        {filteredChannels.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-gray-300">No channels found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
            {filteredChannels.map(channel => (
              <Card 
                key={channel.id} 
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:scale-105 overflow-hidden glossy-card", 
                  selectedChannel?.id === channel.id ? "ring-2 ring-primary/90" : ""
                )}
                onClick={() => handleChannelClick(channel)}
              >
                <CardContent className="p-0 h-full flex flex-col bg-gray-900/20 backdrop-blur-sm aspect-video">
                  <div className="flex-1 flex items-center justify-center p-3">
                    {channel.logo ? (
                      <img 
                        src={channel.logo} 
                        alt={channel.name} 
                        className="w-full h-full object-contain p-2 max-h-16"
                        onError={(e) => {
                          const imgElement = e.target as HTMLImageElement;
                          imgElement.style.display = 'none';
                          if (imgElement.nextElementSibling) {
                            (imgElement.nextElementSibling as HTMLElement).style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div className={cn(
                      "w-full h-full flex items-center justify-center text-lg font-bold bg-gradient-to-br from-gray-700 to-gray-800 text-gray-300",
                      channel.logo ? "hidden" : ""
                    )}>
                      {channel.name.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-md p-2 text-center text-xs font-medium text-gray-200 truncate border-t border-gray-700/40">
                    {channel.name}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
      
      <div className="p-3 border-t border-gray-800 glossy-header shadow-inner">
        <div className="text-xs text-gray-400">
          <span className="font-medium text-gray-300">{playlist.name}</span> • {playlist.channels.length} channels
          {activeGroup && 
            ` • ${filteredChannels.length} in "${activeGroup}"`}
        </div>
      </div>
    </div>
  );
};

export default GridChannelList;
