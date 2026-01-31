"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";


interface BlockErrorBoundaryProps {
  children: ReactNode;
  blockId: string;
  blockType?: string;
  onReset?: () => void;
}

interface BlockErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary component for block rendering.
 * Catches JavaScript errors in block components and displays a fallback UI.
 */
export class BlockErrorBoundary extends Component<
  BlockErrorBoundaryProps,
  BlockErrorBoundaryState
> {
  constructor(props: BlockErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<BlockErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log error details for debugging
    console.error(
      `BlockErrorBoundary caught an error in block "${this.props.blockId}" (type: ${this.props.blockType || "unknown"}):`,
      error,
      errorInfo
    );
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Return transparent blank space instead of error UI for better UX
      // Error is still logged to console for debugging
      return <div className="w-full h-full min-h-[40px]" />;
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap a component with BlockErrorBoundary
 */
export function withBlockErrorBoundary<P extends { block: { id: string; type?: string } }>(
  WrappedComponent: React.ComponentType<P>,
  onReset?: () => void
): React.FC<P> {
  const ComponentWithErrorBoundary: React.FC<P> = (props) => {
    return (
      <BlockErrorBoundary
        blockId={props.block.id}
        blockType={props.block.type}
        onReset={onReset}
      >
        <WrappedComponent {...props} />
      </BlockErrorBoundary>
    );
  };

  ComponentWithErrorBoundary.displayName = `withBlockErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return ComponentWithErrorBoundary;
}
