
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
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-3/4" />
      </div>
    );
  }

  if (!channel || !channel.epg_channel_id) {
    return (
      <div className="mt-1 py-2 text-sm text-white/70">
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4" />
          <p>No program information available for this channel.</p>
        </div>
      </div>
    );
  }

  if (!epgData || epgData.length === 0) {
    return (
      <div className="mt-1 py-2 text-sm text-white/70">
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

  // Calculate progress percentage for current program
  const calculateProgress = (start: Date, end: Date) => {
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.min(Math.max(Math.round((elapsed / total) * 100), 0), 100);
  };

  return (
    <div className="space-y-3 text-white">
      {currentProgram && (
        <div className="rounded-md bg-white/5 backdrop-blur-sm p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary/80" />
              <span className="text-xs font-medium">
                NOW: {formatTime(currentProgram.start)} - {formatTime(currentProgram.end)}
              </span>
            </div>
            <span className="text-xs text-white/60">
              {calculateDuration(currentProgram.start, currentProgram.end)} min
            </span>
          </div>
          <h3 className="font-medium mt-1">{currentProgram.title}</h3>
          {currentProgram.description && (
            <p className="text-sm text-white/70 mt-1 line-clamp-2">
              {currentProgram.description}
            </p>
          )}
          
          {/* Progress bar */}
          <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary/80"
              style={{ width: `${calculateProgress(currentProgram.start, currentProgram.end)}%` }}
            />
          </div>
          
          <div className="text-xs text-white/60 mt-1">
            {formatDate(currentProgram.start)}
          </div>
        </div>
      )}

      {nextPrograms.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white/70 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Up Next
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {nextPrograms.map((program, index) => (
              <div key={index} className="text-sm bg-white/5 backdrop-blur-sm rounded p-2">
                <div className="text-xs text-white/60 flex justify-between">
                  <span>{formatTime(program.start)}</span>
                  <span>{calculateDuration(program.start, program.end)} min</span>
                </div>
                <div className="font-medium mt-0.5">{program.title}</div>
                {program.description && (
                  <p className="text-xs text-white/70 line-clamp-1 mt-0.5">
                    {program.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EPGGuide;
