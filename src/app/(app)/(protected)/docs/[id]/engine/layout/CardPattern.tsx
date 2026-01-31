import React, { memo } from "react";
import * as Patterns from "@/app/(app)/(protected)/docs/[id]/editor/patterns";

interface CardPatternProps {
  pattern?: string;
  primary: string;
  secondary?: string[];
  opacity?: number;
}

export const CardPattern = memo(function CardPattern({
  pattern,
  primary,
  secondary,
  opacity = 1,
}: CardPatternProps) {
  // If no pattern is selected, don't render anything
  if (!pattern || pattern === "none") return null;

  const renderSpecificPattern = () => {
    switch (pattern) {
      case "gaussian":
        return (
          <Patterns.Gaussian
            primary={primary}
            secondary={secondary}
          />
        );
      case "fractal":
        return (
          <Patterns.Fractal
            primary={primary}
            secondary={secondary}
          />
        );
      case "fluid":
        return (
          <Patterns.Fluid
            primary={primary}
            secondary={secondary}
          />
        );
      case "prism":
        return (
          <Patterns.Prism
            primary={primary}
            secondary={secondary}
          />
        );
      case "beams":
        return (
          <Patterns.Beams
            primary={primary}
            secondary={secondary}
          />
        );
      case "aurora":
        return (
          <Patterns.Aurora
            primary={primary}
            secondary={secondary}
          />
        );
      case "nebula":
        return (
          <Patterns.Nebula
            primary={primary}
            secondary={secondary}
          />
        );
      case "ether":
        return (
          <Patterns.Ether
            primary={primary}
            secondary={secondary}
          />
        );
      case "lumina":
        return (
          <Patterns.Lumina
            primary={primary}
            secondary={secondary}
          />
        );
      case "horizon":
        return (
          <Patterns.Horizon
            primary={primary}
            secondary={secondary}
          />
        );
      case "pulse":
        return (
          <Patterns.Pulse
            primary={primary}
            secondary={secondary}
          />
        );
      case "vortex":
        return (
          <Patterns.Vortex
            primary={primary}
            secondary={secondary}
          />
        );
      case "echo":
        return (
          <Patterns.Echo
            primary={primary}
            secondary={secondary}
          />
        );
      case "apex":
        return (
          <Patterns.Apex
            primary={primary}
            secondary={secondary}
          />
        );
      case "arch":
        return (
          <Patterns.Arch
            primary={primary}
            secondary={secondary}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{ opacity }}
      className="absolute inset-0"
    >
      {renderSpecificPattern()}
    </div>
  );
});
