
import React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  fullHeight?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padded?: boolean;
  withSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  className, 
  fullHeight = false,
  maxWidth = "2xl",
  padded = true,
  withSidebar = false,
}) => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  
  const maxWidthClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    "full": "max-w-full",
  };

  // Responsive padding based on device type
  const getPadding = () => {
    if (!padded || withSidebar) return "";
    
    if (isMobile) return "px-3 py-3";
    if (isTablet) return "px-4 py-4 sm:px-6";
    return "px-4 py-4 sm:px-6 md:px-8";
  };

  return (
    <div 
      className={cn(
        "w-full mobile-safe-area min-h-screen",
        withSidebar ? "flex h-screen overflow-hidden" : "mx-auto",
        maxWidth === "full" || withSidebar ? "" : maxWidthClasses[maxWidth],
        getPadding(),
        fullHeight && !withSidebar ? "min-h-screen flex flex-col" : "",
        isMobile ? "text-sm" : "text-base", // Slightly smaller text on mobile
        className
      )}
    >
      {children}
    </div>
  );
};

export default Layout;
