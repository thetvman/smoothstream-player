
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const SeriesDetailsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-56 w-full rounded-xl bg-white/5" />
      <div className="flex items-center space-x-4 mb-6">
        <Skeleton className="h-6 w-24 bg-white/5 rounded-md" />
        <Skeleton className="h-6 w-24 bg-white/5 rounded-md" />
      </div>
      <Skeleton className="h-32 w-full bg-white/5 rounded-lg" />
      <div className="mt-4 space-y-3">
        <Skeleton className="h-10 w-full bg-white/5 rounded-lg" />
        <Skeleton className="h-10 w-full bg-white/5 rounded-lg" />
        <Skeleton className="h-10 w-full bg-white/5 rounded-lg" />
      </div>
    </div>
  );
};

export default SeriesDetailsSkeleton;
