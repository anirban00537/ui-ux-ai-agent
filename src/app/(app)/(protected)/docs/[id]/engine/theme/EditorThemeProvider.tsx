"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME, Theme } from "@/store/slices/cardsSlice";

const EditorThemeContext = createContext<Theme>(DEFAULT_THEME);

interface EditorThemeProviderProps {
  children: ReactNode;
  themeOverride?: Theme; // Allow passing theme explicitly (e.g. for previews)
}

export const EditorThemeProvider: React.FC<EditorThemeProviderProps> = ({ children, themeOverride }) => {
  const reduxTheme = useAppSelector(selectTheme);
  const theme = themeOverride || reduxTheme || DEFAULT_THEME;

  return (
    <EditorThemeContext.Provider value={theme}>
      {children}
    </EditorThemeContext.Provider>
  );
};

export const useEditorTheme = () => {
  const context = useContext(EditorThemeContext);
  if (!context) {
    // Fallback to default if used outside propvider, though typically we want to be inside
    return DEFAULT_THEME;
  }
  return context;
};
