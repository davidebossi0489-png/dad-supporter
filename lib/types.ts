export type Lang = "it" | "en";

export type Place = "living" | "bedroom" | "kitchen" | "garden" | "park";
export type Item =
  | "cushions"
  | "boxes"
  | "balloons"
  | "paper"
  | "tape"
  | "pots"
  | "ball"
  | "blanket"
  | "rope"
  | "chalk"
  | "socks"
  | "nothing";
export type Skill =
  | "motor"
  | "problem"
  | "reflection"
  | "collaboration"
  | "creativity"
  | "language";

export type SceneId =
  | "hop"
  | "toss"
  | "crawl"
  | "stack"
  | "draw"
  | "dance"
  | "balance"
  | "hide"
  | "sort"
  | "pretend";

export interface GameText {
  /** Title */
  t: string;
  /** One-sentence description */
  d: string;
  /** 3 steps */
  s: [string, string, string];
  /** Easier variant */
  e: string;
  /** Harder variant */
  h: string;
}

export interface Game {
  id: string;
  /** Minimum and maximum age (years) the game suits */
  ages: [number, number];
  /** Typical duration in minutes: 5, 10, 15 or 20 */
  min: 5 | 10 | 15 | 20;
  /** Minimum and maximum number of children */
  kids: [number, number];
  places: Place[];
  /** Materials needed. Use ["nothing"] if no material is needed */
  items: Item[];
  skills: Skill[];
  scene: SceneId;
  it: GameText;
  en: GameText;
  /** True for games invented on demand by the AI */
  generated?: boolean;
}

export interface Profile {
  /** Ages of the children, in years */
  kidAges: number[];
  places: Place[];
  items: Item[];
  skills: Skill[];
  minutes: 5 | 10 | 15 | 20;
}

export interface Filters {
  kids: number;
  ages: number[];
  places: Place[];
  items: Item[];
  minutes: 5 | 10 | 15 | 20;
  skills: Skill[];
}

export interface AppState {
  lang: Lang;
  profile: Profile;
  /** date (YYYY-MM-DD) -> game id suggested that day */
  history: Record<string, string>;
  played: string[];
  favs: string[];
  /** games generated on demand, kept on this device */
  custom: Game[];
}
