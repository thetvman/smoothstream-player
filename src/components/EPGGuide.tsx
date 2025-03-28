
import React from "react";
import { Channel } from "@/lib/types";
import { Clock, Calendar, Tv } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EPGProgram } from "@/lib/epg";

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
    .slice(0, 5); // Show more upcoming programs (increased from 3 to 5)

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
    <div className="mt-4 space-y-6">
      {currentProgram && (
        <div className="rounded-md bg-secondary/40 p-4 shadow-inner">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">
              NOW PLAYING: {formatTime(currentProgram.start)} - {formatTime(currentProgram.end)}
              <span className="ml-2 text-muted-foreground">
                ({calculateDuration(currentProgram.start, currentProgram.end)} min)
              </span>
            </span>
          </div>
          <h3 className="text-lg font-medium mt-2">{currentProgram.title}</h3>
          {currentProgram.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
              {currentProgram.description}
            </p>
          )}
          <div className="text-xs text-muted-foreground mt-2">
            {formatDate(currentProgram.start)}
          </div>
        </div>
      )}

      {nextPrograms.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-base font-medium text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Up Next
          </h4>
          <div className="space-y-4">
            {nextPrograms.map((program, index) => (
              <div key={index} className="text-sm border-l-2 border-primary/30 pl-3 py-1">
                <div className="text-sm text-muted-foreground flex justify-between">
                  <span>{formatTime(program.start)} - {formatTime(program.end)}</span>
                  <span className="text-xs text-muted-foreground">
                    {calculateDuration(program.start, program.end)} min
                  </span>
                </div>
                <div className="font-medium text-base mt-1">{program.title}</div>
                {program.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {program.description}
                  </p>
                )}
                <div className="text-xs text-muted-foreground/70 mt-1">
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
