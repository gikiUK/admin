export type Quadrant = "star" | "niche" | "popular_failing" | "kill" | "boundary";

export type QuadrantPoint = {
  id: string;
  x: number;
  y: number;
  size: number;
  title: string;
  adoption_count: number;
  completion_count: number;
  completion_rate: number;
  quadrant: Quadrant;
};

export const QUADRANT_COLORS: Record<Quadrant, string> = {
  star: "hsl(140, 60%, 40%)",
  niche: "hsl(190, 55%, 45%)",
  popular_failing: "hsl(35, 70%, 50%)",
  kill: "hsl(0, 65%, 55%)",
  boundary: "hsl(220, 8%, 55%)"
};

export function quadrantLabel(q: Quadrant): string {
  switch (q) {
    case "star":
      return "Star — high adoption, high completion";
    case "niche":
      return "Niche but effective";
    case "popular_failing":
      return "Popular but failing";
    case "kill":
      return "Kill candidate";
    default:
      return "On the median";
  }
}
