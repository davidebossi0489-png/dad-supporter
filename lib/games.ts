import type { Game } from "./types";
import { GAMES_1 } from "./games-1.ts";
import { GAMES_2 } from "./games-2.ts";
import { GAMES_3 } from "./games-3.ts";

/** The hand-written library: 90 games for ages 2 to 10, in Italian and English. */
export const GAMES: Game[] = [...GAMES_1, ...GAMES_2, ...GAMES_3];

export function findGame(id: string, custom: Game[] = []): Game | undefined {
  return GAMES.find((g) => g.id === id) ?? custom.find((g) => g.id === id);
}
