
import * as React from "react"

// Define breakpoints for different device types
const MOBILE_BREAKPOINT = 640  // Phones (smaller threshold for better mobile UI)
const TABLET_BREAKPOINT = 1024 // Tablets & small laptops

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Function to check if device is mobile based on screen width
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Check on initial render
    checkMobile()
    
    // Set up event listener for resize
    window.addEventListener("resize", checkMobile)
    
    // Also consider device-specific features like touch support
    const hasTouchScreen = () => {
      return 'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 || 
        // @ts-ignore - For Safari iOS detection
        (navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 0)
    }
    
    // If it's a touch device with a small screen, it's definitely mobile
    if (hasTouchScreen() && window.innerWidth < MOBILE_BREAKPOINT) {
      setIsMobile(true)
    }
    
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return !!isMobile
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)
  const isMobile = useIsMobile()

  React.useEffect(() => {
    // Function to check if device is a tablet
    const checkTablet = () => {
      const width = window.innerWidth
      setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT)
    }
    
    // Check on initial render
    checkTablet()
    
    // Set up event listener
    window.addEventListener("resize", checkTablet)
    
    return () => window.removeEventListener("resize", checkTablet)
  }, [])

  return !!isTablet && !isMobile
}

// Combined hook to detect both mobile and tablet
export function useIsMobileOrTablet() {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  
  return isMobile || isTablet
}
