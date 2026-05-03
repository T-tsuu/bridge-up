import { XP_LEVELS, type XPLevel } from "@/types";

export function resolveLevel(totalXP: number): XPLevel {
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= XP_LEVELS[i].minXP) {
      return XP_LEVELS[i];
    }
  }
  return XP_LEVELS[0];
}

export function xpToNextLevel(totalXP: number): number | null {
  const current = resolveLevel(totalXP);
  if (current.maxXP === null) return null; // Already at max level
  return current.maxXP - totalXP + 1;
}

export function levelProgressPercent(totalXP: number): number {
  const current = resolveLevel(totalXP);
  if (current.maxXP === null) return 100;
  const range = current.maxXP - current.minXP;
  const progress = totalXP - current.minXP;
  return Math.min(100, Math.round((progress / range) * 100));
}