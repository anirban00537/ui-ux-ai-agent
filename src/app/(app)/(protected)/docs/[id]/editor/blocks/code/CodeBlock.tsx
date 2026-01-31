import React, { useCallback, useState, memo } from "react";
import type { Block, Theme } from "@/types";
import { createCodeContent, type CodeContent } from "../definitions";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { BlockWrapper } from "./BlockWrapper";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CodeBlockProps {
  block: Block;
  onUpdate: (content: CodeContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

const languages = [
  "javascript",
  "typescript",
  "python",
  "java",
  "cpp",
  "csharp",
  "php",
  "ruby",
  "go",
  "rust",
  "swift",
  "kotlin",
  "html",
  "css",
  "json",
  "xml",
  "sql",
  "bash",
  "plaintext",
];

import { CommonCard } from "../CommonCard";

const highlightCode = (code: string) => {
  if (!code) return null;
  // Regex to split code into tokens: strings, comments, numbers, keywords, brackets
  const tokens = code.split(
    /(\/\/.*|\/\*[\s\S]*?\*\/|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\b\d+\b|\b(?:const|let|var|function|return|if|else|for|while|import|export|from|class|extends|interface|type|implements|public|private|protected|static|new|super|this|async|await|try|catch|finally|throw|void|null|true|false|undefined|default|switch|case|break)\b|[(){}\[\]<>,.;:])/g
  );

  return tokens.map((token, i) => {
    if (!token) return null;
    
    // Comments
    if (token.startsWith("//") || token.startsWith("/*")) 
      return <span key={i} style={{color: "#6A737D"}}>{token}</span>;
    
    // Strings
    if (token.startsWith('"') || token.startsWith("'") || token.startsWith("`")) 
      return <span key={i} style={{color: "#A5D6FF"}}>{token}</span>;
      
    // Numbers
    if (/^\d+$/.test(token)) 
      return <span key={i} style={{color: "#79C0FF"}}>{token}</span>;
      
    // Keywords 1 (Control flow/Declarations)
    if (/^(const|let|var|function|return|import|export|from|class|extends|interface|type|async|await|new|this|super|try|catch|finally|throw|default|switch|case|break)$/.test(token)) 
      return <span key={i} style={{color: "#FF7B72"}}>{token}</span>;
      
    // Keywords 2 (Logic/Types)
    if (/^(if|else|for|while|void|null|true|false|undefined|public|private|protected|static)$/.test(token)) 
      return <span key={i} style={{color: "#79C0FF"}}>{token}</span>;

    // Brackets/Punctuation
    if (/^[(){}\[\]<>,.;:]$/.test(token))
       return <span key={i} style={{color: "#C9D1D9"}}>{token}</span>;

    // Default (Identifiers/Whitespace)
    return <span key={i} style={{color: "#E6EDF3"}}>{token}</span>;
  });
};

export const CodeBlock = memo(function CodeBlock({
  block,
  onUpdate,
  theme,
}: CodeBlockProps) {
  const content = (block.content as CodeContent) ?? createCodeContent();
  const { language, code, showLineNumbers, theme: codeTheme } = content;
  const [copied, setCopied] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [tempLanguage, setTempLanguage] = useState(language);
  const [tempShowLineNumbers, setTempShowLineNumbers] =
    useState(showLineNumbers);
  const [tempCodeTheme, setTempCodeTheme] = useState(codeTheme);

  const handleCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onUpdate({ ...content, code: e.target.value });
    },
    [content, onUpdate]
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleOpenEdit = () => {
    setTempLanguage(language);
    setTempShowLineNumbers(showLineNumbers);
    setTempCodeTheme(codeTheme);
    setIsEditOpen(true);
  };

  const handleSave = () => {
    onUpdate({
      ...content,
      language: tempLanguage,
      showLineNumbers: tempShowLineNumbers,
      theme: tempCodeTheme,
    });
    setIsEditOpen(false);
  };

  const lines = code.split("\n");
  const panelDark = theme.themeType === "dark";

  return (
    <BlockWrapper onEdit={handleOpenEdit} theme={theme}>
      <div className="p-3">
      <div
        className="relative w-full overflow-hidden text-left h-full flex flex-col group transition-all duration-500"
        onClick={handleOpenEdit}
        style={{ 
          borderRadius: "16px",
          backgroundColor: "#09090b", // Always dark terminal
          border: `1px solid ${theme.primary}30`,
          boxShadow: `0 0 0 1px ${theme.primary}10, 0 8px 32px -8px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Decorative Grid Background */}
         <div 
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
                backgroundImage: `linear-gradient(${theme.primary} 1px, transparent 1px), linear-gradient(90deg, ${theme.primary} 1px, transparent 1px)`,
                backgroundSize: '24px 24px'
            }}
        />

        {/* Top Glow Accent */}
        <div 
          className="absolute top-0 left-0 right-0 h-[1px] opacity-40"
          style={{
            background: `linear-gradient(90deg, transparent, ${theme.primary}, transparent)`
          }}
        />

        {/* Header */}
        <div
          className="flex items-center justify-between px-3 py-1.5 relative z-10 select-none group/header"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.02)"
          }}
        >
          {/* Mac-style Window Controls */}
          <div className="flex items-center gap-2 mr-4">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] opacity-80" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] opacity-80" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F] opacity-80" />
          </div>

          <div
            className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 absolute left-1/2 -translate-x-1/2"
          >
            {language}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-white/10 active:scale-95 text-white/60 hover:text-white"
          >
            {copied ? (
              <>
                <IconCheck size={12} strokeWidth={3} className="text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <IconCopy size={12} strokeWidth={2.5} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Code Area */}
        <div className="relative overflow-x-auto flex-1 custom-scrollbar-dark z-10">
          <div className="flex h-full min-h-[140px]">
            {showLineNumbers && (
              <div
                className="py-3 px-2 text-right select-none font-mono text-[13px] border-r border-[#ffffff08]"
                style={{
                  backgroundColor: "rgba(0,0,0,0.2)",
                  color: "rgba(255,255,255,0.2)",
                }}
              >
                {lines.map((_, i) => (
                  <div key={i} className="leading-7">
                    {i + 1}
                  </div>
                ))}
              </div>
            )}
            
            <div className="relative flex-1 grid place-items-stretch">
              {/* Tokenized Layer (Syntax Highlighting) */}
              <pre
                className="col-start-1 row-start-1 m-0 px-3 py-3 font-mono text-[13px] leading-7 whitespace-pre overflow-hidden pointer-events-none"
                style={{
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                }}
              >
                {highlightCode(code)}
              </pre>

              {/* Editing Layer (Transparent Text) */}
              <textarea
                value={code}
                onChange={handleCodeChange}
                className="col-start-1 row-start-1 w-full h-full px-3 py-3 font-mono text-[13px] leading-7 resize-none outline-none border-none bg-transparent text-transparent caret-white selection:bg-white/20"
                style={{
                  minHeight: "100%",
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                }}
                rows={Math.max(lines.length, 5)}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
              />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          className="sm:max-w-[400px]"
          style={{
            backgroundColor: panelDark
              ? "rgba(20,20,24,0.98)"
              : "rgba(255,255,255,0.98)",
            backdropFilter: "blur(20px)",
            border: "none",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: panelDark ? "#fff" : "#000" }}>
              Code Settings
            </DialogTitle>
            <DialogDescription
              style={{
                color: panelDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
              }}
            >
              Customize code block appearance.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label style={{ color: panelDark ? "#fff" : "#000" }}>
                Language
              </Label>
              <Select value={tempLanguage} onValueChange={setTempLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label style={{ color: panelDark ? "#fff" : "#000" }}>
                Line Numbers
              </Label>
              <Switch
                checked={tempShowLineNumbers}
                onCheckedChange={setTempShowLineNumbers}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label style={{ color: panelDark ? "#fff" : "#000" }}>
                Dark Theme
              </Label>
              <Switch
                checked={tempCodeTheme === "dark"}
                onCheckedChange={(checked) =>
                  setTempCodeTheme(checked ? "dark" : "light")
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              style={{ backgroundColor: theme.primary }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </BlockWrapper>
  );
});
