"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useResizable } from "@/hooks/use-resizable";

interface CustomResizableSidebarProps {
  children: React.ReactNode;
  side?: "left" | "right";
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
}

export function CustomResizableSidebar({
  children,
  side = "right",
  defaultWidth = 350,
  minWidth = 250,
  maxWidth = 800,
  className,
}: CustomResizableSidebarProps) {
  const { width, isResizing, sidebarRef, handleMouseDown } = useResizable({
    side,
    defaultWidth,
    minWidth,
    maxWidth,
  });

  return (
    <div
      ref={sidebarRef}
      className={cn(
        "relative bg-background backdrop-blur-sm border  shadow-2xl flex-shrink-0 transition-none",
        side === "left" ? "border-r" : "border-l",
        className
      )}
      style={{ width: `${width}px` }}
    >
      <div
        className={cn(
          "absolute top-0 bottom-0 w-1.5 cursor-col-resize z-50 group",
          "hover:bg-blue-500/20 transition-all duration-300 hover:scale-105",
          side === "left" ? "right-0" : "left-0",
          isResizing && "bg-blue-500/30"
        )}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-black/10 group-hover:bg-blue-500 transition-all duration-300 group-hover:w-1 group-hover:shadow-lg group-hover:shadow-blue-500/20" />
      </div>
      <div className="h-full overflow-hidden flex flex-col">{children}</div>
    </div>
  );
}
