
import React from "react";

interface MovieErrorDisplayProps {
  error: string;
  onRetry: () => void;
  hasAlternativeFormat: boolean;
}

const MovieErrorDisplay: React.FC<MovieErrorDisplayProps> = ({
  error,
  onRetry,
  hasAlternativeFormat
}) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-6 text-center">
      <div className="text-red-500 mb-2 text-lg">⚠️ {error}</div>
      <button
        className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
        onClick={onRetry}
      >
        {hasAlternativeFormat ? "Try Alternative Format" : "Retry"}
      </button>
    </div>
  );
};

export default MovieErrorDisplay;
