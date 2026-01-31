import React from "react";
import type { Theme } from "@/types";

interface EditorBackgroundProps {
  theme: Theme;
}

export const EditorBackground: React.FC<EditorBackgroundProps> = ({ theme }) => {
  const isDark = theme.themeType === "dark";

  return (
    <>
      {/* Base background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundColor: theme.pageBackground,
          backgroundImage: `linear-gradient(135deg, ${theme.primary}15 0%, ${theme.secondaryColors?.[0] || theme.primary}15 50%, ${theme.secondaryColors?.[1] || theme.secondaryColors?.[0] || theme.primary}15 100%)`,
        }}
      />

      {/* === MESH GRADIENT === */}
      {/* Primary blob - Top Left */}
      <div
        className="fixed -z-10 pointer-events-none"
        style={{
          width: "70vw",
          height: "70vh",
          top: "-25%",
          left: "-15%",
          background: `radial-gradient(circle at center, ${theme.primary}${isDark ? '40' : '30'} 0%, ${theme.secondaryColors?.[0] || theme.primary}${isDark ? '15' : '10'} 60%, transparent 100%)`,
          filter: "blur(100px)",
          transform: "rotate(-15deg)",
          opacity: 0.9,
        }}
      />

      {/* Secondary Color 1 blob - Top Right */}
      <div
        className="fixed -z-10 pointer-events-none"
        style={{
          width: "60vw",
          height: "60vh",
          top: "-20%",
          right: "-20%",
          background: `radial-gradient(circle at center, ${theme.secondaryColors?.[0] || theme.primary}${isDark ? '40' : '30'} 0%, ${theme.primary}${isDark ? '15' : '10'} 60%, transparent 100%)`,
          filter: "blur(120px)",
          transform: "rotate(20deg)",
          opacity: 0.85,
        }}
      />

      {/* Secondary Color 2 accent - Left Center */}
      <div
        className="fixed -z-10 pointer-events-none"
        style={{
          width: "50vw",
          height: "80vh",
          top: "15%",
          left: "-20%",
          background: `radial-gradient(ellipse at center, ${theme.secondaryColors?.[1] || theme.primary}${isDark ? '35' : '25'} 0%, ${theme.secondaryColors?.[0] || theme.primary}10 60%, transparent 100%)`,
          filter: "blur(110px)",
          opacity: 0.8,
        }}
      />

      {/* Secondary Color 1 blob - Right Center */}
      <div
        className="fixed -z-10 pointer-events-none"
        style={{
          width: "55vw",
          height: "70vh",
          top: "25%",
          right: "-15%",
          background: `radial-gradient(ellipse at center, ${theme.secondaryColors?.[0] || theme.primary}${isDark ? '35' : '25'} 0%, ${theme.primary}10 60%, transparent 100%)`,
          filter: "blur(130px)",
          transform: "rotate(-10deg)",
          opacity: 0.8,
        }}
      />

      {/* Primary center glow */}
      <div
        className="fixed -z-10 pointer-events-none"
        style={{
          width: "60vw",
          height: "60vh",
          top: "20%",
          left: "20%",
          background: `radial-gradient(circle at center, ${theme.primary}${isDark ? '25' : '20'} 0%, ${theme.secondaryColors?.[0] || theme.primary}10 65%, transparent 100%)`,
          filter: "blur(140px)",
          opacity: 0.7,
        }}
      />

      {/* Primary blob - Bottom Left */}
      <div
        className="fixed -z-10 pointer-events-none"
        style={{
          width: "65vw",
          height: "65vh",
          bottom: "-25%",
          left: "-15%",
          background: `radial-gradient(circle at center, ${theme.primary}${isDark ? '40' : '30'} 0%, ${theme.secondaryColors?.[1] || theme.primary}15 60%, transparent 100%)`,
          filter: "blur(120px)",
          transform: "rotate(25deg)",
          opacity: 0.9,
        }}
      />

      {/* Secondary Color 1 accent - Bottom Right */}
      <div
        className="fixed -z-10 pointer-events-none"
        style={{
          width: "60vw",
          height: "60vh",
          bottom: "-20%",
          right: "-15%",
          background: `radial-gradient(circle at center, ${theme.secondaryColors?.[0] || theme.primary}${isDark ? '40' : '30'} 0%, ${theme.primary}10 60%, transparent 100%)`,
          filter: "blur(110px)",
          transform: "rotate(-20deg)",
          opacity: 0.85,
        }}
      />

      {/* Subtle noise texture overlay */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
      />
    </>
  );
};

