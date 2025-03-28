
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Create a consistent import error handler for lazy-loaded components
const lazyLoad = (importFunc) => {
  return lazy(() => 
    importFunc().catch(error => {
      console.error("Error loading component:", error);
      return import("./pages/NotFound");
    })
  );
};

// Lazy load page components with proper error handling
const Index = lazyLoad(() => import("./pages/Index"));
const Player = lazyLoad(() => import("./pages/Player"));
const Movies = lazyLoad(() => import("./pages/Movies"));
const Series = lazyLoad(() => import("./pages/Series"));
const MoviePlayer = lazyLoad(() => import("./pages/MoviePlayer"));
const EpisodePlayer = lazyLoad(() => import("./pages/EpisodePlayer"));
const Connections = lazyLoad(() => import("./pages/Connections"));
const NotFound = lazyLoad(() => import("./pages/NotFound"));

// Configure query client with faster stale time for better responsiveness
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30000, // Reduced stale time for more responsive updates
      retry: 1, // Limit retries to avoid hanging on failures
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground antialiased">
        <Toaster />
        <Sonner position="top-right" closeButton />
        <BrowserRouter>
          <Suspense fallback={
            <div className="h-screen w-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <LoadingSpinner size="lg" />
                <p className="text-muted-foreground animate-pulse">Loading your entertainment...</p>
              </div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/player/:channelId" element={<Player />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/movie/:movieId" element={<MoviePlayer />} />
              <Route path="/series" element={<Series />} />
              <Route path="/series/:seriesId/episode/:episodeId" element={<EpisodePlayer />} />
              <Route path="/connections" element={<Connections />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
