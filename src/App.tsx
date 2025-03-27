
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoadingSpinner from "./components/common/LoadingSpinner";
import NavBar from "./components/NavBar";

// Lazy load page components with proper preloading hints
const Index = lazy(() => {
  // Add preloading hint for main page components
  const preloadPlaylistInput = import("./components/PlaylistInput");
  return import("./pages/Index");
});
const Player = lazy(() => import("./pages/Player"));
const Movies = lazy(() => import("./pages/Movies"));
const TvSeries = lazy(() => import("./pages/TvSeries"));
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
      <Toaster />
      <Sonner position="top-right" closeButton />
      <BrowserRouter>
        <NavBar />
        <Suspense fallback={
          <div className="h-screen w-full flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        }>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/tv-series" element={<TvSeries />} />
            <Route path="/player/:channelId" element={<Player />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
