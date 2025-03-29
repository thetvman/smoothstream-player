
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Channel, Playlist } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { safeJsonParse } from "@/lib/utils";
import { fetchEPGData } from "@/lib/epg";

export function usePlayerPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [epgData, setEpgData] = useState<any[] | null>(null);
  const [isEpgLoading, setIsEpgLoading] = useState(false);
  const [epgLoaded, setEpgLoaded] = useState(false);
  const { toast } = useToast();
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  
  // Load playlist from localStorage
  useEffect(() => {
    const savedPlaylist = localStorage.getItem("iptv-playlist");
    if (savedPlaylist && channelId) {
      const parsedPlaylist = safeJsonParse<Playlist | null>(savedPlaylist, null);
      if (parsedPlaylist) {
        setPlaylist(parsedPlaylist);
        const foundChannel = parsedPlaylist.channels.find(c => c.id === channelId) || null;
        setChannel(foundChannel);
        
        if (!foundChannel) {
          toast({
            title: "Channel not found",
            description: "The requested channel could not be found",
            variant: "destructive"
          });
          navigate("/");
        }
      } else {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [channelId, navigate, toast]);

  // Set dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
    
    const checkFullscreen = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', checkFullscreen);
    
    return () => {
      const darkModePreference = localStorage.getItem("iptv-dark-mode") === "true";
      if (!darkModePreference) {
        document.documentElement.classList.remove('dark');
      }
      document.removeEventListener('fullscreenchange', checkFullscreen);
    };
  }, []);
  
  // Load EPG data
  useEffect(() => {
    const loadEpgData = async () => {
      if (!channel || !channel.epg_channel_id || epgLoaded) {
        return;
      }
      
      setIsEpgLoading(true);
      try {
        const data = await fetchEPGData(channel);
        
        if (data && data.length > 0) {
          console.log(`Loaded ${data.length} EPG programs for ${channel.name}`);
          setEpgData(data);
        } else {
          console.log(`No EPG data found for ${channel.name}`);
          setEpgData(null);
        }
        setEpgLoaded(true);
      } catch (error) {
        console.error(`Error fetching EPG data for ${channel.name}:`, error);
        setEpgData(null);
      } finally {
        setIsEpgLoading(false);
      }
    };
    
    if (showInfo && !epgLoaded) {
      loadEpgData();
    }
  }, [channel, showInfo, epgLoaded]);
  
  // Controls visibility timeout
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      if (!showInfo) {
        setShowControls(true);
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };
    
    if (!showInfo) {
      resetControlsTimeout();
    }
    
    const handleMouseMove = () => !showInfo && resetControlsTimeout();
    const handleClick = () => !showInfo && resetControlsTimeout();
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
    };
  }, [showInfo]);
  
  const handleShowInfo = () => {
    setShowControls(false);
    setShowInfo(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
  };
  
  const handleHideInfo = () => {
    setShowInfo(false);
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };
  
  const navigateToChannel = (direction: 'next' | 'prev') => {
    if (!playlist || !channel) return;
    
    const currentIndex = playlist.channels.findIndex(c => c.id === channel.id);
    if (currentIndex === -1) return;
    
    let newIndex: number;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % playlist.channels.length;
    } else {
      newIndex = (currentIndex - 1 + playlist.channels.length) % playlist.channels.length;
    }
    
    const newChannel = playlist.channels[newIndex];
    
    // Optimize channel switching
    setIsEpgLoading(true);
    setEpgData(null);
    setEpgLoaded(false);
    
    // Pre-set the Channel immediately to avoid delay
    setChannel(newChannel);
    
    // Update URL asynchronously
    navigate(`/player/${newChannel.id}`, { replace: true });
  };
  
  return {
    channel,
    showInfo, 
    setShowInfo,
    showControls,
    epgData,
    isEpgLoading,
    handleShowInfo,
    handleHideInfo,
    navigateToChannel,
    playlist,
    showGuide,
    setShowGuide,
    isFullscreen
  };
}
