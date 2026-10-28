import { NextResponse } from "next/server";
import type { Filters, Game, GameText, Item, Place, SceneId, Skill } from "@/lib/types";

export const runtime = "nodejs";

const PLACES: Place[] = ["living", "bedroom", "kitchen", "garden", "park"];
const ITEMS: Item[] = ["cushions", "boxes", "balloons", "paper", "tape", "pots", "ball", "blanket", "rope", "chalk", "socks", "nothing"];
const SKILLS: Skill[] = ["motor", "problem", "reflection", "collaboration", "creativity", "language"];
const SCENES: SceneId[] = ["hop", "toss", "crawl", "stack", "draw", "dance", "balance", "hide", "sort", "pretend"];

// Very small best-effort rate limit (per server instance). For real protection use a shared store.
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_HITS = 5;

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_HITS;
}

function pickEnum<T extends string>(value: unknown, allowed: readonly T[]): T[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is T => typeof v === "string" && (allowed as readonly string[]).includes(v));
}

function cleanText(x: unknown): GameText | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const steps = Array.isArray(o.s) ? o.s.map((s) => str(s, 240)).filter(Boolean) : [];
  const t = str(o.t, 80);
  const d = str(o.d, 240);
  const e = str(o.e, 200);
  const h = str(o.h, 200);
  if (!t || !d || steps.length < 3 || !e || !h) return null;
  return { t, d, s: [steps[0], steps[1], steps[2]], e, h };
}

function sanitizeFilters(raw: unknown): Filters {
  const f = (raw ?? {}) as Record<string, unknown>;
  const minutes = [5, 10, 15, 20].includes(Number(f.minutes)) ? (Number(f.minutes) as 5 | 10 | 15 | 20) : 10;
  const ages = Array.isArray(f.ages)
    ? f.ages.map(Number).filter((a) => Number.isFinite(a) && a >= 1 && a <= 12).slice(0, 6)
    : [];
  return {
    kids: Math.min(6, Math.max(1, Number(f.kids) || 1)),
    ages,
    places: pickEnum(f.places, PLACES),
    items: pickEnum(f.items, ITEMS),
    minutes,
    skills: pickEnum(f.skills, SKILLS),
  };
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI generation is not configured" }, { status: 503 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: { filters?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const f = sanitizeFilters(body.filters);

  const placeNames = f.places.length ? f.places.join(", ") : "any indoor or outdoor place";
  const itemNames = f.items.length ? f.items.join(", ") : "no special materials";
  const skillNames = f.skills.length ? f.skills.join(", ") : "any";
  const ageText = f.ages.length ? f.ages.join(", ") + " years old" : "ages 3 to 8";

  const prompt = `Invent ONE new, simple, safe game that parents can play with their children at home or outdoors.

Constraints:
- Number of children: ${f.kids}
- Children's ages: ${ageText}
- Place: ${placeNames}
- Materials available (only use these; household items only): ${itemNames}
- Duration: about ${f.minutes} minutes
- Skills to train: ${skillNames}

Safety: no sharp objects, no small parts for under 3, no climbing on furniture, an adult always nearby.

Return ONLY a JSON object (no markdown) with exactly this shape:
{
  "ages": [minAge, maxAge],
  "kids": [minKids, maxKids],
  "places": subset of ${JSON.stringify(PLACES)},
  "items": subset of ${JSON.stringify(ITEMS)} (use ["nothing"] if no material is needed),
  "skills": subset of ${JSON.stringify(SKILLS)},
  "scene": one of ${JSON.stringify(SCENES)} (the cartoon animation that best fits),
  "it": { "t": title, "d": one sentence, "s": [step1, step2, step3], "e": easier variant, "h": harder variant },
  "en": the same object in English
}
Write natural, warm, concrete Italian and English. Keep each step under 30 words.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    }
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = data.content?.find((c) => c.type === "text")?.text ?? "";
    const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const g = JSON.parse(json) as Record<string, unknown>;

    const it = cleanText(g.it);
    const en = cleanText(g.en);
    if (!it || !en) return NextResponse.json({ error: "Bad output" }, { status: 502 });

    const ages = Array.isArray(g.ages) ? (g.ages.map(Number) as number[]) : [];
    const kids = Array.isArray(g.kids) ? (g.kids.map(Number) as number[]) : [];
    const places = pickEnum(g.places, PLACES);
    const items = pickEnum(g.items, ITEMS);
    const skills = pickEnum(g.skills, SKILLS);
    const scene = SCENES.includes(g.scene as SceneId) ? (g.scene as SceneId) : "pretend";

    const game: Game = {
      id: "ai-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      ages: [Math.max(1, ages[0] || 3), Math.min(12, ages[1] || 8)],
      min: f.minutes,
      kids: [Math.max(1, kids[0] || 1), Math.min(8, kids[1] || Math.max(2, f.kids))],
      places: places.length ? places : f.places.length ? f.places : ["living"],
      items: items.length ? items : ["nothing"],
      skills: skills.length ? skills : f.skills.length ? f.skills : ["creativity"],
      scene,
      it,
      en,
      generated: true,
    };
    return NextResponse.json({ game });
  } catch {
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
