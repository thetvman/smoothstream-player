
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoPlayer from "@/components/VideoPlayer";
import { Channel, Playlist, XtreamCredentials, XtreamEpisode } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const Player = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [episodes, setEpisodes] = useState<XtreamEpisode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<XtreamEpisode | null>(null);
  
  // Load channel from localStorage
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      
      try {
        const savedPlaylist = localStorage.getItem("iptv-playlist");
        if (savedPlaylist && channelId) {
          const parsedPlaylist = safeJsonParse<Playlist | null>(savedPlaylist, null);
          if (parsedPlaylist) {
            // Try to find the channel in the regular channels list
            const foundChannel = parsedPlaylist.channels.find(c => c.id === channelId) || null;
            
            if (foundChannel) {
              console.log("Found channel:", foundChannel.name);
              setChannel(foundChannel);
              
              // Check if it's a series and load episodes if needed
              if (foundChannel.stream_type === "series" && parsedPlaylist.source === "xtream" && parsedPlaylist.credentials) {
                await loadSeriesEpisodes(foundChannel, parsedPlaylist.credentials);
              }
            } 
            else if (channelId.startsWith('vod-') || channelId.startsWith('series-')) {
              // For VOD content, try to load directly from Xtream API
              console.log("Loading VOD/Series content:", channelId);
              await loadContentDirectly(channelId, parsedPlaylist);
            } 
            else {
              toast.error("Content not found");
              navigate("/");
            }
          } else {
            navigate("/");
          }
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error loading content:", error);
        toast.error("Failed to load content");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadContent();
  }, [channelId, navigate]);

  // Function to load content directly from Xtream API
  const loadContentDirectly = async (contentId: string, playlist: Playlist) => {
    if (!playlist.credentials || playlist.source !== "xtream") {
      toast.error("Content not found");
      navigate("/");
      return;
    }

    const { server, username, password } = playlist.credentials;
    
    try {
      if (contentId.startsWith('vod-')) {
        // It's a movie
        const streamId = contentId.replace('vod-', '');
        const movieChannel: Channel = {
          id: contentId,
          name: `Movie ${streamId}`, // Will be updated with actual title
          url: `${server}/movie/${username}/${password}/${streamId}.mp4`,
          stream_type: "mp4"
        };
        
        // Try to fetch movie details to get the name
        try {
          const movieInfoUrl = `${server}/player_api.php?username=${username}&password=${password}&action=get_vod_info&vod_id=${streamId}`;
          const response = await fetch(movieInfoUrl);
          const data = await response.json();
          
          if (data && data.info) {
            movieChannel.name = data.info.name || movieChannel.name;
            movieChannel.logo = data.info.movie_image || undefined;
            movieChannel.group = data.info.category_name || undefined;
            
            // Try m3u8 format first for better compatibility
            movieChannel.url = `${server}/movie/${username}/${password}/${streamId}.m3u8`;
            movieChannel.stream_type = "m3u8";
          }
        } catch (error) {
          console.error("Error fetching movie details:", error);
        }
        
        setChannel(movieChannel);
      } 
      else if (contentId.startsWith('series-')) {
        // It's a series
        const seriesId = contentId.replace('series-', '');
        const seriesChannel: Channel = {
          id: contentId,
          name: `Series ${seriesId}`, // Will be updated with actual title
          url: `${server}/series/${username}/${password}/${seriesId}`,
          stream_type: "series",
          epg_channel_id: seriesId
        };
        
        // Try to fetch series details to get the name
        try {
          const seriesInfoUrl = `${server}/player_api.php?username=${username}&password=${password}&action=get_series_info&series_id=${seriesId}`;
          const response = await fetch(seriesInfoUrl);
          const data = await response.json();
          
          if (data && data.info) {
            seriesChannel.name = data.info.name || seriesChannel.name;
            seriesChannel.logo = data.info.cover || data.info.backdrop_path || undefined;
            seriesChannel.group = data.info.category_name || undefined;
          }
          
          setChannel(seriesChannel);
          
          // Load episodes
          if (data && data.episodes) {
            await loadSeriesEpisodesFromData(data.episodes, server, username, password);
          }
        } catch (error) {
          console.error("Error fetching series details:", error);
        }
      } else {
        toast.error("Content not found");
        navigate("/");
      }
    } catch (error) {
      console.error("Error loading content directly:", error);
      toast.error("Failed to load content");
      navigate("/");
    }
  };
  
  // Function to load episodes from series data
  const loadSeriesEpisodesFromData = async (episodesData: any, server: string, username: string, password: string) => {
    try {
      // Flatten the episodes from all seasons
      const allEpisodes: XtreamEpisode[] = [];
      
      Object.entries(episodesData).forEach(([seasonNum, episodes]: [string, any]) => {
        if (Array.isArray(episodes)) {
          episodes.forEach((episode: any) => {
            // Try m3u8 format first for better compatibility
            const episodeUrl = `${server}/series/${username}/${password}/${episode.id}.m3u8`;
            
            allEpisodes.push({
              ...episode,
              season: seasonNum,
              url: episodeUrl
            });
          });
        }
      });
      
      setEpisodes(allEpisodes);
      
      // Select the first episode by default
      if (allEpisodes.length > 0) {
        setSelectedEpisode(allEpisodes[0]);
      }
    } catch (error) {
      console.error("Error processing series episodes:", error);
    }
  };
  
  const loadSeriesEpisodes = async (seriesChannel: Channel, credentials: XtreamCredentials) => {
    try {
      const { server, username, password } = credentials;
      const seriesId = seriesChannel.epg_channel_id; // This should contain the series_id
      
      if (!seriesId) {
        console.error("No series ID found");
        return;
      }
      
      // Extract the series ID from the channel ID or epg_channel_id
      const seriesInfoUrl = `${server}/player_api.php?username=${username}&password=${password}&action=get_series_info&series_id=${seriesId}`;
      
      const response = await fetch(seriesInfoUrl);
      const data = await response.json();
      
      if (data && data.episodes) {
        await loadSeriesEpisodesFromData(data.episodes, server, username, password);
      }
    } catch (error) {
      console.error("Error loading series episodes:", error);
      toast.error("Failed to load episodes");
    }
  };
  
  // Get the right URL to play based on content type
  const getPlayUrl = () => {
    if (!channel) return null;
    
    // If it's a series and we have a selected episode
    if (channel.stream_type === "series" && selectedEpisode) {
      return selectedEpisode.url;
    }
    
    // Regular channel or movie
    return channel.url;
  };
  
  // Get correct channel name for the player
  const getDisplayName = () => {
    if (!channel) return "";
    
    if (channel.stream_type === "series" && selectedEpisode) {
      return `${channel.name} - S${selectedEpisode.season} E${selectedEpisode.episode_num}: ${selectedEpisode.title}`;
    }
    
    return channel.name;
  };
  
  const handleEpisodeSelect = (episode: XtreamEpisode) => {
    setSelectedEpisode(episode);
  };
  
  // Create a channel object for the VideoPlayer
  const playerChannel = channel ? {
    ...channel,
    name: getDisplayName(),
    url: getPlayUrl() || channel.url
  } : null;

  const getReturnPath = () => {
    if (!channel) return "/";
    
    if (channel.id.startsWith('vod-')) {
      return "/movies";
    } else if (channel.id.startsWith('series-')) {
      return "/tv-series";
    } else if (channel.group?.toLowerCase().includes("movie")) {
      return "/movies";
    } else {
      return "/";
    }
  };
  
  return (
    <div className="fixed inset-0 bg-player">
      <div className="absolute top-4 left-4 z-10">
        <button 
          className="btn-icon bg-black/40 hover:bg-black/60"
          onClick={() => navigate(getReturnPath())}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
      
      <div className="h-full flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-5xl">
          <VideoPlayer channel={playerChannel} autoPlay />
          
          {/* Display episodes list for TV Series */}
          {channel?.stream_type === "series" && episodes.length > 0 && (
            <div className="mt-4 bg-background/80 backdrop-blur-sm rounded-lg p-4 max-h-48 overflow-auto">
              <h3 className="text-lg font-medium mb-2">Episodes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {episodes.map((episode) => (
                  <button
                    key={episode.id}
                    onClick={() => handleEpisodeSelect(episode)}
                    className={`text-left p-2 rounded text-sm hover:bg-primary/20 
                    ${selectedEpisode?.id === episode.id ? 'bg-primary/30 font-medium' : ''}`}
                  >
                    S{episode.season} E{episode.episode_num}: {episode.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Player;
