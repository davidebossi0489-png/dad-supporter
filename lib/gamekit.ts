import type { Game, Item, Place, SceneId, Skill } from "./types";

/** [title, description, step 1, step 2, step 3, easier, harder] */
export type Texts = [string, string, string, string, string, string, string];

/** Compact constructor so the game library stays readable. */
export function mk(
  id: string,
  scene: SceneId,
  ages: [number, number],
  min: 5 | 10 | 15 | 20,
  kids: [number, number],
  places: Place[],
  items: Item[],
  skills: Skill[],
  it: Texts,
  en: Texts,
): Game {
  const text = (x: Texts) => ({ t: x[0], d: x[1], s: [x[2], x[3], x[4]] as [string, string, string], e: x[5], h: x[6] });
  return { id, scene, ages, min, kids, places, items, skills, it: text(it), en: text(en) };
}
