
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30000,
      retry: 1,
    },
  },
});

// Lazy load page components
const Index = lazy(() => import("./pages/Index"));
const Player = lazy(() => import("./pages/Player"));
const Movies = lazy(() => import("./pages/Movies"));
const Series = lazy(() => import("./pages/Series"));
const MoviePlayer = lazy(() => import("./pages/MoviePlayer"));
const EpisodePlayer = lazy(() => import("./pages/EpisodePlayer"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Toaster />
        <Sonner position="top-right" closeButton />
        <BrowserRouter>
          <Suspense fallback={
            <div className="h-screen w-full flex items-center justify-center">
              <LoadingSpinner size="lg" />
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
