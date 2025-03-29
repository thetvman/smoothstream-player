
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface SeriesListSkeletonProps {
  count?: number;
}

const SeriesListSkeleton: React.FC<SeriesListSkeletonProps> = ({ count = 10 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex flex-col">
          <Skeleton className="aspect-[2/3] w-full rounded-md bg-white/5" />
          <Skeleton className="h-4 w-3/4 mt-2 bg-white/5" />
          <Skeleton className="h-3 w-1/2 mt-1 bg-white/5" />
        </div>
      ))}
    </div>
  );
};

export default SeriesListSkeleton;
