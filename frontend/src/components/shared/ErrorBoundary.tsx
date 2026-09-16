"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-background">
            <div className="mb-6 rounded-full bg-red-100 p-4 dark:bg-red-900/20">
              <IconAlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Something went wrong
            </h1>
            <p className="mb-8 max-w-md text-muted-foreground">
              We encountered an unexpected error. Don't worry, your data is safe.
              Try refreshing the page or contact support if the issue persists.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={this.handleReset} className="gap-2 px-6 h-11 rounded-xl">
                <IconRefresh size={18} />
                Refresh Page
              </Button>
            </div>
            {process.env.NODE_ENV === "development" && (
              <pre className="mt-8 max-w-full overflow-auto rounded-lg bg-muted p-4 text-left text-xs text-muted-foreground">
                {this.state.error?.toString()}
              </pre>
            )}
          </div>
        )
      );
    }

    return this.props.children;
  }
}
