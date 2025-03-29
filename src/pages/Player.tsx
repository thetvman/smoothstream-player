
import React from "react";
import { usePlayerPage } from "@/hooks/player/usePlayerPage";
import PlayerView from "@/components/player/PlayerView";

const Player = () => {
  const playerPageProps = usePlayerPage();
  
  // If no channel is found, return null
  if (!playerPageProps.channel) {
    return null;
  }

  return <PlayerView {...playerPageProps} />;
};

export default Player;
