import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Box, 
  Type, 
  Palette, 
  Trash2, 
  Layout,
  AlignLeft,
  AlignCenter,
  AlignRight, 
  AlignJustify,
  MoveHorizontal,
  MoveVertical,
  Maximize2,
  Minimize2,
  Grid,
  Layers,
  Check,
  ChevronDown,
  Sparkles,
  ChevronRight,
  Loader2
} from "lucide-react";
import { updateElementWithAi } from "@/services/designs";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { ColorPickerInput } from "./ColorPickerInput";
import { motion, AnimatePresence } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";

interface ElementStylePanelProps {
  element: {
    id: string;
    tagName: string;
    innerText: string;
    styles: any;
    outerHTML?: string;
  };
  onUpdate: (id: string, styles: any, textContent?: string, outerHTML?: string) => void;
  onClose: () => void;
  onDelete?: () => void;
  position: { top: number; left: number };
}

type Tab = 'layout' | 'spacing' | 'typography' | 'appearance';

export function ElementStylePanel({ element, onUpdate, onClose, onDelete, position }: ElementStylePanelProps) {
  const [activeTab, setActiveTab] = useState<Tab | null>(null);
  const [styles, setStyles] = useState(element.styles);
  const [prompt, setPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const params = useParams();

  useEffect(() => {
    setStyles(element.styles);
  }, [element]);

  // Focus input on mount if no tab active
  useEffect(() => {
    if (!activeTab && inputRef.current) {
        inputRef.current.focus();
    }
  }, [activeTab]);

  const handleChange = (key: string, value: string) => {
    const newStyles = { ...styles, [key]: value };
    setStyles(newStyles);
    onUpdate(element.id, { [key]: value });
  };

  const toggleTab = (tab: Tab) => {
      setActiveTab(activeTab === tab ? null : tab);
  };

  const handleAiSubmit = async () => {
      if (!prompt.trim() || !element.outerHTML) return;
      
      setIsAiLoading(true);
      try {
          const designId = params.id as string;
          const result = await updateElementWithAi(designId, {
              prompt: prompt,
              elementHtml: element.outerHTML
          });

          if (result.success && result.data.html) {
             // Pass updated HTML as outerHTML
             onUpdate(element.id, {}, undefined, result.data.html);
             setPrompt("");
             toast.success("Element updated successfully");
          }
      } catch (error) {
          console.error("AI Update failed:", error);
          toast.error("Failed to update element");
      } finally {
          setIsAiLoading(false);
      }
  };

  return (
    <Tooltip.Provider>
        <div 
            className="fixed z-[1000] flex flex-col items-start gap-3 pointer-events-auto"
            style={{ 
                top: position.top, 
                left: position.left,
            }}
            data-style-panel="true"
        >
            {/* COMPACT TOOLBAR */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 5 }}
                className={cn(
                    "flex items-center gap-1 p-1.5 rounded-full bg-[#09090b]/90 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] ring-1 ring-white/5",
                    "min-w-[320px]"
                )}
            >
                {/* AI Input Section */}
                <div className="flex-1 flex items-center gap-2 pl-3 pr-2 group/input">
                    <Sparkles className={cn("w-4 h-4 text-purple-400 group-focus-within/input:text-purple-300 transition-colors", isAiLoading && "animate-spin")} />
                    <input 
                        ref={inputRef}
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={isAiLoading ? "Generating..." : "Edit with AI..."}
                        disabled={isAiLoading}
                        className="w-full bg-transparent border-none outline-none text-sm text-zinc-200 placeholder:text-zinc-500 font-medium h-8 min-w-[120px]"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAiSubmit();
                        }}
                    />
                    {prompt.length > 0 && (
                        <button 
                            onClick={handleAiSubmit}
                            className="p-1.5 rounded-full bg-purple-500/20 text-purple-300 hover:bg-purple-500 hover:text-white transition-all animate-in zoom-in duration-200"
                        >
                            {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                    )}
                </div>

                {/* Divider */}
                <div className="w-px h-5 bg-white/10 mx-1" />

                {/* Manual Tools */}
                <div className="flex items-center gap-0.5">
                    <ToolButton 
                        active={activeTab === 'layout'} 
                        onClick={() => toggleTab('layout')} 
                        icon={<Box className="w-4 h-4" />} 
                        label="Layout" 
                    />
                    <ToolButton 
                        active={activeTab === 'typography'} 
                        onClick={() => toggleTab('typography')} 
                        icon={<Type className="w-4 h-4" />} 
                        label="Text" 
                    />
                    <ToolButton 
                        active={activeTab === 'appearance'} 
                        onClick={() => toggleTab('appearance')} 
                        icon={<Palette className="w-4 h-4" />} 
                        label="Style" 
                    />
                </div>

                {/* Divider */}
                <div className="w-px h-5 bg-white/10 mx-1" />

                {/* Actions */}
                <div className="flex items-center px-1">
                    <button 
                        onClick={onDelete}
                        className="p-2 rounded-full hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors group"
                        title="Delete Element"
                    >
                        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </motion.div>

            {/* EXPANDABLE DETAIL PANEL */}
            <AnimatePresence>
                {activeTab && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="w-[340px] overflow-hidden"
                    >
                        <div className="bg-[#09090b]/95 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-black/50 p-4 pt-3 mt-1">
                             <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                                    {activeTab === 'layout' && <><Box className="w-3 h-3"/> Layout Properties</>}
                                    {activeTab === 'typography' && <><Type className="w-3 h-3"/> Typography</>}
                                    {activeTab === 'appearance' && <><Palette className="w-3 h-3"/> Appearance</>}
                                </span>
                                <button 
                                    onClick={() => setActiveTab(null)}
                                    className="p-1 hover:bg-white/10 rounded-full text-zinc-500 hover:text-white transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                             </div>

                             <div className="custom-scrollbar max-h-[60vh] overflow-y-auto pr-1">
                                {activeTab === 'layout' && (
                                    <>
                                        <LayoutEditor styles={styles} onChange={handleChange} />
                                        <div className="h-4" />
                                        <SpacingEditor styles={styles} onChange={handleChange} />
                                    </>
                                )}
                                {activeTab === 'typography' && <TypographyEditor styles={styles} onChange={handleChange} />}
                                {activeTab === 'appearance' && <AppearanceEditor styles={styles} onChange={handleChange} tagName={element.tagName} />}
                             </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
        
        {/* Helper to show tag name above the bar */}
        <div 
            className="fixed pointer-events-none z-[999]"
            style={{ 
                top: position.top - 28, 
                left: position.left,
            }}
        >
            <div className="px-2 py-0.5 rounded-full bg-purple-500 text-white text-[10px] font-bold font-mono tracking-wide shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-1">
                <span>{element.tagName}</span>
                <span className="opacity-50 font-normal">#{element.id.slice(0,4)}</span>
            </div>
        </div>

        <GlobalStyles />
    </Tooltip.Provider>
  );
}

