
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info } from "lucide-react";
import EPGSettings from "@/components/EPGSettings";

interface PlayerHeaderProps {
  isVisible: boolean;
  onInfoToggle: () => void;
  showInfo: boolean;
}

const PlayerHeader: React.FC<PlayerHeaderProps> = ({
  isVisible,
  onInfoToggle,
  showInfo
}) => {
  const navigate = useNavigate();
  
  // Only show the header when it's visible AND the info panel is not showing
  const shouldShow = isVisible && !showInfo;
  
  return (
    <>
      <div className={`absolute top-6 left-6 z-30 transition-opacity duration-300 ${shouldShow ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button 
          className="bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors text-white"
          onClick={() => navigate("/")}
          aria-label="Back to home"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
      
      <div className={`absolute top-6 right-6 z-30 flex gap-2 transition-opacity duration-300 ${shouldShow ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <EPGSettings />
        
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/50 hover:bg-black/70 text-white rounded-full"
          onClick={onInfoToggle}
          aria-label="Show info"
        >
          <Info className="h-5 w-5" />
        </Button>
      </div>
    </>
  );
};

export default PlayerHeader;
