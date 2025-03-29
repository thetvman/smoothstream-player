
import React from "react";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

interface LoadSeasonsButtonProps {
  onLoadSeasons: () => void;
}

const LoadSeasonsButton: React.FC<LoadSeasonsButtonProps> = ({ onLoadSeasons }) => {
  return (
    <div className="flex justify-center my-6">
      <Button 
        onClick={onLoadSeasons}
        className="bg-primary hover:bg-primary/90 text-white px-6 py-5 gap-2 rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-all duration-300"
      >
        <Info className="h-5 w-5" />
        Load Seasons & Episodes
      </Button>
    </div>
  );
};

export default LoadSeasonsButton;
