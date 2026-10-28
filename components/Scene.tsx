import type { ReactElement } from "react";
import type { SceneId } from "@/lib/types";

/**
 * Reusable cartoon scene kit. Every game picks one of 10 animation templates
 * and a color theme (derived from the game id), so each game gets its own
 * look without one drawing per game. Animations are pure CSS and are disabled
 * for people who prefer reduced motion (see globals.css).
 */

const THEMES = [
  { bg: "#CFE5F2", a: "#F6B8A5", b: "#BFDDB0", c: "#D5C8F0", shirt: "#F2A65A", pants: "#6B7FD0" },
  { bg: "#DDEBE3", a: "#F8D98B", b: "#F6B8A5", c: "#CFE5F2", shirt: "#E27D7D", pants: "#4B6F9E" },
  { bg: "#E4E0F5", a: "#BFDDB0", b: "#F8D98B", c: "#F6B8A5", shirt: "#6FB7A8", pants: "#7A6BB8" },
  { bg: "#FBE3D3", a: "#CFE5F2", b: "#D5C8F0", c: "#BFDDB0", shirt: "#7E9BE0", pants: "#5B8C6E" },
  { bg: "#FAF0C8", a: "#D5C8F0", b: "#F6B8A5", c: "#CFE5F2", shirt: "#E58F65", pants: "#4A8C84" },
];

function themeFor(id: string) {
  let n = 0;
  for (let i = 0; i < id.length; i++) n = (n * 31 + id.charCodeAt(i)) >>> 0;
  return THEMES[n % THEMES.length];
}

type Theme = ReturnType<typeof themeFor>;

