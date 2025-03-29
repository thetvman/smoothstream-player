
import React from "react";
import Layout from "@/components/Layout";
import PlaylistInput from "@/components/PlaylistInput";
import ChannelList from "@/components/ChannelList";
import PaginationControls from "@/components/PaginationControls";
import PlayerSection from "@/components/PlayerSection";
import { usePlaylist } from "@/hooks/use-playlist";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Moon, Sun, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  
  return (
    <Layout fullHeight className="py-4 md:py-6 px-3 md:px-6">
      <div className="flex flex-col h-full space-y-4">
        {/* Header Section */}
        <div className="flex flex-col space-y-2">
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
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Watch your favorite content with a premium experience</p>
          <Separator className="mt-2" />
        </div>
          
        {/* Main Content Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 overflow-hidden">
          <div className="lg:col-span-2 flex flex-col space-y-4">
            <Tabs defaultValue="player" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="player">Live TV</TabsTrigger>
                <TabsTrigger value="guide">TV Guide</TabsTrigger>
              </TabsList>
              <TabsContent value="player" className="mt-2">
                <Card className="overflow-hidden border-0 shadow-md">
                  <PlayerSection 
                    selectedChannel={selectedChannel} 
                    epgData={epgData} 
                    isEpgLoading={isEpgLoading} 
                  />
                </Card>
              </TabsContent>
              <TabsContent value="guide" className="mt-2">
                <Card className="p-4 shadow-md">
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
                                <div key={index} className="p-2 rounded-md hover:bg-muted">
                                  <div className="flex justify-between">
                                    <span className="text-sm font-medium">{program.title}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(program.start).toLocaleTimeString()} - {new Date(program.end).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  {program.description && (
                                    <p className="text-xs text-muted-foreground mt-1">{program.description}</p>
                                  )}
                                </div>
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
              <div className="flex-1">
                <Card className="p-6 shadow-md">
                  <PlaylistInput onPlaylistLoaded={handlePlaylistLoaded} />
                </Card>
              </div>
            )}
          </div>
          
          <div className="h-full flex flex-col overflow-hidden">
            <Card className="flex-1 flex flex-col overflow-hidden shadow-md">
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
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
