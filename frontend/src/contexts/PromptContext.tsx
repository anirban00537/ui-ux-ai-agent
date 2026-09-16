"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { DesignType } from "@/services/designs";

interface PromptContextType {
  prompt: string;
  type: DesignType;
  setPrompt: (prompt: string) => void;
  setType: (type: DesignType) => void;
  clearPrompt: () => void;
}

const PromptContext = createContext<PromptContextType | undefined>(undefined);

export function PromptProvider({ children }: { children: React.ReactNode }) {
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState<DesignType>("mobile_app");

  const clearPrompt = () => {
    setPrompt("");
    setType("mobile_app");
  };

  return (
    <PromptContext.Provider value={{ prompt, type, setPrompt, setType, clearPrompt }}>
      {children}
    </PromptContext.Provider>
  );
}

export function usePrompt() {
  const context = useContext(PromptContext);
  if (context === undefined) {
    throw new Error("usePrompt must be used within a PromptProvider");
  }
  return context;
}
