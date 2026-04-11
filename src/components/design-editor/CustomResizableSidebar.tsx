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
        "relative bg-background border-border flex-shrink-0 transition-none",
        side === "left" ? "border-r" : "border-l",
        className
      )}
      style={{ width: `${width}px` }}
    >
      <div
        className={cn(
          "absolute top-0 bottom-0 w-1.5 cursor-col-resize z-50 group",
          "hover:bg-primary/20 transition-all duration-300 hover:scale-105",
          side === "left" ? "right-0" : "left-0",
          isResizing && "bg-primary/30"
        )}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border group-hover:bg-primary/30 transition-all duration-300 group-hover:w-0.5" />
      </div>
      <div className="h-full overflow-hidden flex flex-col">{children}</div>
    </div>
  );
}
