// Sanity checks for the hand-written game library.
// Run with: npm run check:games  (uses Node's built-in TypeScript stripping, Node 22+)
import { GAMES } from "../lib/games.ts";

const PLACES = ["living", "bedroom", "kitchen", "garden", "park"];
const ITEMS = ["cushions", "boxes", "balloons", "paper", "tape", "pots", "ball", "blanket", "rope", "chalk", "socks", "nothing"];
const SKILLS = ["motor", "problem", "reflection", "collaboration", "creativity", "language"];
const SCENES = ["hop", "toss", "crawl", "stack", "draw", "dance", "balance", "hide", "sort", "pretend"];

const errors = [];
const ids = new Set();
const titles = new Set();
const err = (id, msg) => errors.push(`${id}: ${msg}`);

for (const g of GAMES) {
  if (ids.has(g.id)) err(g.id, "duplicate id");
  ids.add(g.id);
  if (g.ages[0] < 1 || g.ages[1] > 10 || g.ages[0] > g.ages[1]) err(g.id, `bad ages ${g.ages}`);
  if (![5, 10, 15, 20].includes(g.min)) err(g.id, `bad minutes ${g.min}`);
  if (g.kids[0] > g.kids[1]) err(g.id, "bad kids range");
  if (!g.places.length || g.places.some((p) => !PLACES.includes(p))) err(g.id, "bad places");
  if (!g.items.length || g.items.some((i) => !ITEMS.includes(i))) err(g.id, "bad items");
  if (!g.skills.length || g.skills.some((s) => !SKILLS.includes(s))) err(g.id, "bad skills");
  if (!SCENES.includes(g.scene)) err(g.id, "bad scene");
  for (const lang of ["it", "en"]) {
    const x = g[lang];
    if (!x || !x.t || !x.d || x.s.length !== 3 || x.s.some((s) => !s) || !x.e || !x.h) err(g.id, `incomplete ${lang} text`);
    else {
      const key = lang + ":" + x.t.toLowerCase();
      if (titles.has(key)) err(g.id, `duplicate ${lang} title "${x.t}"`);
      titles.add(key);
    }
  }
}

const count = (f) => GAMES.filter(f).length;
console.log(`Games: ${GAMES.length}`);
console.log("By age (games that cover each age):");
for (let a = 1; a <= 10; a++) console.log(`  age ${a}: ${count((g) => a >= g.ages[0] && a <= g.ages[1])}`);
console.log("By place:", Object.fromEntries(PLACES.map((p) => [p, count((g) => g.places.includes(p))])));
console.log("By skill:", Object.fromEntries(SKILLS.map((s) => [s, count((g) => g.skills.includes(s))])));
console.log("By minutes:", Object.fromEntries([5, 10, 15, 20].map((m) => [m, count((g) => g.min === m)])));
console.log("No-material games:", count((g) => g.items.length === 1 && g.items[0] === "nothing"));

if (errors.length) {
  console.error("\nProblems found:\n" + errors.join("\n"));
  process.exit(1);
}
console.log("\nAll checks passed.");
