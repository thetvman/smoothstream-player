
import { useState, useEffect } from "react";
import { Playlist, Channel, PaginatedChannels } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";
import { paginateChannels, ITEMS_PER_PAGE } from "@/lib/paginationUtils";
import { fetchEPGData, type EPGProgram } from "@/lib/epg";
import { useToast } from "@/hooks/use-toast";

// Maximum number of channels to store in localStorage to prevent quota issues
const MAX_STORED_CHANNELS = 1000;

export function usePlaylist() {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedChannels, setPaginatedChannels] = useState<PaginatedChannels | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [epgData, setEpgData] = useState<EPGProgram[] | null>(null);
  const [isEpgLoading, setIsEpgLoading] = useState(false);
  const { toast } = useToast();

  // Load saved playlist from localStorage
  useEffect(() => {
    const savedPlaylist = localStorage.getItem("iptv-playlist");
    if (savedPlaylist) {
      const parsedPlaylist = safeJsonParse<Playlist | null>(savedPlaylist, null);
      if (parsedPlaylist) {
        setPlaylist(parsedPlaylist);
        
        const savedChannelId = localStorage.getItem("iptv-last-channel");
        if (savedChannelId) {
          const channel = parsedPlaylist.channels.find(c => c.id === savedChannelId) || null;
          setSelectedChannel(channel);
        }
      }
    }
  }, []);

  // Update paginatedChannels when playlist or currentPage changes
  useEffect(() => {
    if (playlist) {
      setPaginatedChannels(paginateChannels(playlist.channels, currentPage, ITEMS_PER_PAGE));
    } else {
      setPaginatedChannels(null);
    }
  }, [playlist, currentPage]);

  // Save playlist and selectedChannel to localStorage
  useEffect(() => {
    if (playlist) {
      try {
        // Create a storage-friendly version of the playlist with limited channels
        const storagePlaylist: Playlist = {
          ...playlist,
          channels: playlist.channels.length > MAX_STORED_CHANNELS 
            ? playlist.channels.slice(0, MAX_STORED_CHANNELS) 
            : playlist.channels
        };
        
        // If we had to limit the channels, add a note to the name
        if (playlist.channels.length > MAX_STORED_CHANNELS) {
          storagePlaylist.name = `${playlist.name} (First ${MAX_STORED_CHANNELS} of ${playlist.channels.length} channels)`;
        }
        
        localStorage.setItem("iptv-playlist", JSON.stringify(storagePlaylist));
        
        // Show warning if channels were truncated for storage
        if (playlist.channels.length > MAX_STORED_CHANNELS && !localStorage.getItem("channel-limit-warned")) {
          toast({
            title: "Large Playlist Detected",
            description: `Your playlist has ${playlist.channels.length.toLocaleString()} channels. Only the first ${MAX_STORED_CHANNELS.toLocaleString()} will be saved between sessions to prevent storage issues.`,
            duration: 6000,
          });
          localStorage.setItem("channel-limit-warned", "true");
        }
      } catch (error) {
        console.error("Failed to save playlist to localStorage:", error);
        toast({
          title: "Storage Error",
          description: "Unable to save your playlist due to browser storage limitations. Your channels will be available for this session only.",
          variant: "destructive",
          duration: 6000,
        });
      }
    }
    
    if (selectedChannel) {
      try {
        localStorage.setItem("iptv-last-channel", selectedChannel.id);
      } catch (error) {
        console.error("Failed to save selected channel to localStorage:", error);
      }
    }
  }, [playlist, selectedChannel, toast]);

  // Fetch EPG data when selectedChannel changes
  useEffect(() => {
    const getEPGData = async () => {
      if (!selectedChannel || !selectedChannel.epg_channel_id) {
        setEpgData(null);
        return;
      }
      
      setIsEpgLoading(true);
      try {
        const data = await fetchEPGData(selectedChannel);
        setEpgData(data);
      } catch (error) {
        console.error("Error fetching EPG data:", error);
        setEpgData(null);
      } finally {
        setIsEpgLoading(false);
      }
    };
    
    getEPGData();
  }, [selectedChannel]);

  const handlePlaylistLoaded = (newPlaylist: Playlist) => {
    setIsLoading(true);
    
    setTimeout(() => {
      setPlaylist(newPlaylist);
      setCurrentPage(1);
      
      if (newPlaylist.channels.length > 0) {
        setSelectedChannel(newPlaylist.channels[0]);
      }
      
      setIsLoading(false);
      
      // Show info about the loaded playlist
      toast({
        title: "Playlist Loaded",
        description: `${newPlaylist.name} with ${newPlaylist.channels.length.toLocaleString()} channels has been loaded successfully.`,
      });
    }, 50);
  };

  const handleSelectChannel = (channel: Channel) => {
    setSelectedChannel(channel);
  };

  const handleClearPlaylist = () => {
    localStorage.removeItem("iptv-playlist");
    localStorage.removeItem("iptv-last-channel");
    localStorage.removeItem("channel-limit-warned");
    setPlaylist(null);
    setSelectedChannel(null);
    setPaginatedChannels(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return {
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
  };
}
