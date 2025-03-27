
import React, { useState, useEffect } from "react";
import { Channel, Playlist } from "@/lib/types";
import { fetchEPGData, EPGProgram } from "@/lib/epgService";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Info, 
  Play, 
  Tv 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChannelGuideProps {
  playlist: Playlist | null;
  selectedChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
  isLoading?: boolean;
  compactMode?: boolean;
}

const ChannelGuide: React.FC<ChannelGuideProps> = ({
  playlist,
  selectedChannel,
  onSelectChannel,
  isLoading = false,
  compactMode = false
}) => {
  const [timeSlots, setTimeSlots] = useState<Date[]>([]);
  const [channelEPGs, setChannelEPGs] = useState<Map<string, EPGProgram[]>>(new Map());
  const [loadingEPG, setLoadingEPG] = useState(false);
  const [timeRange, setTimeRange] = useState<{start: number, end: number}>({start: 0, end: 6});
  
  // Initialize time slots - default to current time and next hours
  useEffect(() => {
    const now = new Date();
    now.setMinutes(0, 0, 0); // Round to the current hour
    
    const slots: Date[] = [];
    for (let i = -1; i < 12; i++) {
      const slotTime = new Date(now);
      slotTime.setHours(now.getHours() + i);
      slots.push(slotTime);
    }
    
    setTimeSlots(slots);
  }, []);
  
  // Fetch EPG data for visible channels
  useEffect(() => {
    if (!playlist || !playlist.channels.length) return;
    
    const fetchChannelEPGs = async () => {
      setLoadingEPG(true);
      const epgMap = new Map<string, EPGProgram[]>();
      
      // Get EPG only for channels with epg_channel_id
      const channelsWithEPG = playlist.channels
        .filter(channel => channel.epg_channel_id)
        .slice(0, 10); // Limit to 10 channels at a time for performance
      
      for (const channel of channelsWithEPG) {
        try {
          if (channel.epg_channel_id) {
            const epgData = await fetchEPGData(channel);
            if (epgData) {
              epgMap.set(channel.id, epgData);
            }
          }
        } catch (error) {
          console.error(`Error fetching EPG for ${channel.name}:`, error);
        }
      }
      
      setChannelEPGs(epgMap);
      setLoadingEPG(false);
    };
    
    fetchChannelEPGs();
  }, [playlist]);
  
  // Format time for header
  const formatTimeHeader = (date: Date) => {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  // Format date (for day display)
  const formatDate = (date: Date | undefined) => {
    // Add a safety check to handle undefined date
    if (!date) return "Loading...";
    return date.toLocaleDateString([], { weekday: 'short', day: 'numeric' });
  };
  
  // Find EPG program at a specific time slot
  const findProgramAtTimeSlot = (
    channelId: string, 
    timeSlot: Date
  ): EPGProgram | null => {
    const programs = channelEPGs.get(channelId);
    if (!programs) return null;
    
    return programs.find(program => 
      program.start <= timeSlot && program.end > timeSlot
    ) || null;
  };
  
  // Navigate time slots
  const navigateTimeSlots = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && timeRange.start > 0) {
      setTimeRange({
        start: timeRange.start - 1,
        end: timeRange.end - 1
      });
    } else if (direction === 'next' && timeRange.end < timeSlots.length - 1) {
      setTimeRange({
        start: timeRange.start + 1,
        end: timeRange.end + 1
      });
    }
  };

  // Get visible time slots based on current range
  const visibleTimeSlots = timeSlots.slice(
    timeRange.start, 
    compactMode ? timeRange.start + 2 : timeRange.end + 1
  );

  if (isLoading) {
    return (
      <div className="w-full space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!playlist || !playlist.channels.length) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
        <Tv className="w-10 h-10 mb-2 opacity-50" />
        <p>No channels available</p>
      </div>
    );
  }

  // Make sure we have time slots before rendering the guide
  if (timeSlots.length === 0) {
    return (
      <div className="w-full flex justify-center py-8">
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  // Render compact view when in compact mode
  if (compactMode) {
    return (
      <div className="channel-guide w-full border border-border rounded-md overflow-hidden bg-card">
        <ScrollArea className="max-h-[calc(100vh-14rem)]">
          {playlist.channels.slice(0, 15).map((channel) => (
            <div 
              key={channel.id} 
              className={`flex items-center p-2 hover:bg-secondary/30 cursor-pointer ${
                selectedChannel?.id === channel.id ? 'bg-secondary/40' : ''
              }`}
              onClick={() => onSelectChannel(channel)}
            >
              <div className="channel-logo w-8 h-8 rounded-md overflow-hidden flex items-center justify-center bg-black/20 mr-2">
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
                  <Tv className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              
              {/* Live indicator */}
              {selectedChannel?.id === channel.id && (
                <div className="w-2 h-2 rounded-full bg-green-500 absolute left-1"></div>
              )}
            </div>
          ))}
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="channel-guide w-full border border-border rounded-md overflow-hidden bg-card">
      {/* Time navigation */}
      <div className="flex items-center justify-between bg-secondary/50 p-2 border-b border-border">
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
          <span className="text-sm font-medium">
            {formatDate(timeSlots[timeRange.start])}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-7 w-7"
            onClick={() => navigateTimeSlots('prev')}
            disabled={timeRange.start === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-7 w-7"
            onClick={() => navigateTimeSlots('next')}
            disabled={timeRange.end >= timeSlots.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Time slots header */}
      <div className="grid grid-cols-[200px_1fr] border-b border-border">
        <div className="p-2 bg-secondary/30 flex items-center justify-center">
          <span className="text-xs font-medium text-muted-foreground">ON NOW</span>
        </div>
        <div className="flex">
          {visibleTimeSlots.map((slot, index) => (
            <div 
              key={slot.getTime()} 
              className={`p-2 text-center flex-1 text-xs border-l border-border ${
                new Date().getHours() === slot.getHours() ? 'bg-primary/10' : 'bg-secondary/30'
              }`}
            >
              {formatTimeHeader(slot)}
            </div>
          ))}
        </div>
      </div>

      {/* Channel rows */}
      <ScrollArea className="max-h-[500px]">
        {playlist.channels.slice(0, 15).map((channel) => (
          <div 
            key={channel.id} 
            className={`grid grid-cols-[200px_1fr] border-b border-border hover:bg-secondary/30 cursor-pointer ${
              selectedChannel?.id === channel.id ? 'bg-secondary/40' : ''
            }`}
            onClick={() => onSelectChannel(channel)}
          >
            {/* Channel info */}
            <div className="p-2 flex items-center space-x-2 border-r border-border">
              <div className="channel-logo w-10 h-10 rounded-md overflow-hidden flex items-center justify-center bg-black/20">
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
                  <Tv className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-sm truncate">{channel.name}</span>
                {channel.group && (
                  <span className="text-xs text-muted-foreground truncate">{channel.group}</span>
                )}
              </div>
            </div>

            {/* Program slots */}
            <div className="flex">
              {visibleTimeSlots.map((slot) => {
                const program = findProgramAtTimeSlot(channel.id, slot);
                const isCurrentTimeSlot = new Date().getHours() === slot.getHours();
                
                return (
                  <div 
                    key={`${channel.id}-${slot.getTime()}`} 
                    className={`p-2 flex-1 border-l border-border text-xs ${
                      isCurrentTimeSlot ? 'bg-primary/5' : ''
                    }`}
                  >
                    {loadingEPG ? (
                      <Skeleton className="h-4 w-full" />
                    ) : program ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="font-medium truncate">
                              {program.title}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[240px]">
                            <div className="space-y-1">
                              <p className="font-bold">{program.title}</p>
                              <p className="text-xs">
                                {program.start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - 
                                {program.end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                              </p>
                              {program.description && (
                                <p className="text-xs text-muted-foreground">{program.description}</p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : channel.epg_channel_id ? (
                      <span className="text-muted-foreground">No data</span>
                    ) : (
                      <span className="text-muted-foreground">No EPG</span>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Live indicator */}
            {selectedChannel?.id === channel.id && (
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
                <div className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-r-sm font-medium flex items-center">
                  <Play className="w-3 h-3 mr-0.5 fill-current" />
                  LIVE
                </div>
              </div>
            )}
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default ChannelGuide;
