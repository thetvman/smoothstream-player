
import React from "react";
import { Movie } from "@/lib/types";

interface MovieHeaderProps {
  media: Movie | null;
}

const MovieHeader: React.FC<MovieHeaderProps> = ({ media }) => {
  if (!media) return null;
  
  return (
    <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent player-controls">
      <h3 className="text-white font-medium truncate">{media.name}</h3>
    </div>
  );
};

export default MovieHeader;
