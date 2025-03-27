
import React, { memo } from "react";
import { Movie } from "@/lib/types";
import { useMoviePlayer } from "@/hooks/useMoviePlayer";
import MediaPlayer from "./player/MediaPlayer";
import MovieErrorDisplay from "./player/MovieErrorDisplay";
import MovieHeader from "./player/MovieHeader";

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
    <MediaPlayer
      videoRef={videoRef}
      containerRef={containerRef}
      playerState={playerState}
      error={error}
      headerComponent={<MovieHeader media={movie} />}
      errorComponent={
        <MovieErrorDisplay 
          error={error || ""}
          media={movie}
          onRetry={handleRetry}
        />
      }
      onPlayPause={handlePlayPause}
      onMute={handleMute}
      onVolumeChange={handleVolumeChange}
      onSeek={handleSeek}
      onFullscreen={handleFullscreen}
    />
  );
};

export default memo(MoviePlayer);
