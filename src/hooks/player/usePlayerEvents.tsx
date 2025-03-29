
import { useCallback } from "react";
import { Channel } from "@/lib/types";
import { useWatchTime } from "@/hooks/use-watch-time";

interface UsePlayerEventsProps {
  channel: Channel | null;
  isPlaying: boolean;
  onEnded?: () => void;
}

export function usePlayerEvents({
  channel,
  isPlaying,
  onEnded
}: UsePlayerEventsProps) {
  // Initialize watch time tracking
  const { handlePlaybackEnd } = useWatchTime({
    id: channel?.id || '',
    name: channel?.name || '',
    type: "channel",
    isPlaying,
    thumbnailUrl: channel?.logo
  });

  const handleReady = useCallback(() => {
    // This function is called when the player is ready
  }, []);

  const handleEnded = useCallback(() => {
    if (channel) {
      handlePlaybackEnd();
    }
    
    if (onEnded) {
      onEnded();
    }
  }, [onEnded, handlePlaybackEnd, channel]);

  const handleError = useCallback(() => {
    if (channel) {
      console.error("Error loading stream for channel:", channel.name);
    }
  }, [channel]);

  const handleStatsUpdate = useCallback((stats: {
    resolution?: string;
    frameRate?: number;
    audioBitrate?: string;
    audioChannels?: string;
  }) => {
    return stats;
  }, []);

  return {
    handleReady,
    handleEnded,
    handleError,
    handleStatsUpdate
  };
}
