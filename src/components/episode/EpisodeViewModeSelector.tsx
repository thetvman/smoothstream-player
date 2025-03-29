
import React from "react";
import { Button } from "@/components/ui/button";
import { Grid3x3, List } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface EpisodeViewModeSelectorProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

const EpisodeViewModeSelector: React.FC<EpisodeViewModeSelectorProps> = ({
  viewMode,
  onViewModeChange,
}) => {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={viewMode === "grid" ? "bg-primary/20 text-primary" : ""}
              onClick={() => onViewModeChange("grid")}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Grid View</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={viewMode === "list" ? "bg-primary/20 text-primary" : ""}
              onClick={() => onViewModeChange("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>List View</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default EpisodeViewModeSelector;
