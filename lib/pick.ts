import type { AppState, Filters, Game, Profile } from "./types";

export const NO_REPEAT_DAYS = 30;

export const DEFAULT_PROFILE: Profile = {
  kidAges: [4],
  places: ["living"],
  items: ["cushions", "boxes", "paper", "nothing"],
  skills: ["motor", "problem"],
  minutes: 10,
};

export function dateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00").getTime();
  const db = new Date(b + "T00:00:00").getTime();
  return Math.round((db - da) / 86_400_000);
}

/** Small deterministic hash so the same day always gives the same pick */
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Ids suggested in the last NO_REPEAT_DAYS days (not counting `exceptDate`) */
export function recentIds(history: Record<string, string>, today: string, exceptDate?: string): Set<string> {
  const out = new Set<string>();
  for (const [date, id] of Object.entries(history)) {
    if (date === exceptDate) continue;
    const diff = daysBetween(date, today);
    if (diff >= 0 && diff < NO_REPEAT_DAYS) out.add(id);
  }
  return out;
}

function agesFit(game: Game, ages: number[]): boolean {
  if (ages.length === 0) return true;
  return ages.every((a) => a >= game.ages[0] && a <= game.ages[1]);
}

function agesOverlap(game: Game, ages: number[]): boolean {
  if (ages.length === 0) return true;
  return ages.some((a) => a >= game.ages[0] && a <= game.ages[1]);
}

function itemsFit(game: Game, owned: string[]): boolean {
  if (game.items.length === 1 && game.items[0] === "nothing") return true;
  // "nothing" in the owned list only means "I have no special materials"
  return game.items.every((i) => i === "nothing" || owned.includes(i));
}

function placeFit(game: Game, places: string[]): boolean {
  if (places.length === 0) return true;
  return game.places.some((p) => places.includes(p));
}

function skillOverlap(game: Game, skills: string[]): number {
  if (skills.length === 0) return 0;
  return game.skills.filter((s) => skills.includes(s)).length;
}

/** Strict search: used by the Search screen. Best matches first. */
export function searchGames(all: Game[], f: Filters): Game[] {
  const scored: { game: Game; score: number }[] = [];
  for (const g of all) {
    if (!agesFit(g, f.ages)) continue;
    if (f.kids < g.kids[0] || f.kids > g.kids[1]) continue;
    if (!placeFit(g, f.places)) continue;
    if (!itemsFit(g, f.items)) continue;
    if (g.min > f.minutes) continue;
    if (f.skills.length > 0 && skillOverlap(g, f.skills) === 0) continue;
    const timeScore = 3 - Math.min(3, (f.minutes - g.min) / 5);
    const score = skillOverlap(g, f.skills) * 2 + timeScore;
    scored.push({ game: g, score });
  }
  scored.sort((a, b) => b.score - a.score || a.game.id.localeCompare(b.game.id));
  return scored.map((s) => s.game);
}

/** Candidate pool for the daily suggestion, from most to least strict. */
function dailyPool(all: Game[], profile: Profile): Game[] {
  const tiers: ((g: Game) => boolean)[] = [
    (g) =>
      agesFit(g, profile.kidAges) &&
      placeFit(g, profile.places) &&
      itemsFit(g, profile.items) &&
      g.min <= profile.minutes &&
      skillOverlap(g, profile.skills) > 0,
    (g) =>
      agesFit(g, profile.kidAges) &&
      placeFit(g, profile.places) &&
      itemsFit(g, profile.items) &&
      g.min <= profile.minutes,
    (g) => agesOverlap(g, profile.kidAges) && placeFit(g, profile.places) && itemsFit(g, profile.items),
    (g) => agesOverlap(g, profile.kidAges),
  ];
  for (const t of tiers) {
    const pool = all.filter(t);
    if (pool.length > 0) return pool;
  }
  return all;
}

/**
 * Pick the game for `today`. It never repeats within 30 days while the
 * (profile-filtered) pool still has unused games. `bump` lets the parent ask
 * for another one the same day.
 */
export function pickDaily(all: Game[], state: AppState, today: string, bump = 0): Game | null {
  if (all.length === 0) return null;
  const pool = dailyPool(all, state.profile);
  const used = recentIds(state.history, today, today);
  let candidates = pool.filter((g) => !used.has(g.id));
  if (candidates.length === 0) {
    // Whole pool seen in the last 30 days: reuse the one suggested longest ago
    const lastSeen = new Map<string, string>();
    for (const [date, id] of Object.entries(state.history)) {
      if (date === today) continue;
      const prev = lastSeen.get(id);
      if (!prev || date > prev) lastSeen.set(id, date);
    }
    const sorted = [...pool].sort((a, b) => (lastSeen.get(a.id) ?? "").localeCompare(lastSeen.get(b.id) ?? ""));
    candidates = sorted.slice(0, Math.max(1, Math.ceil(sorted.length / 3)));
  }
  const idx = (hash(today + ":" + state.profile.kidAges.join(",")) + bump) % candidates.length;
  return candidates[idx];
}
