
import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Tv } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Movies = () => {
  const [isLoading] = useState(false);

  return (
    <Layout fullHeight className="py-6 md:py-8">
      <div className="flex flex-col h-full space-y-6">
        <header className="flex flex-col space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Movies</h1>
          <p className="text-muted-foreground">Browse and watch your movie collection</p>
        </header>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col space-y-2">
                <Skeleton className="h-[200px] w-full rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3 py-12">
            <Tv className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium">No Movies Found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Your movie collection will appear here after you load a playlist containing movies.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Movies;
