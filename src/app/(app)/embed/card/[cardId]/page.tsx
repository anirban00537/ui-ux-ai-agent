"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { CONFIG } from "@/lib/config";
import { GoogleFontsLoader } from "@/components/GoogleFontsLoader";
import { CardCanvas } from "@/app/(app)/(protected)/docs/[id]/engine/layout/CardCanvas";
import { EditorThemeProvider } from "@/app/(app)/(protected)/docs/[id]/engine/theme/EditorThemeProvider";
import { convertApiCardToRedux } from "@/lib/editor/adapters";
import { Card, Theme, DEFAULT_THEME } from "@/store/slices/cardsSlice";
import { Provider } from "react-redux";
import { store } from "@/store";

interface ExportCardData {
  card: any;
  theme: Theme;
}

/**
 * Export-optimized card embed page.
 * This route is used by the Puppeteer screenshot service to capture cards.
 * It fetches card data directly using an internal API key for authentication.
 */
const ExportCardContent = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const cardId = params?.cardId as string;
  const docId = searchParams.get("docId");
  const exportKey = searchParams.get("exportKey");

  const [cardData, setCardData] = useState<ExportCardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCardData = async () => {
      if (!cardId || !docId || !exportKey) {
        setError("Missing required parameters");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch card data from internal export API
        const response = await fetch(
          `${CONFIG.API_URL}/docs/${docId}/cards/${cardId}/export?exportKey=${exportKey}`,
          {
            headers: {
              "Content-Type": "application/json",
              apisecretkeycheck: CONFIG.API_SECRET,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch card: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          setCardData(result.data);
        } else {
          throw new Error(result.message || "Failed to fetch card data");
        }
      } catch (err) {
        console.error("Export card fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to load card");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCardData();
  }, [cardId, docId, exportKey]);

  if (isLoading) {
    return (
      <div 
        id="export-loading" 
        className="w-screen h-screen flex items-center justify-center bg-gray-900"
      >
        <div className="text-white text-lg">Loading card...</div>
      </div>
    );
  }

  if (error || !cardData) {
    return (
      <div 
        id="export-error" 
        className="w-screen h-screen flex items-center justify-center bg-red-900"
      >
        <div className="text-white text-lg">{error || "No card data"}</div>
      </div>
    );
  }

  // Convert the API card format to Redux format
  const reduxCard = convertApiCardToRedux(cardData.card);
  // Merge with defaults for a complete theme
  const theme: Theme = { ...DEFAULT_THEME, ...(cardData.theme || {}) };

  return (
    <EditorThemeProvider themeOverride={theme}>
      <ExportCardRenderer card={reduxCard} theme={theme} />
    </EditorThemeProvider>
  );
};

interface ExportCardRendererProps {
  card: Card;
  theme: Theme;
}

const ExportCardRenderer = ({ card, theme }: ExportCardRendererProps) => {
  const isDark = theme.themeType === "dark";

  return (
    <>
      <GoogleFontsLoader />
      <div
        id="export-card-container"
        className="export-ready w-screen h-screen overflow-hidden"
        style={{
          backgroundColor: theme.pageBackground,
          fontFamily: `${theme.fontFamily || 'Inter'}, sans-serif`,
        }}
      >
        {/* Mesh gradient background for doc mode */}
        <div
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 30% 20%, ${theme.primary}${isDark ? '12' : '08'} 0%, transparent 50%)`,
          }}
        />
        <div
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 70% 80%, ${theme.secondaryColors?.[0] || theme.primary}${isDark ? '08' : '05'} 0%, transparent 50%)`,
          }}
        />

        <div className="w-full h-full flex items-center justify-center">
          <div className="w-full h-full">
            <CardCanvas
              card={card}
              onUpdateBlock={() => {}}
              onDeleteRow={() => {}}
              onAddColumn={() => {}}
              onAddRowAtTop={() => {}}
              onAddRowAtBottom={() => {}}
              onUpdateColumnWidths={() => {}}
              enableDragHints={false}
              readOnly={true}
              fullWidth={true}
            />
          </div>
        </div>
      </div>
    </>
  );
};

// Wrapper that provides Redux store (needed for some internal components)
const ExportCardPage = () => {
  return (
    <Provider store={store}>
      <ExportCardContent />
    </Provider>
  );
};

export default ExportCardPage;
