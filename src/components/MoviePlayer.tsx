
import React, { memo } from "react";
import { Movie } from "@/lib/types";
import { useMoviePlayer } from "@/hooks/useMoviePlayer";
import MovieStreamPlayer from "./player/MovieStreamPlayer";
import MovieErrorDisplay from "./player/MovieErrorDisplay";

interface MoviePlayerProps {
  movie: Movie | null;
  autoPlay?: boolean;
}

const MoviePlayer: React.FC<MoviePlayerProps> = ({ movie, autoPlay = true }) => {
  const {
    videoRef,
    containerRef,
    playerState,
    error,
    streamUrl,
    handlePlayPause,
    handleMute,
    handleVolumeChange,
    handleSeek,
    handleSeekStart,
    handleFullscreen,
    handleRetry,
    hasAlternativeFormat
  } = useMoviePlayer({ movie, autoPlay });
  
  if (!movie) {
    return <div className="text-red-500">No movie selected.</div>;
  }
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video bg-player overflow-hidden rounded-lg group"
    >
      {streamUrl && (
        <MovieStreamPlayer 
          movie={movie}
          streamUrl={streamUrl}
          playerState={playerState}
          videoRef={videoRef}
          containerRef={containerRef}
          onPlayPause={handlePlayPause}
          onMute={handleMute}
          onVolumeChange={handleVolumeChange}
          onSeek={handleSeek}
          onSeekStart={handleSeekStart}
          onFullscreen={handleFullscreen}
          autoPlay={autoPlay}
          error={error}
        />
      )}
      
      {error && (
        <MovieErrorDisplay 
          error={error} 
          onRetry={handleRetry} 
          hasAlternativeFormat={hasAlternativeFormat}
        />
      )}
    </div>
  );
};

export default memo(MoviePlayer);
