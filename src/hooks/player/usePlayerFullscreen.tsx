
import { useState, useCallback, useRef, RefObject } from "react";
import screenfull from 'screenfull';

export function usePlayerFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  
  // Handle fullscreen changes
  const handleScreenfullChange = useCallback(() => {
    setIsFullscreen(screenfull.isFullscreen);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (screenfull.isEnabled && playerContainerRef.current) {
      screenfull.toggle(playerContainerRef.current);
      setIsFullscreen(screenfull.isFullscreen);
    }
  }, []);

  // Setup screenfull event listeners
  const setupScreenfullListeners = useCallback(() => {
    if (screenfull.isEnabled) {
      screenfull.on('change', handleScreenfullChange);
    }

    return () => {
      if (screenfull.isEnabled) {
        screenfull.off('change', handleScreenfullChange);
      }
    };
  }, [handleScreenfullChange]);

  return {
    isFullscreen,
    playerContainerRef,
    handleToggleFullscreen,
    setupScreenfullListeners
  };
}
