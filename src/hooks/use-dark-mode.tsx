
import { useState, useEffect } from "react";

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    const darkModePreference = localStorage.getItem("iptv-dark-mode") === "true";
    setIsDarkMode(darkModePreference);
  }, []);
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem("iptv-dark-mode", isDarkMode.toString());
  }, [isDarkMode]);
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  return { isDarkMode, toggleDarkMode };
}
