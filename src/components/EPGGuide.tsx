
import React from "react";
import { Channel } from "@/lib/types";
import { Clock, Calendar, Tv, Info } from "lucide-react";
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
      <div className="space-y-3 mt-2">
        <Skeleton className="h-6 w-1/3 rounded-lg bg-white/10" />
        <Skeleton className="h-20 w-full rounded-lg bg-white/10" />
        <Skeleton className="h-16 w-3/4 rounded-lg bg-white/10" />
      </div>
    );
  }

  if (!channel || !channel.epg_channel_id) {
    return (
      <div className="mt-1 py-2 text-sm text-white/80 animate-fade-in">
        <div className="flex items-center gap-2 backdrop-blur-md bg-white/5 rounded-xl p-4 border border-white/10">
          <Tv className="w-5 h-5 text-primary/90" />
          <p>No program information available for this channel.</p>
        </div>
      </div>
    );
  }

  if (!epgData || epgData.length === 0) {
    return (
      <div className="mt-1 py-2 text-sm text-white/80 animate-fade-in">
        <div className="flex items-center gap-2 backdrop-blur-md bg-white/5 rounded-xl p-4 border border-white/10">
          <Calendar className="w-5 h-5 text-primary/90" />
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
    <div className="space-y-4 text-white animate-fade-in">
      {currentProgram && (
        <div className="backdrop-blur-xl bg-white/10 rounded-xl overflow-hidden border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
          <div className="p-4 relative">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="bg-primary/20 p-2 rounded-full">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-white/90">
                  NOW: {formatTime(currentProgram.start)} - {formatTime(currentProgram.end)}
                </span>
              </div>
              <span className="text-xs py-1 px-2 rounded-full bg-white/20 text-white/90 backdrop-blur-md">
                {calculateDuration(currentProgram.start, currentProgram.end)} min
              </span>
            </div>
            <h3 className="font-semibold text-lg text-white">{currentProgram.title}</h3>
            {currentProgram.description && (
              <p className="text-sm text-white/80 mt-2 line-clamp-2">
                {currentProgram.description}
              </p>
            )}
            
            {/* Progress bar with glassmorphic style */}
            <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full"
                style={{ width: `${calculateProgress(currentProgram.start, currentProgram.end)}%` }}
              />
            </div>
            
            <div className="text-xs text-white/60 mt-2 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(currentProgram.start)}
            </div>
          </div>
        </div>
      )}

      {nextPrograms.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white/90 flex items-center gap-1.5 pl-1">
            <Calendar className="w-4 h-4 text-primary/90" />
            Up Next
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {nextPrograms.map((program, index) => (
              <div 
                key={index} 
                className="backdrop-blur-md bg-white/5 rounded-xl p-3 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:shadow-lg"
              >
                <div className="text-xs flex justify-between mb-1.5">
                  <span className="bg-white/10 rounded-full px-2 py-0.5">{formatTime(program.start)}</span>
                  <span className="text-white/70">{calculateDuration(program.start, program.end)} min</span>
                </div>
                <div className="font-medium text-white/90">{program.title}</div>
                {program.description && (
                  <p className="text-xs text-white/70 line-clamp-1 mt-1.5">
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
