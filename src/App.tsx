
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Lazy load page components with proper preloading hints
const Index = lazy(() => {
  // Add preloading hint for main page components
  const preloadPlaylistInput = import("./components/PlaylistInput");
  return import("./pages/Index");
});
const Player = lazy(() => import("./pages/Player"));
const Movies = lazy(() => import("./pages/Movies"));
const Series = lazy(() => import("./pages/Series"));
const MoviePlayer = lazy(() => import("./pages/MoviePlayer"));
const EpisodePlayer = lazy(() => import("./pages/EpisodePlayer"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