// Helper Components
function ToolButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <Tooltip.Root>
            <Tooltip.Trigger asChild>
                <button
                    onClick={onClick}
                    className={cn(
                        "w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200",
                        active 
                            ? "bg-white text-black shadow-lg shadow-white/10 scale-105" 
                            : "text-zinc-400 hover:text-white hover:bg-white/10"
                    )}
                >
                    {icon}
                </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
                <Tooltip.Content 
                    className="z-[10001] bg-black border border-white/20 text-xs px-2 py-1 rounded-md text-white font-medium animate-in fade-in zoom-in-95 duration-100"
                    side="top"
                    sideOffset={5}
                >
                    {label}
                </Tooltip.Content>
            </Tooltip.Portal>
        </Tooltip.Root>
    );
}

// ----------------------------------------------------------------------------
// HELPER COMPONENTS
// ----------------------------------------------------------------------------

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <Tooltip.Root delayDuration={300}>
            <Tooltip.Trigger asChild>
                <button
                    onClick={onClick}
                    className={cn(
                        "flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all duration-200 gap-1",
                        active ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                    )}
                >
                    {icon}
                    <span className="text-[9px] font-medium tracking-wide uppercase">{label}</span>
                </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
                <Tooltip.Content 
                    className="z-[10001] bg-zinc-900 border border-white/10 text-xs px-2 py-1 rounded-md text-zinc-300 animate-in fade-in zoom-in-95 duration-100"
                    side="bottom"
                    sideOffset={5}
                >
                    {label}
                    <Tooltip.Arrow className="fill-zinc-900/90" />
                </Tooltip.Content>
            </Tooltip.Portal>
        </Tooltip.Root>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2.5 flex items-center gap-2">
            {children}
            <div className="h-px bg-white/5 flex-1" />
        </h3>
    );
}

// ----------------------------------------------------------------------------
// EDITORS
// ----------------------------------------------------------------------------

