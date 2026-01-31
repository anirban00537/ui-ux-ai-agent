import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Row } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const withAlpha = (hex: string, alpha: number): string => {
  if (!hex) return "transparent";
  const raw = hex.replace("#", "");
  if (raw.length === 3) {
    const r = parseInt(raw[0] + raw[0], 16);
    const g = parseInt(raw[1] + raw[1], 16);
    const b = parseInt(raw[2] + raw[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (raw.length !== 6) return hex;
  const r = parseInt(raw.substring(0, 2), 16);
  const g = parseInt(raw.substring(2, 4), 16);
  const b = parseInt(raw.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const detectRowBlockType = (row: Row): string | undefined => {
  if (!row.blocks || row.blocks.length === 0) return undefined;
  const firstType = row.blocks[0].type;
  if (!firstType) return undefined;
  const allSame = row.blocks.every((b) => b.type === firstType);
  return allSame ? firstType : undefined;
};
