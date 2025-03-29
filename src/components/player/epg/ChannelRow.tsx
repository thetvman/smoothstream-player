
import React, { useState, useEffect } from "react";
import { Channel } from "@/lib/types";
import { Clock } from "lucide-react";
import { fetchEPGData } from "@/lib/epg";

interface ChannelRowProps {
  channel: Channel;
  currentChannel: Channel | null;
  timeSlots: Date[];
  onSelectChannel: (channel: Channel) => void;
}

const ChannelRow: React.FC<ChannelRowProps> = ({ 
  channel, 
  currentChannel, 
  timeSlots, 
  onSelectChannel 
}) => {
  const [epgData, setEpgData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Format time for display
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Load EPG data when component mounts
  useEffect(() => {
    const loadEpgData = async () => {
      if (!channel.epg_channel_id) return;
      
      setIsLoading(true);
      try {
        const data = await fetchEPGData(channel);
        setEpgData(data || []);
      } catch (error) {
        console.error(`Error loading EPG data for ${channel.name}:`, error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEpgData();
  }, [channel]);

  // Find program for a specific time slot
  const findProgramForTimeSlot = (slot: Date) => {
    if (!epgData || epgData.length === 0) return null;
    
    return epgData.find(program => {
      const start = new Date(program.start);
      const end = new Date(program.end);
      return start <= slot && end > slot;
    });
  };

  return (
    <div 
      className={`grid grid-cols-[180px_1fr] border-b hover:bg-accent/20 transition-colors ${
        currentChannel?.id === channel.id ? 'bg-primary/10' : ''
      }`}
      onClick={() => onSelectChannel(channel)}
    >
      <div className="p-3 border-r flex items-center gap-2 overflow-hidden">
        {channel.logo && (
          <img 
            src={channel.logo} 
            alt={channel.name} 
            className="h-6 w-6 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <div className="truncate font-medium">
          {channel.name}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="grid grid-cols-6 min-w-[600px] h-full">
          {timeSlots.map((slot, i) => {
            const program = findProgramForTimeSlot(slot);
            return (
              <div 
                key={i} 
                className="p-2 border-r h-full flex flex-col justify-center"
              >
                {isLoading ? (
                  <div className="text-xs text-muted-foreground">Loading...</div>
                ) : program ? (
                  <>
                    <div className="font-medium truncate">
                      {program.title}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(new Date(program.start))} - {formatTime(new Date(program.end))}
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-muted-foreground">No program data</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChannelRow;
