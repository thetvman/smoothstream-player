
import React from "react";
import { Channel } from "@/lib/types";
import { Clock, Calendar, Tv } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface EPGProgram {
  title: string;
  description?: string;
  start: Date;
  end: Date;
  channelId: string;
}

interface EPGGuideProps {
  channel: Channel | null;
  epgData: EPGProgram[] | null;
  isLoading: boolean;
}

const EPGGuide: React.FC<EPGGuideProps> = ({ channel, epgData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="mt-2 space-y-2">
        <Skeleton className="h-5 w-1/3 bg-[hsl(0,73%,25%)]" />
        <Skeleton className="h-16 w-full bg-[hsl(0,73%,25%)]" />
        <Skeleton className="h-12 w-3/4 bg-[hsl(0,73%,25%)]" />
      </div>
    );
  }

  if (!channel || !channel.epg_channel_id) {
    return (
      <div className="mt-2 py-2 text-sm text-[hsl(0,30%,85%)]">
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4" />
          <p>No program information available for this channel.</p>
        </div>
      </div>
    );
  }

  if (!epgData || epgData.length === 0) {
    return (
      <div className="mt-2 py-2 text-sm text-[hsl(0,30%,85%)]">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <p>No current program information available.</p>
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
    .slice(0, 3); // Show the next 3 upcoming programs

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
    <div className="mt-2 space-y-3">
      {currentProgram && (
        <div className="rounded-md bg-[hsl(0,73%,25%)] p-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-white" />
            <span className="text-xs font-medium">
              NOW: {formatTime(currentProgram.start)} - {formatTime(currentProgram.end)}
              <span className="ml-2 text-[hsl(0,30%,85%)]">
                ({calculateDuration(currentProgram.start, currentProgram.end)} min)
              </span>
            </span>
          </div>
          <h3 className="font-medium mt-1">{currentProgram.title}</h3>
          {currentProgram.description && (
            <p className="text-sm text-[hsl(0,30%,85%)] mt-1 line-clamp-2">
              {currentProgram.description}
            </p>
          )}
          <div className="text-xs text-[hsl(0,30%,85%)] mt-1">
            {formatDate(currentProgram.start)}
          </div>
        </div>
      )}

      {nextPrograms.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-[hsl(0,30%,85%)] flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Up Next
          </h4>
          {nextPrograms.map((program, index) => (
            <div key={index} className="text-sm border-l-2 border-[hsl(0,83%,40%)] pl-2">
              <div className="text-xs text-[hsl(0,30%,85%)] flex justify-between">
                <span>{formatTime(program.start)} - {formatTime(program.end)}</span>
                <span className="text-xs text-[hsl(0,30%,85%)]">
                  {calculateDuration(program.start, program.end)} min
                </span>
              </div>
              <div className="font-medium">{program.title}</div>
              {program.description && (
                <p className="text-xs text-[hsl(0,30%,85%)] line-clamp-1">
                  {program.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EPGGuide;
