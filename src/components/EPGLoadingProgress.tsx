
import React from "react";
import { Progress } from "@/components/ui/progress";
import LoadingSpinner from "./common/LoadingSpinner";

interface EPGLoadingProgressProps {
  isLoading: boolean;
  progress: number;
  total: number;
  processed: number;
  message?: string;
  cachedCount?: number;
}

const EPGLoadingProgress: React.FC<EPGLoadingProgressProps> = ({
  isLoading,
  progress,
  total,
  processed,
  message = "Loading EPG data...",
  cachedCount = 0
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
      
      {cachedCount > 0 && (
        <div className="text-xs text-emerald-500 dark:text-emerald-400">
          {cachedCount} channels loaded from cache
        </div>
      )}
    </div>
  );
};

export default EPGLoadingProgress;
