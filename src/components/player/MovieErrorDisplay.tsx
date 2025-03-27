
import React from "react";
import { Movie } from "@/lib/types";

interface MovieErrorDisplayProps {
  error: string;
  media: Movie | null;
  onRetry: () => void;
}

const MovieErrorDisplay: React.FC<MovieErrorDisplayProps> = ({ 
  error, 
  media, 
  onRetry 
}) => {
  if (!error) return null;
  
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-6 text-center">
      <div className="text-red-500 mb-2 text-lg">⚠️ {error}</div>
      {media && (
        <button
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
          onClick={onRetry}
        >
          Try Alternative Format
        </button>
      )}
    </div>
  );
};

export default MovieErrorDisplay;
