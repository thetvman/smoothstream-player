
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PlayerNavigationProps {
  isVisible: boolean;
  onPrevious: () => void;
  onNext: () => void;
  showInfo: boolean;
}

const PlayerNavigation: React.FC<PlayerNavigationProps> = ({
  isVisible,
  onPrevious,
  onNext,
  showInfo
}) => {
  // Only show navigation when it's visible AND the info panel is not showing
  const shouldShow = isVisible && !showInfo;
  
  return (
    <div 
      className={`absolute left-0 top-1/2 right-0 -translate-y-1/2 flex justify-between px-4 z-30 transition-opacity duration-300 ${shouldShow ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <Button
        variant="ghost"
        size="icon"
        className="bg-black/50 hover:bg-black/70 text-white rounded-full h-12 w-12"
        onClick={onPrevious}
        aria-label="Previous channel"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="bg-black/50 hover:bg-black/70 text-white rounded-full h-12 w-12"
        onClick={onNext}
        aria-label="Next channel"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  );
};

export default PlayerNavigation;