function LayoutEditor({ styles, onChange }: { styles: any, onChange: (k: string, v: string) => void }) {
    return (
        <div className="space-y-5">
            <div>
                <SectionLabel>Display</SectionLabel>
                <div className="grid grid-cols-4 gap-1 p-1 bg-black/20 rounded-lg border border-white/5">
                    {[
                        { val: 'block', icon: <Box className="w-4 h-4" />, label: 'Block' },
                        { val: 'flex', icon: <Layers className="w-4 h-4" />, label: 'Flex' },
                        { val: 'grid', icon: <Grid className="w-4 h-4" />, label: 'Grid' },
                        { val: 'none', icon: <Minimize2 className="w-4 h-4" />, label: 'None' },
                    ].map(opt => (
                        <button
                            key={opt.val}
                            onClick={() => onChange('display', opt.val)}
                            className={cn(
                                "flex flex-col items-center justify-center py-2 rounded-md transition-all gap-1",
                                styles.display === opt.val ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                            )}
                            title={opt.label}
                        >
                            {opt.icon}
                        </button>
                    ))}
                </div>
            </div>

            {styles.display === 'flex' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <SectionLabel>Flex Direction</SectionLabel>
                    <div className="flex bg-black/20 p-1 rounded-lg border border-white/5 mb-4">
                        {[
                            { val: 'row', icon: <MoveHorizontal className="w-4 h-4" />, label: 'Row' },
                            { val: 'column', icon: <MoveVertical className="w-4 h-4" />, label: 'Col' },
                        ].map(opt => (
                            <button
                                key={opt.val}
                                onClick={() => onChange('flexDirection', opt.val)}
                                className={cn(
                                    "flex-1 flex items-center justify-center py-1.5 rounded-md gap-2 transition-all text-xs font-medium",
                                    styles.flexDirection === opt.val ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                                )}
                            >
                                {opt.icon}
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    <SectionLabel>Alignment</SectionLabel>
                    <div className="grid grid-cols-2 gap-3">
                         <div className="space-y-1.5">
                            <label className="text-[9px] text-zinc-500 font-medium">Justify</label>
                            <select 
                                value={styles.justifyContent}
                                onChange={e => onChange('justifyContent', e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:border-primary/50 outline-none appearance-none"
                            >
                                <option value="flex-start">Start</option>
                                <option value="center">Center</option>
                                <option value="flex-end">End</option>
                                <option value="space-between">Space Between</option>
                                <option value="space-around">Space Around</option>
                            </select>
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[9px] text-zinc-500 font-medium">Align</label>
                             <select 
                                value={styles.alignItems}
                                onChange={e => onChange('alignItems', e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:border-primary/50 outline-none appearance-none"
                            >
                                <option value="flex-start">Start</option>
                                <option value="center">Center</option>
                                <option value="flex-end">End</option>
                                <option value="stretch">Stretch</option>
                                <option value="baseline">Baseline</option>
                            </select>
                         </div>
                    </div>
                </div>
            )}

            <div>
                <SectionLabel>Size</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1 relative">
                        <label className="text-[9px] text-zinc-500 font-medium pl-1">Width</label>
                        <div className="relative">
                            <input 
                                value={styles.width}
                                onChange={e => onChange('width', e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg pl-8 pr-2 py-1.5 text-xs text-white focus:border-primary/50 outline-none font-mono"
                                placeholder="auto"
                            />
                            <span className="absolute left-2.5 top-1.5 text-[10px] text-zinc-600 font-bold">W</span>
                        </div>
                     </div>
                     <div className="space-y-1 relative">
                        <label className="text-[9px] text-zinc-500 font-medium pl-1">Height</label>
                        <div className="relative">
                            <input 
                                value={styles.height}
                                onChange={e => onChange('height', e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg pl-8 pr-2 py-1.5 text-xs text-white focus:border-primary/50 outline-none font-mono"
                                placeholder="auto"
                            />
                            <span className="absolute left-2.5 top-1.5 text-[10px] text-zinc-600 font-bold">H</span>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
}

function SpacingEditor({ styles, onChange }: { styles: any, onChange: (k: string, v: string) => void }) {
    const getValue = (mode: string, side: string) => {
        const key = mode + side; 
        if (styles[key]) return styles[key].replace('px', '');
        return '';
    };

    const updateValue = (mode: string, side: string, val: string) => {
        onChange(mode + side, val ? val + 'px' : '');
    };

    return (
        <div className="space-y-5">
            <div className="relative h-48 border border-white/5 bg-white/[0.02] rounded-xl flex items-center justify-center">
                {/* MARGIN LABEL */}
                <span className="absolute top-1 left-2 text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Margin</span>
                
                {/* Margin Inputs */}
                <input 
                    className="absolute top-2 left-1/2 -translate-x-1/2 w-8 bg-transparent text-center text-[10px] text-zinc-400 focus:text-white outline-none placeholder:text-zinc-800" 
                    placeholder="-"
                    value={getValue('margin', 'Top')}
                    onChange={e => updateValue('margin', 'Top', e.target.value)}
                />
                <input 
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 bg-transparent text-center text-[10px] text-zinc-400 focus:text-white outline-none placeholder:text-zinc-800" 
                    placeholder="-"
                    value={getValue('margin', 'Bottom')}
                    onChange={e => updateValue('margin', 'Bottom', e.target.value)}
                />
                <input 
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 bg-transparent text-center text-[10px] text-zinc-400 focus:text-white outline-none placeholder:text-zinc-800" 
                    placeholder="-"
                    value={getValue('margin', 'Left')}
                    onChange={e => updateValue('margin', 'Left', e.target.value)}
                />
                <input 
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 bg-transparent text-center text-[10px] text-zinc-400 focus:text-white outline-none placeholder:text-zinc-800" 
                    placeholder="-"
                    value={getValue('margin', 'Right')}
                    onChange={e => updateValue('margin', 'Right', e.target.value)}
                />

                {/* Padding Box */}
                <div className="w-[65%] h-[60%] border border-dashed border-primary/20 bg-primary/[0.02] rounded-lg relative flex items-center justify-center">
                    <span className="absolute top-1 left-2 text-[9px] text-primary/40 font-bold uppercase tracking-widest">Padding</span>
                    
                    {/* Padding Inputs */}
                    <input 
                        className="absolute top-3 left-1/2 -translate-x-1/2 w-8 bg-transparent text-center text-[10px] text-primary focus:text-white outline-none placeholder:text-primary/20" 
                        placeholder="-"
                        value={getValue('padding', 'Top')}
                        onChange={e => updateValue('padding', 'Top', e.target.value)}
                    />
                    <input 
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 w-8 bg-transparent text-center text-[10px] text-primary focus:text-white outline-none placeholder:text-primary/20" 
                        placeholder="-"
                        value={getValue('padding', 'Bottom')}
                        onChange={e => updateValue('padding', 'Bottom', e.target.value)}
                    />
                    <input 
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 bg-transparent text-center text-[10px] text-primary focus:text-white outline-none placeholder:text-primary/20" 
                        placeholder="-"
                        value={getValue('padding', 'Left')}
                        onChange={e => updateValue('padding', 'Left', e.target.value)}
                    />
                    <input 
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 bg-transparent text-center text-[10px] text-primary focus:text-white outline-none placeholder:text-primary/20" 
                        placeholder="-"
                        value={getValue('padding', 'Right')}
                        onChange={e => updateValue('padding', 'Right', e.target.value)}
                    />

                    {/* Content Box */}
                    <div className="w-[40%] h-[40%] bg-zinc-800 rounded border border-zinc-700 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function TypographyEditor({ styles, onChange }: { styles: any, onChange: (k: string, v: string) => void }) {
    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <SectionLabel>Font</SectionLabel>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-[9px] text-zinc-500 font-medium ml-1">Size</label>
                        <div className="relative">
                            <input 
                                value={styles.fontSize}
                                onChange={e => onChange('fontSize', e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg pl-3 pr-8 py-2 text-xs text-white focus:border-primary/50 outline-none"
                            />
                            <span className="absolute right-3 top-2 text-[10px] text-zinc-600 select-none">px</span>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] text-zinc-500 font-medium ml-1">Weight</label>
                        <div className="relative">
                            <select 
                                value={styles.fontWeight}
                                onChange={e => onChange('fontWeight', e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg pl-3 pr-4 py-2 text-xs text-white focus:border-primary/50 outline-none appearance-none"
                            >
                                <option value="100">Thin</option>
                                <option value="300">Light</option>
                                <option value="400">Regular</option>
                                <option value="500">Medium</option>
                                <option value="600">Semibold</option>
                                <option value="700">Bold</option>
                                <option value="800">Extra Bold</option>
                                <option value="900">Black</option>
                            </select>
                            <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-3 top-2.5 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <SectionLabel>Alignment</SectionLabel>
                <div className="flex bg-black/20 rounded-lg border border-white/10 p-1">
                    {[
                        { val: 'left', icon: <AlignLeft className="w-4 h-4" /> },
                        { val: 'center', icon: <AlignCenter className="w-4 h-4" /> },
                        { val: 'right', icon: <AlignRight className="w-4 h-4" /> },
                        { val: 'justify', icon: <AlignJustify className="w-4 h-4" /> },
                    ].map((opt) => (
                        <button
                            key={opt.val}
                            onClick={() => onChange('textAlign', opt.val)}
                            className={cn(
                                "flex-1 flex items-center justify-center py-2 rounded-md transition-all",
                                styles.textAlign === opt.val ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            {opt.icon}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <SectionLabel>Color</SectionLabel>
                <ColorPickerInput 
                    label="Text Color" 
                    value={styles.color} 
                    onChange={(val) => onChange('color', val)}
                    className="w-full"
                />
            </div>
        </div>
    );
}

const SVG_TAGS = ['svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse', 'g'];

function AppearanceEditor({ styles, onChange, tagName }: { styles: any, onChange: (k: string, v: string) => void, tagName: string }) {
    const isSvg = SVG_TAGS.includes(tagName);

    return (
        <div className="space-y-6">
             {isSvg ? (
                 <>
                    <div className="space-y-4">
                        <SectionLabel>SVG Fill</SectionLabel>
                        <ColorPickerInput 
                            label="Fill Color" 
                            value={styles.fill} 
                            onChange={(val) => onChange('fill', val)}
                        />
                    </div>
                    <div className="space-y-4">
                        <SectionLabel>SVG Stroke</SectionLabel>
                        <ColorPickerInput 
                            label="Stroke Color" 
                            value={styles.stroke} 
                            onChange={(val) => onChange('stroke', val)}
                        />
                    </div>
                 </>
            ) : (
                 <div className="space-y-4">
                      <SectionLabel>Background</SectionLabel>
                      <ColorPickerInput 
                         label="Color" 
                         value={styles.backgroundColor} 
                         onChange={(val) => onChange('backgroundColor', val)}
                      />
                </div>
            )}

            <div className="border-t border-white/5 pt-2">
                  <SectionLabel>Border</SectionLabel>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                     <div className="space-y-1.5">
                         <label className="text-[9px] text-zinc-500 font-medium ml-1">Radius</label>
                         <div className="relative">
                            <input 
                                value={styles.borderRadius}
                                onChange={e => onChange('borderRadius', e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg pl-3 pr-3 py-2 text-xs text-white focus:border-primary/50 outline-none"
                                placeholder="0px"
                            />
                         </div>
                     </div>
                      <div className="space-y-1.5">
                         <label className="text-[9px] text-zinc-500 font-medium ml-1">Width</label>
                         <div className="relative">
                            <input 
                                value={styles.borderWidth}
                                onChange={e => onChange('borderWidth', e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg pl-3 pr-3 py-2 text-xs text-white focus:border-primary/50 outline-none"
                                placeholder="0px"
                            />
                         </div>
                     </div>
                  </div>
                   <ColorPickerInput 
                     label="Border Color" 
                     value={styles.borderColor} 
                     onChange={(val) => onChange('borderColor', val)}
                  />
            </div>

            <div className="border-t border-white/5 pt-2">
                 <SectionLabel>Opacity</SectionLabel>
                 <div className="relative">
                     <input 
                         type="range" 
                         min="0" 
                         max="1" 
                         step="0.01"
                         value={styles.opacity || 1}
                         onChange={e => onChange('opacity', e.target.value)}
                         className="w-full h-1.5 bg-black/40 rounded-full appearance-none cursor-pointer accent-primary"
                     />
                     <div className="flex justify-between mt-2">
                         <span className="text-[10px] text-zinc-600">0%</span>
                         <span className="text-[10px] text-zinc-400 font-mono">
                             {Math.round((parseFloat(styles.opacity || "1")) * 100)}%
                         </span>
                         <span className="text-[10px] text-zinc-600">100%</span>
                     </div>
                 </div>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------------
// STYLES
// ----------------------------------------------------------------------------

// Add custom scrollbar styles within the component for self-containment
const GlobalStyles = () => (
    <style jsx global>{`
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        height: 12px;
        width: 12px;
        border-radius: 50%;
        background: white;
        cursor: pointer;
        margin-top: 0px; 
    }
  `}</style>
);
