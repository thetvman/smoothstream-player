
import React from "react";
import { Channel } from "@/lib/types";
import { Clock, Calendar, Tv, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EPGProgram } from "@/lib/epg";
import { Badge } from "@/components/ui/badge";

interface EPGGuideProps {
  channel: Channel | null;
  epgData: EPGProgram[] | null;
  isLoading: boolean;
}

const EPGGuide: React.FC<EPGGuideProps> = ({ channel, epgData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="mt-4 space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-16 w-3/4" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="mt-4 py-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4" />
          <p>Select a channel to view program information.</p>
        </div>
      </div>
    );
  }

  if (!channel.epg_channel_id) {
    return (
      <div className="mt-4 py-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4" />
          <p>No program information available for this channel.</p>
        </div>
      </div>
    );
  }

  if (!epgData || epgData.length === 0) {
    return (
      <div className="mt-4 py-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <p>Loading program information for {channel.name}...</p>
          <p className="text-xs ml-2">EPG ID: {channel.epg_channel_id}</p>
        </div>
      </div>
    );
  }

  // Find current program (the one that's currently airing)
  const now = new Date();
  const currentProgram = epgData.find(
    program => program.start <= now && program.end >= now
  );

  const nextPrograms = epgData
    .filter(program => program.start > now)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 8); // Show more upcoming programs (increased from 5 to 8)

  // Format time function
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date function
  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Calculate program duration in minutes
  const calculateDuration = (start: Date, end: Date) => {
    const durationMs = end.getTime() - start.getTime();
    return Math.round(durationMs / 60000); // Convert to minutes
  };

  return (
    <div className="mt-4 space-y-8">
      {currentProgram && (
        <div className="rounded-md bg-secondary/40 p-5 shadow-inner">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 py-1 px-3">
              <Clock className="w-4 h-4 mr-1" />
              NOW PLAYING
            </Badge>
            <span className="text-sm font-medium text-muted-foreground">
              {formatTime(currentProgram.start)} - {formatTime(currentProgram.end)}
            </span>
            <span className="text-xs bg-background/30 px-2 py-0.5 rounded-full">
              {calculateDuration(currentProgram.start, currentProgram.end)} min
            </span>
          </div>
          <h3 className="text-xl font-bold mt-2">{currentProgram.title}</h3>
          {currentProgram.description && (
            <div className="mt-3 bg-black/20 p-3 rounded-md border border-gray-800">
              <p className="text-sm text-muted-foreground">
                {currentProgram.description}
              </p>
            </div>
          )}
          <div className="flex items-center mt-3 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3 mr-1" />
            {formatDate(currentProgram.start)}
          </div>
        </div>
      )}

      {nextPrograms.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-base font-medium text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Upcoming Programs
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {nextPrograms.map((program, index) => (
              <div 
                key={index} 
                className={`text-sm border-l-2 ${index === 0 ? 'border-primary' : 'border-primary/30'} pl-4 py-2 hover:bg-secondary/10 rounded-r-md transition-colors`}
              >
                <div className="flex justify-between items-center">
                  <div className="font-medium text-base">{program.title}</div>
                  <div className="text-xs bg-background/30 px-2 py-0.5 rounded-full">
                    {calculateDuration(program.start, program.end)} min
                  </div>
                </div>
                <div className="text-sm text-muted-foreground flex items-center mt-1">
                  <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                  {formatTime(program.start)} - {formatTime(program.end)}
                </div>
                {program.description && (
                  <div className="mt-2 group relative">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer hover:text-primary">
                      <Info className="w-3 h-3" />
                      <span>Show description</span>
                    </div>
                    <div className="hidden group-hover:block absolute z-20 top-0 left-full ml-2 w-64 p-3 bg-popover border border-border rounded-md shadow-md">
                      <p className="text-xs">{program.description}</p>
                    </div>
                  </div>
                )}
                <div className="text-xs text-muted-foreground/70 mt-1 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(program.start)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EPGGuide;
