"use client";

import React from "react";

export function TorchLights() {
  return (
    <>
      {/* Torch Light Effect - Top */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[1200px] pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_0%,var(--color-primary)_0%,transparent_100%)] blur-[100px] opacity-[0.3]" />
        <div className="absolute inset-0 h-[800px] -top-[100px] bg-[radial-gradient(50%_50%_at_50%_0%,var(--color-primary)_0%,transparent_100%)] blur-[80px] opacity-[0.2]" />
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[800px] h-[400px] bg-[radial-gradient(50%_50%_at_50%_0%,var(--color-primary)_0%,transparent_100%)] blur-[50px] opacity-[0.4]" />
      </div>

      {/* Torch Light Effect - Bottom */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[1200px] pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_100%,var(--color-primary)_0%,transparent_100%)] blur-[100px] opacity-[0.3]" />
        <div className="absolute inset-0 h-[800px] -bottom-[100px] bg-[radial-gradient(50%_50%_at_50%_100%,var(--color-primary)_0%,transparent_100%)] blur-[80px] opacity-[0.2]" />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[800px] h-[400px] bg-[radial-gradient(50%_50%_at_50%_100%,var(--color-primary)_0%,transparent_100%)] blur-[50px] opacity-[0.4]" />
      </div>
    </>
  );
}
