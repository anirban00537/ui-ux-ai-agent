import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { SlashCommand, SLASH_COMMANDS } from "./commands";

interface SlashMenuProps {
  open: boolean;
  query: string;
  position: { top: number; left: number };
  selectedIndex: number;
  onSelect: (command: SlashCommand) => void;
  onClose?: () => void;
}

export const SlashMenu: React.FC<SlashMenuProps> = ({
  open,
  query,
  position,
  selectedIndex,
  onSelect,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredCommands = SLASH_COMMANDS.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose?.();
      }
    };

    // Use mousedown to catch clicks before they might be prevented
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  // Close on scroll
  useEffect(() => {
    if (!open) return;

    const handleScroll = () => {
      onClose?.();
    };

    // Listen for scroll on window and any scrollable parent
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [open, onClose]);

  // Close on Escape key (handled globally)
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || filteredCommands.length === 0) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-card rounded-xl shadow-2xl border border-border py-2 min-w-[220px] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      style={{
        top: position.top + 10,
        left: Math.max(0, position.left),
      }}
    >
      <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Blocks
      </div>
      {filteredCommands.map((cmd, index) => (
        <button
          key={cmd.id}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(cmd);
          }}
          className={cn(
            "w-full px-3 py-2 flex items-center gap-3 text-left transition-colors",
            index === selectedIndex
              ? "bg-primary/10 text-primary"
              : "hover:bg-muted text-foreground"
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
            {cmd.icon}
          </div>
          <div>
            <div className="font-medium text-sm">{cmd.label}</div>
            <div className="text-xs text-muted-foreground">{cmd.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
};

