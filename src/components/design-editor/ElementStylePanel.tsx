import React, { useState, useEffect } from "react";
import { 
  X, 
  Box, 
  Type, 
  Palette, 
  Trash2, 
  ArrowRight,
  Monitor,
  AlignLeft,
  AlignCenter,
  AlignRight, 
  MoveHorizontal,
  MoveVertical
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ColorPickerInput } from "./ColorPickerInput";

interface ElementStylePanelProps {
  element: {
    id: string;
    tagName: string;
    innerText: string;
    styles: any;
  };
  onUpdate: (id: string, styles: any, textContent?: string) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

type Tab = 'spacing' | 'typography' | 'appearance' | null;

export function ElementStylePanel({ element, onUpdate, onClose, position }: ElementStylePanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('appearance');
  const [styles, setStyles] = useState(element.styles);

  useEffect(() => {
    setStyles(element.styles);
  }, [element]);

  const handleChange = (key: string, value: string) => {
    const newStyles = { ...styles, [key]: value };
    setStyles(newStyles);
    onUpdate(element.id, { [key]: value });
  };

  const currentTabContent = () => {
    switch (activeTab) {
      case 'spacing':
        return <SpacingEditor styles={styles} onChange={handleChange} />;
      case 'typography':
        return <TypographyEditor styles={styles} onChange={handleChange} text={element.innerText} onTextChange={(val) => onUpdate(element.id, {}, val)} />;
      case 'appearance':
        return <AppearanceEditor styles={styles} onChange={handleChange} />;
      default:
        return null;
    }
  };

  return (
    <div 
      className="fixed z-[99999] flex flex-col gap-2 items-start"
      style={{ top: position.top, left: position.left }}
      onMouseDown={e => e.stopPropagation()}
    >
      {/* Main Panel Popover */}
      {activeTab && (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl p-4 w-[280px] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 mb-2">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                <span className="text-xs font-bold text-zinc-400 flex items-center gap-2">
                    {activeTab === 'spacing' && <Box className="w-3.5 h-3.5" />}
                    {activeTab === 'typography' && <Type className="w-3.5 h-3.5" />}
                    {activeTab === 'appearance' && <Palette className="w-3.5 h-3.5" />}
                    <span className="capitalize">{activeTab}</span>
                </span>
                <button onClick={() => setActiveTab(null)} className="text-zinc-500 hover:text-white"><X className="w-3.5 h-3.5" /></button>
            </div>
            {currentTabContent()}
        </div>
      )}

      {/* Floating Toolbar */}
      <div className="flex items-center gap-1 p-1.5 bg-[#1a1a1a] border border-white/10 rounded-full shadow-2xl backdrop-blur-xl">
        <button className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
            <ArrowRight className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-white/10 mx-1" />
        
        <ToolbarButton 
            active={activeTab === 'spacing'} 
            onClick={() => setActiveTab(activeTab === 'spacing' ? null : 'spacing')}
            icon={<Box className="w-4 h-4" />}
            label="Spacing"
        />
        <ToolbarButton 
            active={activeTab === 'typography'} 
            onClick={() => setActiveTab(activeTab === 'typography' ? null : 'typography')}
            icon={<Type className="w-4 h-4" />}
            label="Typography"
        />
        <ToolbarButton 
            active={activeTab === 'appearance'} 
            onClick={() => setActiveTab(activeTab === 'appearance' ? null : 'appearance')}
            icon={<Palette className="w-4 h-4" />}
            label="Appearance"
        />
        
        <div className="w-px h-4 bg-white/10 mx-1" />
        
        <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
            <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ToolbarButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            title={label}
            className={cn(
                "w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200",
                active ? "bg-white text-black shadow-lg shadow-white/10" : "text-zinc-400 hover:text-white hover:bg-white/10"
            )}
        >
            {icon}
        </button>
    )
}

// --- Helper for Arrow Keys ---
const onArrowKey = (e: React.KeyboardEvent, value: string, onUpdate: (val: string) => void) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const num = parseInt(value?.toString().replace(/[^0-9-]/g, '')) || 0;
        const step = e.shiftKey ? 10 : 1;
        const next = e.key === 'ArrowUp' ? num + step : num - step;
        onUpdate(next.toString());
    }
};

// --- Sub-Editors ---