/** The little cartoon child. (0,0) is at the feet. */
function Kid({ t, hair = "#6B4A3A", skin = "#FBD9B8", arms = "up" }: { t: Theme; hair?: string; skin?: string; arms?: "up" | "down" | "side" }) {
  const armPath =
    arms === "up" ? "M-9-32l-11-9M9-32l11-9" : arms === "side" ? "M-9-30l-14 2M9-30l14 2" : "M-9-30l-4 16M9-30l4 16";
  return (
    <g>
      <path d="M-4-12v12M4-12v12" stroke={t.pants} strokeWidth="5" strokeLinecap="round" />
      <path d={armPath} stroke={skin} strokeWidth="4" strokeLinecap="round" />
      <rect x="-9" y="-38" width="18" height="26" rx="8" fill={t.shirt} />
      <circle cx="0" cy="-50" r="12" fill={skin} />
      <path d="M-12-52a12 12 0 0 1 24 0q-12-6-24 0z" fill={hair} />
      <circle cx="-4" cy="-49" r="1.6" fill="#26343B" />
      <circle cx="4" cy="-49" r="1.6" fill="#26343B" />
      <path d="M-4-44q4 4 8 0" fill="none" stroke="#26343B" strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
}

function Floor({ t }: { t: Theme }) {
  return (
    <>
      <rect width="342" height="190" fill={t.bg} />
      <rect y="150" width="342" height="40" fill="#fff" opacity=".45" />
    </>
  );
}

function Hop({ t }: { t: Theme }) {
  return (
    <>
      <rect width="342" height="190" fill={t.bg} />
      <g className="sc-wave">
        <path d="M-40 150q10-8 20 0t20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".75" />
      </g>
      <g className="sc-wave">
        <path d="M-40 174q10-8 20 0t20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0 20 0" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".5" />
      </g>
      <rect x="30" y="128" width="64" height="28" rx="14" fill={t.a} />
      <rect x="140" y="128" width="64" height="28" rx="14" fill={t.b} />
      <rect x="250" y="128" width="64" height="28" rx="14" fill={t.c} />
      <g className="sc-hop">
        <g transform="translate(62,128)">
          <Kid t={t} />
        </g>
      </g>
    </>
  );
}

function Toss({ t }: { t: Theme }) {
  return (
    <>
      <Floor t={t} />
      <g transform="translate(60,150)">
        <Kid t={t} arms="up" />
      </g>
      <g transform="translate(282,150)">
        <Kid t={{ ...t, shirt: t.pants, pants: t.shirt }} hair="#2E2A28" arms="up" />
      </g>
      <g className="sc-toss">
        <circle cx="75" cy="105" r="9" fill="#E9605C" />
        <path d="M68 103q7-5 14 0" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    </>
  );
}

function Crawl({ t }: { t: Theme }) {
  return (
    <>
      <Floor t={t} />
      <path d="M70 150a60 60 0 0 1 120 0z" fill={t.a} />
      <path d="M92 150a38 38 0 0 1 76 0z" fill={t.bg} />
      <rect x="190" y="118" width="60" height="32" rx="16" fill={t.b} />
      <g className="sc-crawl">
        <g transform="translate(20,150)">
          <ellipse cx="14" cy="-12" rx="22" ry="11" fill={t.shirt} />
          <circle cx="34" cy="-17" r="10" fill="#FBD9B8" />
          <path d="M26-21a10 10 0 0 1 20 0q-10-5-20 0z" fill="#6B4A3A" />
          <circle cx="37" cy="-18" r="1.5" fill="#26343B" />
          <path d="M-4-2h8M14-2h8" stroke={t.pants} strokeWidth="5" strokeLinecap="round" />
        </g>
      </g>
    </>
  );
}

function Stack({ t }: { t: Theme }) {
  return (
    <>
      <Floor t={t} />
      <rect x="150" y="124" width="50" height="26" rx="4" fill={t.a} />
      <rect x="158" y="98" width="40" height="26" rx="4" fill={t.b} />
      <g className="sc-stack">
        <rect x="166" y="72" width="30" height="26" rx="4" fill={t.c} />
      </g>
      <g transform="translate(95,150)">
        <Kid t={t} arms="side" />
      </g>
      <g transform="translate(245,150)">
        <Kid t={{ ...t, shirt: t.a, pants: t.pants }} hair="#B0713E" arms="side" />
      </g>
    </>
  );
}

function Draw({ t }: { t: Theme }) {
  return (
    <>
      <Floor t={t} />
      <rect x="60" y="30" width="222" height="100" rx="10" fill="#fff" stroke={t.a} strokeWidth="4" />
      <path className="sc-draw" d="M90 100q25-50 50-10t50-10 50 10" fill="none" stroke={t.shirt} strokeWidth="6" strokeLinecap="round" pathLength="1" />
      <g transform="translate(171,172)">
        <Kid t={t} arms="up" />
      </g>
    </>
  );
}

function Dance({ t }: { t: Theme }) {
  return (
    <>
      <Floor t={t} />
      <g className="sc-note">
        <path d="M250 60v-30l18-5v28" stroke={t.shirt} strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="246" cy="62" r="6" fill={t.shirt} />
        <circle cx="264" cy="57" r="6" fill={t.shirt} />
      </g>
      <g className="sc-dance">
        <g transform="translate(120,150)">
          <Kid t={t} arms="up" />
        </g>
      </g>
      <g className="sc-dance sc-dance2">
        <g transform="translate(200,150)">
          <Kid t={{ ...t, shirt: t.a, pants: t.pants }} hair="#B0713E" arms="up" />
        </g>
      </g>
    </>
  );
}

function Balance({ t }: { t: Theme }) {
  return (
    <>
      <Floor t={t} />
      <rect x="40" y="146" width="262" height="8" rx="4" fill={t.a} />
      <g className="sc-balance">
        <g transform="translate(70,146)">
          <Kid t={t} arms="side" />
        </g>
      </g>
    </>
  );
}

function Hide({ t }: { t: Theme }) {
  return (
    <>
      <Floor t={t} />
      <g className="sc-peek">
        <g transform="translate(205,150)">
          <Kid t={{ ...t, shirt: t.a }} hair="#B0713E" arms="down" />
        </g>
      </g>
      <rect x="170" y="70" width="80" height="80" rx="14" fill={t.b} />
      <rect x="182" y="84" width="56" height="10" rx="5" fill="#fff" opacity=".5" />
      <g transform="translate(70,150)">
        <Kid t={t} arms="side" />
      </g>
      <g className="sc-q">
        <text x="100" y="64" fontSize="28" fontWeight="800" fill={t.shirt} fontFamily="sans-serif">?</text>
      </g>
    </>
  );
}

function Sort({ t }: { t: Theme }) {
  return (
    <>
      <Floor t={t} />
      <rect x="50" y="116" width="80" height="34" rx="8" fill={t.a} />
      <rect x="212" y="116" width="80" height="34" rx="8" fill={t.b} />
      <g className="sc-sort">
        <circle cx="171" cy="74" r="9" fill={t.c} stroke={t.shirt} strokeWidth="3" />
      </g>
      <g transform="translate(171,168)">
        <Kid t={t} arms="up" />
      </g>
    </>
  );
}

function Pretend({ t }: { t: Theme }) {
  return (
    <>
      <Floor t={t} />
      <g className="sc-float">
        <path d="M232 70q6-24 30-24t30 22q-4 18-26 18-8 0-12-4l-18 10z" fill="#fff" stroke={t.shirt} strokeWidth="3" strokeLinejoin="round" />
        <circle cx="250" cy="62" r="3" fill={t.shirt} />
        <circle cx="262" cy="62" r="3" fill={t.shirt} />
        <circle cx="274" cy="62" r="3" fill={t.shirt} />
      </g>
      <g className="sc-sway">
        <g transform="translate(150,150)">
          <Kid t={t} arms="side" />
          <path d="M-14 -50l14 -18 14 18z" fill={t.a} />
        </g>
      </g>
      <path d="M170 150q30-30 60 0" fill="none" stroke={t.c} strokeWidth="6" strokeLinecap="round" />
    </>
  );
}

const SCENES: Record<SceneId, (p: { t: Theme }) => ReactElement> = {
  hop: Hop,
  toss: Toss,
  crawl: Crawl,
  stack: Stack,
  draw: Draw,
  dance: Dance,
  balance: Balance,
  hide: Hide,
  sort: Sort,
  pretend: Pretend,
};

export function Scene({ scene, gameId, label, rounded = 20 }: { scene: SceneId; gameId: string; label: string; rounded?: number }) {
  const Comp = SCENES[scene] ?? Hop;
  const t = themeFor(gameId);
  return (
    <svg
      viewBox="0 0 342 190"
      width="100%"
      role="img"
      aria-label={label}
      style={{ display: "block", borderRadius: rounded }}
    >
      <Comp t={t} />
    </svg>
  );
}
