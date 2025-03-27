
import React from "react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  fullHeight?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, className, fullHeight = false }) => {
  return (
    <div 
      className={cn(
        "mx-auto w-full max-w-screen-2xl px-4 sm:px-6 md:px-8",
        fullHeight ? "min-h-screen flex flex-col" : "",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Layout;
