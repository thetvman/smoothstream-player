
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Loader } from "lucide-react";
import LoadingSpinner from "./common/LoadingSpinner";

interface EPGLoadingProgressProps {
  isLoading: boolean;
  progress: number;
  total: number;
  processed: number;
  message?: string;
}

const EPGLoadingProgress: React.FC<EPGLoadingProgressProps> = ({
  isLoading,
  progress,
  total,
  processed,
  message = "Loading EPG data..."
}) => {
  if (!isLoading) return null;

  const progressPercent = Math.min(100, Math.round(progress * 100));
  
  return (
    <div className="w-full p-4 bg-secondary/30 border border-border rounded-md animate-fade-in space-y-2">
      <div className="flex items-center gap-2">
        <LoadingSpinner size="sm" />
        <h4 className="font-medium">{message}</h4>
      </div>
      
      <Progress value={progressPercent} className="h-2" />
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Processed: {processed} channels</span>
        <span>{progressPercent}%</span>
        {total > 0 && <span>Total: {total} channels</span>}
      </div>
    </div>
  );
};

export default EPGLoadingProgress;
