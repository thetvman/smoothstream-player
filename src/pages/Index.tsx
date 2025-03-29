
import React from "react";
import Layout from "@/components/Layout";
import PlaylistInput from "@/components/PlaylistInput";
import ChannelList from "@/components/ChannelList";
import PaginationControls from "@/components/PaginationControls";
import PlayerSection from "@/components/PlayerSection";
import { usePlaylist } from "@/hooks/use-playlist";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Moon, Sun, Radio, Film, Tv, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <Layout fullHeight className="py-4 md:py-6 px-3 md:px-6 bg-background">
      <motion.div 
        className="flex flex-col h-full space-y-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Header Section */}
        <motion.div className="flex flex-col space-y-2" variants={item}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-primary" />
              <h1 className="text-xl md:text-2xl font-bold">SmoothStream</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleDarkMode}
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                className="transition-transform hover:rotate-12"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Watch your favorite content with a premium experience</p>
          
          {/* Navigation Buttons with animations */}
          <div className="flex mt-4 gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="default" 
                size="lg" 
                onClick={() => navigate('/movies')}
                className="flex items-center gap-2 bg-gradient-to-br from-primary to-primary/80 hover:shadow-lg transition-all duration-300"
              >
                <Film className="h-5 w-5" />
                Movies
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate('/series')}
                className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10 transition-all duration-300"
              >
                <Tv className="h-5 w-5" />
                Series
              </Button>
            </motion.div>
          </div>
          
          <Separator className="mt-4" />
        </motion.div>
          
        {/* Main Content Area */}
        <motion.div 
          className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden"
          variants={item}
        >
          <div className="lg:col-span-2 flex flex-col space-y-4">
            <Tabs defaultValue="player" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="player" className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300">Live TV</TabsTrigger>
                <TabsTrigger value="guide" className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300">TV Guide</TabsTrigger>
              </TabsList>
              <TabsContent value="player" className="mt-2">
                <Card className="overflow-hidden border-0 shadow-xl rounded-xl">
                  <PlayerSection 
                    selectedChannel={selectedChannel} 
                    epgData={epgData} 
                    isEpgLoading={isEpgLoading} 
                  />
                </Card>
              </TabsContent>
              <TabsContent value="guide" className="mt-2">
                <Card className="p-4 shadow-xl rounded-xl">
                  <h3 className="text-lg font-medium mb-2">Program Guide</h3>
                  <Separator className="mb-4" />
                  {selectedChannel ? (
                    <div className="flex flex-col space-y-2">
                      <h4 className="font-medium">{selectedChannel.name}</h4>
                      <div className="max-h-[400px] overflow-auto">
                        {isEpgLoading ? (
                          <p className="text-sm text-muted-foreground">Loading program data...</p>
                        ) : epgData && epgData.length > 0 ? (
                          <ScrollArea className="h-[400px]">
                            <div className="space-y-2">
                              {epgData.map((program, index) => (
                                <motion.div 
                                  key={index} 
                                  className="p-3 rounded-md hover:bg-muted/80 transition-colors border border-transparent hover:border-primary/20"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  whileHover={{ x: 5 }}
                                >
                                  <div className="flex justify-between">
                                    <span className="text-sm font-medium">{program.title}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(program.start).toLocaleTimeString()} - {new Date(program.end).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  {program.description && (
                                    <p className="text-xs text-muted-foreground mt-1">{program.description}</p>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </ScrollArea>
                        ) : (
                          <p className="text-sm text-muted-foreground">No program data available</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Select a channel to view program guide</p>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
            
            {!playlist && (
              <motion.div 
                className="flex-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6 shadow-xl rounded-xl bg-gradient-to-br from-background to-accent/5">
                  <PlaylistInput onPlaylistLoaded={handlePlaylistLoaded} />
                </Card>
              </motion.div>
            )}
          </div>
          
          <motion.div 
            className="h-full flex flex-col overflow-hidden"
            variants={item}
          >
            <Card className="flex-1 flex flex-col overflow-hidden shadow-xl rounded-xl border-primary/10">
              <ChannelList
                playlist={playlist}
                paginatedChannels={paginatedChannels}
                selectedChannel={selectedChannel}
                onSelectChannel={handleSelectChannel}
                isLoading={isLoading}
                onClearPlaylist={handleClearPlaylist}
              />
              
              {paginatedChannels && paginatedChannels.totalPages > 1 && (
                <div className="border-t p-2">
                  <PaginationControls 
                    paginatedChannels={paginatedChannels}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Index;
