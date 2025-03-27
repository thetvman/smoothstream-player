
import React, { memo } from "react";
import { Movie } from "@/lib/types";
import { useMoviePlayer } from "@/hooks/useMoviePlayer";
import PlayerControls from "./PlayerControls";
import MovieErrorDisplay from "./player/MovieErrorDisplay";
import MovieHeader from "./player/MovieHeader";
import LoadingSpinner from "./common/LoadingSpinner";

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
    handlePlayPause,
    handleMute,
    handleVolumeChange,
    handleSeek,
    handleFullscreen,
    tryAlternativeFormat
  } = useMoviePlayer(movie, autoPlay);
  
  const handleRetry = () => {
    if (tryAlternativeFormat()) {
      // Alternative format will be tried
    } else {
      // Reload the current video
      const video = videoRef.current;
      if (video) {
        video.load();
      }
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video bg-player overflow-hidden rounded-lg group"
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        preload="metadata"
      />
      
      {playerState.loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <LoadingSpinner size="lg" />
        </div>
      )}
      
      <MovieErrorDisplay 
        error={error || ""}
        media={movie}
        onRetry={handleRetry}
      />
      
      <MovieHeader media={movie} />
      
      {movie && !error && (
        <PlayerControls
          videoRef={videoRef}
          playerState={playerState}
          onPlayPause={handlePlayPause}
          onMute={handleMute}
          onVolumeChange={handleVolumeChange}
          onSeek={handleSeek}
          onFullscreen={handleFullscreen}
        />
      )}
    </div>
  );
};

export default memo(MoviePlayer);
