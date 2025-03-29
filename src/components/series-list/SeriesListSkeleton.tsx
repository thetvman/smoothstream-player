
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface SeriesListSkeletonProps {
  count?: number;
}

const SeriesListSkeleton: React.FC<SeriesListSkeletonProps> = ({ count = 10 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex space-x-3 items-center p-2">
          <Skeleton className="h-12 w-20 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SeriesListSkeleton;