function SpacingEditor({ styles, onChange }: { styles: any, onChange: (k: string, v: string) => void }) {
    const [mode, setMode] = useState<'padding' | 'margin'>('padding');

    const getValue = (side: string) => {
        const key = mode + side; // paddingLeft
        if (styles[key]) return styles[key].replace('px', '');
        
        const shorthand = styles[mode]; 
        if (!shorthand) return '0';
        return shorthand.split(' ')[0].replace('px', '');
    };

    const updateValue = (side: string, val: string) => {
        const key = mode + side; 
        onChange(key, val + 'px');
    };

    return (
        <div className="space-y-4">
            <div className="flex bg-black/20 p-1 rounded-lg border border-white/5">
                <button 
                    onClick={() => setMode('padding')}
                    className={cn("flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all", mode === 'padding' ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300")}
                >
                    Padding
                </button>
                <button 
                    onClick={() => setMode('margin')}
                    className={cn("flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all", mode === 'margin' ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300")}
                >
                    Margin
                </button>
            </div>

            {/* Visual Box Model */}
            <div className="relative h-40 border border-dashed border-zinc-700 rounded-xl flex items-center justify-center bg-white/[0.02]">
                <span className="text-[10px] font-mono text-zinc-600 absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    {mode.toUpperCase()}
                </span>
                
                {/* Top */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <span className="text-[9px] text-zinc-500 mb-0.5">T</span>
                    <input 
                        className="w-10 bg-black/40 border border-white/10 rounded px-1 py-0.5 text-center text-xs text-white focus:border-primary/50 outline-none" 
                        value={getValue('Top')}
                        onChange={e => updateValue('Top', e.target.value)}
                        onKeyDown={e => onArrowKey(e, getValue('Top'), (val) => updateValue('Top', val))}
                    />
                </div>
                {/* Bottom */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <input 
                        className="w-10 bg-black/40 border border-white/10 rounded px-1 py-0.5 text-center text-xs text-white focus:border-primary/50 outline-none" 
                        value={getValue('Bottom')}
                        onChange={e => updateValue('Bottom', e.target.value)}
                        onKeyDown={e => onArrowKey(e, getValue('Bottom'), (val) => updateValue('Bottom', val))}
                    />
                    <span className="text-[9px] text-zinc-500 mt-0.5">B</span>
                </div>
                {/* Left */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center">
                    <span className="text-[9px] text-zinc-500 mb-0.5">L</span>
                    <input 
                        className="w-10 bg-black/40 border border-white/10 rounded px-1 py-0.5 text-center text-xs text-white focus:border-primary/50 outline-none" 
                        value={getValue('Left')}
                        onChange={e => updateValue('Left', e.target.value)}
                        onKeyDown={e => onArrowKey(e, getValue('Left'), (val) => updateValue('Left', val))}
                    />
                </div>
                {/* Right */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center">
                    <span className="text-[9px] text-zinc-500 mb-0.5">R</span>
                    <input 
                        className="w-10 bg-black/40 border border-white/10 rounded px-1 py-0.5 text-center text-xs text-white focus:border-primary/50 outline-none" 
                        value={getValue('Right')}
                        onChange={e => updateValue('Right', e.target.value)}
                        onKeyDown={e => onArrowKey(e, getValue('Right'), (val) => updateValue('Right', val))}
                    />
                </div>

                {/* Center visual */}
                <div className="w-16 h-16 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </div>
            </div>
        </div>
    );
}

function TypographyEditor({ styles, text, onChange, onTextChange }: { styles: any, text: string, onChange: (k: string, v: string) => void, onTextChange: (v: string) => void }) {
    return (
        <div className="space-y-4">
             {/* Content Input */}
             <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide">Content</label>
                <textarea 
                    value={text}
                    onChange={e => onTextChange(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary/50 outline-none min-h-[60px] resize-none"
                    placeholder="Type element content here..."
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide">Size</label>
                    <div className="relative">
                        <input 
                            value={styles.fontSize}
                            onChange={e => onChange('fontSize', e.target.value)}
                            onKeyDown={e => onArrowKey(e, styles.fontSize, (val) => onChange('fontSize', val + 'px'))}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary/50 outline-none"
                        />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide">Weight</label>
                    <select 
                        value={styles.fontWeight}
                        onChange={e => onChange('fontWeight', e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-primary/50 outline-none appearance-none"
                    >
                         {['100','200','300','400','500','600','700','800','900'].map(w => (
                             <option key={w} value={w}>{w}</option>
                         ))}
                    </select>
                </div>
            </div>

             <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide">Align</label>
                <div className="flex bg-black/20 rounded-lg border border-white/10 p-1">
                    {['left', 'center', 'right', 'justify'].map((align) => (
                        <button
                            key={align}
                            onClick={() => onChange('textAlign', align)}
                            className={cn(
                                "flex-1 flex items-center justify-center py-1.5 rounded hover:bg-white/5 transition-colors",
                                styles.textAlign === align ? "bg-white/10 text-white" : "text-zinc-500"
                            )}
                        >
                            {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                            {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                            {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                            {align === 'justify' && <MoveHorizontal className="w-3.5 h-3.5" />}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-1.5">
                 <ColorPickerInput 
                    label="Color" 
                    value={styles.color} 
                    onChange={(val) => onChange('color', val)}
                    className="w-full"
                 />
            </div>
        </div>
    );
}

function AppearanceEditor({ styles, onChange }: { styles: any, onChange: (k: string, v: string) => void }) {
    return (
        <div className="space-y-4">
             <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide">Background</label>
                  <ColorPickerInput 
                     label="" 
                     value={styles.backgroundColor} 
                     onChange={(val) => onChange('backgroundColor', val)}
                  />
            </div>

            <div className="bg-white/5 h-px w-full" />

             <div className="space-y-3">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide">Border & Radius</label>
                  <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1">
                         <label className="text-[9px] text-zinc-600">Radius</label>
                         <input 
                             value={styles.borderRadius}
                             onChange={e => onChange('borderRadius', e.target.value)}
                             onKeyDown={e => onArrowKey(e, styles.borderRadius, (val) => onChange('borderRadius', val + 'px'))}
                             className="w-full bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:border-primary/50 outline-none"
                             placeholder="0px"
                         />
                     </div>
                      <div className="space-y-1">
                         <label className="text-[9px] text-zinc-600">Width</label>
                         <input 
                             value={styles.borderWidth}
                             onChange={e => onChange('borderWidth', e.target.value)}
                             onKeyDown={e => onArrowKey(e, styles.borderWidth, (val) => onChange('borderWidth', val + 'px'))}
                             className="w-full bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:border-primary/50 outline-none"
                             placeholder="0px"
                         />
                     </div>
                  </div>
                   <ColorPickerInput 
                     label="Border Color" 
                     value={styles.borderColor} 
                     onChange={(val) => onChange('borderColor', val)}
                  />
            </div>
        </div>
    );
}
