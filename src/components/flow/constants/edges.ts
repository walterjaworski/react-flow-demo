export const EDGE_COLOR_BY_CASE = {
  success: "#22C55E",
  deny: "#EAB308",
  fail: "#EF4444",
} as const;

export type EdgeCase = keyof typeof EDGE_COLOR_BY_CASE;
