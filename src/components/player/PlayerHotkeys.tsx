
import { useHotkeys } from 'react-hotkeys-hook';

interface PlayerHotkeysProps {
  onPlayPause: () => void;
  onMuteUnmute: () => void;
  onToggleFullscreen: () => void;
  isMobile: boolean;
}

const PlayerHotkeys: React.FC<PlayerHotkeysProps> = ({ 
  onPlayPause, 
  onMuteUnmute, 
  onToggleFullscreen,
  isMobile
}) => {
  // Set up hotkeys
  useHotkeys('space', (e) => {
    e.preventDefault();
    onPlayPause();
  }, { enabled: !isMobile });
  
  useHotkeys('m', (e) => {
    e.preventDefault();
    onMuteUnmute();
  }, { enabled: !isMobile });
  
  useHotkeys('f', (e) => {
    e.preventDefault();
    onToggleFullscreen();
  }, { enabled: !isMobile });
  
  // This component doesn't render anything, it just sets up the hotkeys
  return null;
};

export default PlayerHotkeys;
