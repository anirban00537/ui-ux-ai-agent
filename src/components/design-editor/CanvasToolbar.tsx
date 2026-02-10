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
      <div className="flex items-center gap-1 bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-full p-1.5 shadow-2xl ring-1 ring-black/50">
        
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
           <ToolbarButton 
            active={activeTool === 'inspect'} 
            onClick={() => onToolChange('inspect')}
            icon={<ScanEye className="w-4 h-4" />}
            label="Inspect Element (I)"
          />
        </div>

        {/* History Section */}
        <div className="flex items-center gap-1 px-2 border-r border-white/10">
          <ToolbarButton 
            onClick={onUndo}
            disabled={!canUndo}
            icon={<Undo2 className="w-4 h-4" />}
            label="Undo (Cmd+Z)"
          />
          <ToolbarButton 
            onClick={onRedo}
            disabled={!canRedo}
            icon={<Redo2 className="w-4 h-4" />}
            label="Redo (Cmd+Shift+Z)"
          />
        </div>

        {/* Zoom Section */}
        <div className="flex items-center gap-1 pl-2">
          <ToolbarButton 
            onClick={onZoomOut}
            icon={<Minus className="w-4 h-4" />}
            label="Zoom Out"
          />
          <div className="w-12 text-center text-xs font-semibold text-zinc-400 tabular-nums select-none">
            {Math.round(zoomLevel * 100)}%
          </div>
          <ToolbarButton 
            onClick={onZoomIn}
            icon={<Plus className="w-4 h-4" />}
            label="Zoom In"
          />
        </div>

        {/* Extra Features Section (optional, if room) */}
        {(onPreview || onTheme) && (
             <div className="flex items-center gap-1 pl-2 ml-2 border-l border-white/10">
                 {onPreview && (
                     <ToolbarButton 
                        onClick={onPreview}
                        icon={<Play className="w-3.5 h-3.5 fill-current" />}
                        label="Preview"
                        className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                     />
                 )}
                  {onTheme && (
                     <ToolbarButton 
                        onClick={onTheme}
                        icon={<Palette className="w-4 h-4" />}
                        label="Theme"
                     />
                 )}
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
        "w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50",
        active 
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
          : "text-zinc-400 hover:text-zinc-100 hover:bg-white/10",
        props.disabled && "opacity-30 cursor-not-allowed hover:bg-transparent hover:text-zinc-400",
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );
}
