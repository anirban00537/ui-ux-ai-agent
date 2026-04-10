import React from 'react';
import {
  MousePointer2,
  Hand,
  Undo2,
  Redo2,
  Minus,
  Plus,
  Play,
  Palette,
  ScanEye
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type CanvasTool = 'select' | 'hand' | 'inspect';

interface CanvasToolbarProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  activeTool: CanvasTool;
  onToolChange: (tool: CanvasTool) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onPreview?: () => void;
  onTheme?: () => void;
}

export function CanvasToolbar({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  activeTool,
  onToolChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onPreview,
  onTheme
}: CanvasToolbarProps) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 bg-[#1f2228] border border-white/10 p-2">

        {/* Tools Section */}
        <div className="flex items-center gap-1 pr-2 border-r border-white/10">
          <ToolbarButton
            active={activeTool === 'select'}
            onClick={() => onToolChange('select')}
            icon={<MousePointer2 className="w-4 h-4 fill-current" />}
            label="Select (V)"
          />
          <ToolbarButton
            active={activeTool === 'hand'}
            onClick={() => onToolChange('hand')}
            icon={<Hand className="w-4 h-4" />}
            label="Pan (H)"
          />
        </div>

        {/* Zoom Section */}
        <div className="flex items-center gap-1 pl-2">
          <ToolbarButton
            onClick={onZoomOut}
            icon={<Minus className="w-4 h-4" />}
            label="Zoom Out"
          />
          <div className="w-12 text-center text-[13px] font-bold text-white/50 tabular-nums select-none font-mono">
            {Math.round(zoomLevel * 100)}%
          </div>
          <ToolbarButton
            onClick={onZoomIn}
            icon={<Plus className="w-4 h-4" />}
            label="Zoom In"
          />
        </div>

        {/* Extra Features Section (Theme only now) */}
        {onTheme && (
          <div className="flex items-center gap-1 pl-2 ml-2 border-l border-white/10">
            <ToolbarButton
              onClick={onTheme}
              icon={<Palette className="w-4 h-4" />}
              label="Theme"
            />
          </div>
        )}

      </div>
    </div>
  );
}

interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon: React.ReactNode;
  label: string;
}

function ToolbarButton({ active, icon, label, className, ...props }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      className={cn(
        "w-9 h-9 flex items-center justify-center rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 font-mono uppercase tracking-[1.4px]",
        active
          ? "bg-white text-[#1f2228] font-bold"
          : "text-white/50 hover:text-white hover:bg-white/10",
        props.disabled && "opacity-30 cursor-not-allowed hover:bg-transparent hover:text-white/50",
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );
}
