
import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import PlayerSection from "@/components/PlayerSection";
import { usePlaylist } from "@/hooks/use-playlist";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Radio, Film, Tv, PlayCircle, Info, Clock, CalendarIcon, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import PlaylistInput from "@/components/PlaylistInput";

const Index = () => {
  const {
    playlist,
    selectedChannel,
    paginatedChannels,
    currentPage,
    isLoading,
    epgData,
    isEpgLoading,
    handlePlaylistLoaded,
    handleSelectChannel,
    handleClearPlaylist,
    handlePageChange
  } = usePlaylist();
  
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  
  return (
    <Layout fullHeight className="py-0 px-0 bg-gradient-to-b from-[#0a0a15] to-black overflow-hidden">
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="p-4 md:p-6 flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary" />
            <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              SmoothStream
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleDarkMode}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              className="transition-all hover:bg-white/10"
            >
              {isDarkMode ? <Clock className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {/* Hero Banner Section */}
        <div className="relative w-full h-[40vh] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center" />
          
          <div className="absolute inset-0 flex flex-col justify-center p-8 z-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-2xl"
            >
              <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/90">
                Welcome to SmoothStream
              </h1>
              
              <p className="text-white/80 mb-6 line-clamp-2">
                Access your favorite movies, series, and live TV all in one place.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button 
                  variant="default" 
                  className="bg-primary hover:bg-primary/90 text-white gap-2"
                  onClick={() => navigate('/movies')}
                >
                  <Film className="h-5 w-5" />
                  Movies
                </Button>
                
                <Button 
                  variant="default" 
                  className="bg-primary/80 hover:bg-primary/90 text-white gap-2"
                  onClick={() => navigate('/series')}
                >
                  <Tv className="h-5 w-5" />
                  Series
                </Button>
                
                <Button 
                  variant="outline" 
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 gap-2"
                >
                  <Info className="h-5 w-5" />
                  Learn More
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Content Section */}
        <ScrollArea className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Live TV Section */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                Live TV
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Live Player */}
              <div className="md:col-span-2">
                <Card className="overflow-hidden border-0 shadow-xl rounded-xl bg-black/40 backdrop-blur-sm">
                  <PlayerSection 
                    selectedChannel={selectedChannel} 
                    epgData={epgData} 
                    isEpgLoading={isEpgLoading} 
                  />
                </Card>
              </div>
              
              {/* Playlist Input or Channel Preview */}
              <div>
                <Card className="p-6 shadow-xl rounded-xl bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm border border-white/5 h-full">
                  {!playlist ? (
                    <PlaylistInput onPlaylistLoaded={handlePlaylistLoaded} />
                  ) : (
                    <div className="flex flex-col h-full">
                      <h3 className="text-lg font-medium mb-3">Current Program</h3>
                      <Separator className="mb-4" />
                      {selectedChannel ? (
                        <>
                          <div className="bg-black/30 p-3 rounded-lg">
                            <h4 className="font-medium text-primary">{selectedChannel.name}</h4>
                            
                            {epgData && epgData.length > 0 ? (
                              <div className="mt-2 space-y-2">
                                <div className="flex items-center gap-2 text-sm text-white/70">
                                  <CalendarIcon className="h-3.5 w-3.5" />
                                  <span>{new Date(epgData[0].start).toLocaleTimeString()} - {new Date(epgData[0].end).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-sm">{epgData[0].title}</p>
                              </div>
                            ) : (
                              <p className="text-sm text-white/50 mt-2">No program data available</p>
                            )}
                          </div>
                          <div className="mt-4">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/player/${selectedChannel.id}`)}
                              className="w-full justify-center border-primary/50 hover:bg-primary/20 text-primary flex gap-2"
                            >
                              <PlayCircle className="h-4 w-4" />
                              Watch Fullscreen
                            </Button>
                          </div>
                        </>
                      ) : (
                        <p className="text-white/50 text-sm">Select a channel to view details</p>
                      )}
                      <div className="mt-auto pt-4">
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={handleClearPlaylist}
                          className="w-full justify-center"
                        >
                          Clear Playlist
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </section>
          
          {/* Quick Access Section */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Quick Access
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {/* Movie Card */}
              <motion.div 
                className="cursor-pointer group relative"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/movies')}
              >
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-black/20 relative shadow-lg">
                  <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex items-center justify-center">
                    <Film className="h-8 w-8 text-white/30" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      whileHover={{ scale: 1.1 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="bg-primary rounded-full p-2 shadow-xl"
                    >
                      <PlayCircle className="h-6 w-6 text-white" />
                    </motion.div>
                  </div>
                </div>
                <div className="mt-1.5">
                  <h3 className="font-medium text-xs text-white/90 truncate group-hover:text-primary transition-colors duration-300">Movies</h3>
                  <div className="flex text-xs text-white/60 gap-2 mt-0.5">
                    <span className="flex items-center text-[10px]">Explore our collection</span>
                  </div>
                </div>
              </motion.div>
              
              {/* Series Card */}
              <motion.div 
                className="cursor-pointer group relative"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/series')}
              >
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-black/20 relative shadow-lg">
                  <div className="w-full h-full bg-gradient-to-br from-blue-900/50 to-indigo-900/50 flex items-center justify-center">
                    <Tv className="h-8 w-8 text-white/30" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      whileHover={{ scale: 1.1 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="bg-primary rounded-full p-2 shadow-xl"
                    >
                      <PlayCircle className="h-6 w-6 text-white" />
                    </motion.div>
                  </div>
                </div>
                <div className="mt-1.5">
                  <h3 className="font-medium text-xs text-white/90 truncate group-hover:text-primary transition-colors duration-300">Series</h3>
                  <div className="flex text-xs text-white/60 gap-2 mt-0.5">
                    <span className="flex items-center text-[10px]">Watch episodes</span>
                  </div>
                </div>
              </motion.div>
              
              {/* Live TV Card */}
              <motion.div 
                className="cursor-pointer group relative"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => selectedChannel && navigate(`/player/${selectedChannel.id}`)}
              >
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-black/20 relative shadow-lg">
                  <div className="w-full h-full bg-gradient-to-br from-red-900/50 to-orange-900/50 flex items-center justify-center">
                    <Radio className="h-8 w-8 text-white/30" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      whileHover={{ scale: 1.1 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="bg-primary rounded-full p-2 shadow-xl"
                    >
                      <PlayCircle className="h-6 w-6 text-white" />
                    </motion.div>
                  </div>
                </div>
                <div className="mt-1.5">
                  <h3 className="font-medium text-xs text-white/90 truncate group-hover:text-primary transition-colors duration-300">Live TV</h3>
                  <div className="flex text-xs text-white/60 gap-2 mt-0.5">
                    <span className="flex items-center text-[10px]">Stream channels</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
          
          {/* Featured Content */}
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Featured Content
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Featured Content Cards */}
              <Card className="overflow-hidden border-0 shadow-xl rounded-xl relative bg-gradient-to-br from-black/80 to-black/40 backdrop-blur-sm">
                <div className="aspect-video bg-gradient-to-br from-blue-900/30 to-purple-900/30" />
                <div className="p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-sm">Premium Movies</h3>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-400 mr-0.5" />
                      <span className="text-xs text-white/70">4.9</span>
                    </div>
                  </div>
                  <p className="text-xs text-white/60 line-clamp-2">
                    Explore our collection of premium blockbusters and exclusive content.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 w-full justify-center bg-white/5 hover:bg-white/10"
                    onClick={() => navigate('/movies')}
                  >
                    Explore
                  </Button>
                </div>
              </Card>
              
              <Card className="overflow-hidden border-0 shadow-xl rounded-xl relative bg-gradient-to-br from-black/80 to-black/40 backdrop-blur-sm">
                <div className="aspect-video bg-gradient-to-br from-green-900/30 to-teal-900/30" />
                <div className="p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-sm">TV Series</h3>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-400 mr-0.5" />
                      <span className="text-xs text-white/70">4.8</span>
                    </div>
                  </div>
                  <p className="text-xs text-white/60 line-clamp-2">
                    Watch the latest episodes from your favorite TV series and shows.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 w-full justify-center bg-white/5 hover:bg-white/10"
                    onClick={() => navigate('/series')}
                  >
                    Watch Now
                  </Button>
                </div>
              </Card>
              
              <Card className="overflow-hidden border-0 shadow-xl rounded-xl relative bg-gradient-to-br from-black/80 to-black/40 backdrop-blur-sm">
                <div className="aspect-video bg-gradient-to-br from-red-900/30 to-amber-900/30" />
                <div className="p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-sm">Live Events</h3>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-400 mr-0.5" />
                      <span className="text-xs text-white/70">4.7</span>
                    </div>
                  </div>
                  <p className="text-xs text-white/60 line-clamp-2">
                    Stream live events, sports, and special programming in real-time.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 w-full justify-center bg-white/5 hover:bg-white/10"
                    onClick={() => playlist ? undefined : handlePlaylistLoaded}
                  >
                    Go Live
                  </Button>
                </div>
              </Card>
            </div>
          </section>
          
          {/* Footer */}
          <footer className="pt-6 pb-12">
            <Separator className="mb-6" />
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-primary/70" />
                <p className="text-sm text-white/50">SmoothStream</p>
              </div>
              <div className="flex gap-4 text-sm text-white/50">
                <span className="hover:text-white/80 cursor-pointer">Terms</span>
                <span className="hover:text-white/80 cursor-pointer">Privacy</span>
                <span className="hover:text-white/80 cursor-pointer">Help</span>
              </div>
            </div>
          </footer>
        </ScrollArea>
      </div>
    </Layout>
  );
};

export default Index;
