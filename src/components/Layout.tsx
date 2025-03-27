
import React from "react";
import { cn } from "@/lib/utils";

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
  const maxWidthClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    "full": "max-w-full",
  };

  return (
    <div 
      className={cn(
        "w-full",
        withSidebar ? "flex h-screen overflow-hidden" : "mx-auto",
        maxWidth === "full" || withSidebar ? "" : maxWidthClasses[maxWidth],
        padded && !withSidebar ? "px-4 sm:px-6 md:px-8" : "",
        fullHeight && !withSidebar ? "min-h-screen flex flex-col" : "",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Layout;
