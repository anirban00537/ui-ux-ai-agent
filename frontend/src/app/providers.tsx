"use client";

import React from "react";
import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { store } from "@/store";
import { queryClient } from "@/lib/query-client";
import { AuthProvider } from "@/components/providers/auth-provider";
import { PromptProvider } from "@/contexts/PromptContext";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { CONFIG } from "@/lib/config";
import { usePlanTiers } from "@/hooks/use-subscription";

type ProvidersProps = {
  children: React.ReactNode;
};

// Component that prefetches plan tiers globally
const PlanTiersPreloader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // This hook call ensures plan tiers are fetched and cached globally
  // The data is shared across all components via React Query cache
  usePlanTiers();
  return <>{children}</>;
};

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const content = (
    <Provider store={store}>
      <ErrorBoundary>
        <AuthProvider>
          <PromptProvider>
            <PlanTiersPreloader>
              <div className="h-full">{children}</div>
              <Toaster richColors position="top-right" />
            </PlanTiersPreloader>
          </PromptProvider>
        </AuthProvider>
      </ErrorBoundary>
    </Provider>
  );

  return (
    <QueryClientProvider client={queryClient}>
      {CONFIG.GOOGLE_CLIENT_ID ? (
        <GoogleOAuthProvider clientId={CONFIG.GOOGLE_CLIENT_ID}>
          {content}
        </GoogleOAuthProvider>
      ) : (
        content
      )}
    </QueryClientProvider>
  );
};

export default Providers;
