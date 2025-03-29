
import { useState, useEffect } from "react";
import { Episode, Series } from "@/lib/types";

export function useEpisodeNavigation(episode: Episode | null, series: Series | null) {
  const [prevEpisodeId, setPrevEpisodeId] = useState<string | null>(null);
  const [nextEpisodeId, setNextEpisodeId] = useState<string | null>(null);
  
  // Find previous and next episodes whenever the episode changes
  useEffect(() => {
    if (!episode || !series || !series.seasons) return;
    
    const currentSeasonNumber = episode.season_number;
    const currentEpisodeNumber = episode.episode_number;
    
    const currentSeason = series.seasons.find(
      season => season.season_number === currentSeasonNumber
    );
    
    if (currentSeason && currentSeason.episodes) {
      const sortedEpisodes = [...currentSeason.episodes].sort(
        (a, b) => parseInt(a.episode_number) - parseInt(b.episode_number)
      );
      
      const currentEpisodeIndex = sortedEpisodes.findIndex(
        ep => ep.episode_number === currentEpisodeNumber
      );
      
      // Find next episode
      if (currentEpisodeIndex !== -1 && currentEpisodeIndex < sortedEpisodes.length - 1) {
        setNextEpisodeId(sortedEpisodes[currentEpisodeIndex + 1].id);
      } else {
        const seasonNumbers = series.seasons.map(s => parseInt(s.season_number));
        const currentSeasonInt = parseInt(currentSeasonNumber);
        const nextSeasonNumber = seasonNumbers.find(num => num > currentSeasonInt);
        
        if (nextSeasonNumber) {
          const nextSeason = series.seasons.find(
            season => parseInt(season.season_number) === nextSeasonNumber
          );
          
          if (nextSeason && nextSeason.episodes && nextSeason.episodes.length > 0) {
            const sortedNextSeasonEpisodes = [...nextSeason.episodes].sort(
              (a, b) => parseInt(a.episode_number) - parseInt(b.episode_number)
            );
            
            setNextEpisodeId(sortedNextSeasonEpisodes[0].id);
          } else {
            setNextEpisodeId(null);
          }
        } else {
          setNextEpisodeId(null);
        }
      }
      
      // Find previous episode
      if (currentEpisodeIndex > 0) {
        setPrevEpisodeId(sortedEpisodes[currentEpisodeIndex - 1].id);
      } else {
        const seasonNumbers = series.seasons.map(s => parseInt(s.season_number)).sort((a, b) => a - b);
        const currentSeasonInt = parseInt(currentSeasonNumber);
        const prevSeasonNumber = [...seasonNumbers].reverse().find(num => num < currentSeasonInt);
        
        if (prevSeasonNumber) {
          const prevSeason = series.seasons.find(
            season => parseInt(season.season_number) === prevSeasonNumber
          );
          
          if (prevSeason && prevSeason.episodes && prevSeason.episodes.length > 0) {
            const sortedPrevSeasonEpisodes = [...prevSeason.episodes].sort(
              (a, b) => parseInt(a.episode_number) - parseInt(b.episode_number)
            );
            
            setPrevEpisodeId(sortedPrevSeasonEpisodes[sortedPrevSeasonEpisodes.length - 1].id);
          } else {
            setPrevEpisodeId(null);
          }
        } else {
          setPrevEpisodeId(null);
        }
      }
    }
  }, [episode, series]);
  
  return {
    prevEpisodeId,
    nextEpisodeId
  };
}
