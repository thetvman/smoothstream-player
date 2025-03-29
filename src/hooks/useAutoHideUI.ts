
import { useState, useEffect, useRef } from "react";

interface UseAutoHideUIOptions {
  initialVisibility?: boolean;
  hideDelay?: number;
  showOnPlay?: boolean;
}

export function useAutoHideUI({
  initialVisibility = true,
  hideDelay = 5000,
  showOnPlay = false
}: UseAutoHideUIOptions = {}) {
  const [isVisible, setIsVisible] = useState(initialVisibility);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const clearHideTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };
  
  const setupHideTimeout = () => {
    clearHideTimeout();
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, hideDelay);
  };
  
  // Mouse move handler to show UI and reset timeout
  const handleInteraction = () => {
    setIsVisible(true);
    setupHideTimeout();
  };
  
  // Setup event listeners for mouse/touch movement
  useEffect(() => {
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    
    return () => {
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      clearHideTimeout();
    };
  }, []);
  
  // Handle visibility changes when isPlaying changes
  const updateVisibilityOnPlayState = (isPlaying: boolean) => {
    if (showOnPlay || !isPlaying) {
      setIsVisible(true);
      
      if (isPlaying) {
        setupHideTimeout();
      } else {
        clearHideTimeout();
      }
    }
  };
  
  const show = () => {
    setIsVisible(true);
    setupHideTimeout();
  };
  
  const hide = () => {
    setIsVisible(false);
    clearHideTimeout();
  };
  
  const toggle = () => {
    if (isVisible) {
      hide();
    } else {
      show();
    }
  };
  
  return {
    isVisible,
    setIsVisible, // Explicitly exposing the setter
    show,
    hide,
    toggle,
    updateVisibilityOnPlayState
  };
}
