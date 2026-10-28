"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "./Icon";
import { Scene } from "./Scene";
import { DICT, ITEMS, PLACES, SKILLS } from "@/lib/i18n";
import { GAMES, findGame } from "@/lib/games";
import { dateKey, pickDaily, searchGames, recentIds } from "@/lib/pick";
import { loadState, saveState } from "@/lib/storage";
import type { AppState, Filters, Game, Item, Lang, Place, Profile, Skill } from "@/lib/types";

type Tab = "today" | "search" | "history" | "family";
type Minutes = 5 | 10 | 15 | 20;
const MINUTES: Minutes[] = [5, 10, 15, 20];
const AGE_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10];

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className={"chip" + (on ? " on" : "")} aria-pressed={on} onClick={onClick}>
      {on && <Icon name="check" size={14} stroke={3} />}
      {children}
    </button>
  );
}

function MinutesPicker({ value, onChange, unit }: { value: Minutes; onChange: (m: Minutes) => void; unit: string }) {
  return (
    <div className="seg" role="group">
      {MINUTES.map((m) => (
        <button key={m} type="button" className={value === m ? "on" : ""} aria-pressed={value === m} onClick={() => onChange(m)}>
          {m === 20 ? "20+" : m} {unit}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [tab, setTab] = useState<Tab>("today");
  const [openId, setOpenId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const swaps = useRef(0);

  // Load from this device, then make sure today has a suggestion
  useEffect(() => {
    const s = loadState();
    const today = dateKey();
    if (!s.history[today]) {
      const g = pickDaily([...GAMES, ...s.custom], s, today);
      if (g) s.history = { ...s.history, [today]: g.id };
    }
    setState(s);
  }, []);

  useEffect(() => {
    if (state) saveState(state);
    document.documentElement.lang = state?.lang ?? "it";
  }, [state]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const all = useMemo(() => (state ? [...GAMES, ...state.custom] : GAMES), [state]);

  if (!state) return <div className="app" />;

  const lang = state.lang;
  const t = DICT[lang];
  const today = dateKey();
  const todayGame = findGame(state.history[today] ?? "", state.custom);
  const open = openId ? findGame(openId, state.custom) : null;

  const update = (patch: Partial<AppState>) => setState((s) => (s ? { ...s, ...patch } : s));

  function swapToday() {
    if (!state) return;
    const current = state.history[today];
    let next: Game | null = null;
    for (let i = 0; i < 8; i++) {
      swaps.current += 1;
      next = pickDaily(all, state, today, swaps.current);
      if (next && next.id !== current) break;
    }
    if (next) update({ history: { ...state.history, [today]: next.id } });
  }

  function markPlayed(id: string) {
    if (!state) return;
    update({ played: state.played.includes(id) ? state.played : [...state.played, id] });
  }

  function toggleFav(id: string) {
    if (!state) return;
    update({ favs: toggle(state.favs, id) });
  }

  function addCustom(g: Game) {
    setState((s) => (s ? { ...s, custom: [...s.custom, g], history: s.history } : s));
    setOpenId(g.id);
  }

  const dateLabel = (() => {
    const d = new Date();
    return `${t.days[d.getDay()]} ${d.getDate()} ${t.months[d.getMonth()]}`;
  })();

  const goTab = (x: Tab) => {
    setOpenId(null);
    setTab(x);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="app">
      <div className="topbar">
        <div className="brand">
          <div className="brand-mark" style={{ color: "#2f6f66" }}>
            <Icon name="user" size={20} stroke={2} />
          </div>
          <span>{t.app}</span>
        </div>
        <div className="lang" role="group" aria-label="Language">
          {(["it", "en"] as Lang[]).map((l) => (
            <button key={l} type="button" className={lang === l ? "on" : ""} aria-pressed={lang === l} onClick={() => update({ lang: l })}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {open ? (
        <GameDetail
          game={open}
          state={state}
          lang={lang}
          onBack={() => setOpenId(null)}
          onPlayed={() => {
            markPlayed(open.id);
            setToast(t.game.playedDone);
          }}
          onFav={() => toggleFav(open.id)}
        />
      ) : tab === "today" ? (
        <TodayScreen
          lang={lang}
          dateLabel={dateLabel}
          game={todayGame ?? null}
          profile={state.profile}
          onOpen={(g) => setOpenId(g.id)}
          onSwap={swapToday}
          onSearch={() => goTab("search")}
          onFamily={() => goTab("family")}
        />
      ) : tab === "search" ? (
        <SearchScreen
          lang={lang}
          all={all}
          profile={state.profile}
          onOpen={(g) => setOpenId(g.id)}
          onGenerated={addCustom}
        />
      ) : tab === "history" ? (
        <HistoryScreen lang={lang} state={state} today={today} onOpen={(g) => setOpenId(g.id)} onFav={toggleFav} />
      ) : (
        <FamilyScreen
          lang={lang}
          profile={state.profile}
          onSave={(p) => {
            update({ profile: p });
            setToast(t.common.saved);
          }}
        />
      )}

      <nav className="nav" aria-label="Navigation">
        {(
          [
            ["today", t.tabs.today, "today"],
            ["search", t.tabs.search, "search"],
            ["history", t.tabs.history, "heart"],
            ["family", t.tabs.family, "family"],
          ] as [Tab, string, string][]
        ).map(([id, label, icon]) => (
          <button key={id} type="button" className={!open && tab === id ? "on" : ""} onClick={() => goTab(id)} aria-current={!open && tab === id ? "page" : undefined}>
            <Icon name={icon} />
            {label}
          </button>
        ))}
      </nav>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

function TodayScreen({
  lang,
  dateLabel,
  game,
  profile,
  onOpen,
  onSwap,
  onSearch,
  onFamily,
}: {
  lang: Lang;
  dateLabel: string;
  game: Game | null;
  profile: Profile;
  onOpen: (g: Game) => void;
  onSwap: () => void;
  onSearch: () => void;
  onFamily: () => void;
}) {
  const t = DICT[lang];
  const ageText = profile.kidAges.join(lang === "it" ? " e " : " & ");
  return (
    <div className="screen">
      <div>
        <p className="sub" style={{ fontWeight: 700 }}>
          {dateLabel}
        </p>
        <h1 style={{ marginTop: 2 }}>{t.today.title}</h1>
        <button type="button" className="profile-chip" onClick={onFamily}>
          <Icon name="family" size={18} stroke={2} />
          {profile.kidAges.length} {t.common.kids} · {ageText} {t.common.years}
        </button>
      </div>

      {game ? (
        <div className="hero">
          <Scene scene={game.scene} gameId={game.id} label={`${t.game.animation}: ${game[lang].t}`} />
          <div className="hero-body">
            <h2>{game[lang].t}</h2>
            <p>{game[lang].d}</p>
            <div className="tags">
              <span className="tag">
                {game.min === 20 ? "20+" : game.min} {t.common.min}
              </span>
              <span className="tag">{game.places.map((p) => t.places[p]).slice(0, 2).join(" / ")}</span>
              {game.skills.slice(0, 2).map((s) => (
                <span className="tag" key={s}>
                  {t.skills[s]}
                </span>
              ))}
            </div>
            <div className="row" style={{ marginTop: 4 }}>
              <button type="button" className="btn" style={{ flex: 1 }} onClick={() => onOpen(game)}>
                {t.today.start}
              </button>
              <button type="button" className="icon-btn" style={{ color: "#2f6f66" }} onClick={onSwap} aria-label={t.today.swap}>
                <Icon name="swap" size={22} stroke={2} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <p>{t.today.noGame}</p>
        </div>
      )}

      <button type="button" className="link-card" onClick={onSearch}>
        <span className="ico" style={{ color: "#2f6f66" }}>
          <Icon name="search" size={22} stroke={2} />
        </span>
        <span>
          <span style={{ display: "block", fontSize: 16, fontWeight: 800 }}>{t.today.searchCta}</span>
          <span style={{ display: "block", fontSize: 13, color: "#4a5960" }}>{t.today.searchSub}</span>
        </span>
      </button>
    </div>
  );
}

function SearchScreen({
  lang,
  all,
  profile,
  onOpen,
  onGenerated,
}: {
  lang: Lang;
  all: Game[];
  profile: Profile;
  onOpen: (g: Game) => void;
  onGenerated: (g: Game) => void;
}) {
  const t = DICT[lang];
  const [f, setF] = useState<Filters>({
    kids: Math.min(4, Math.max(1, profile.kidAges.length)),
    ages: [...new Set(profile.kidAges)],
    places: profile.places,
    items: profile.items,
    minutes: profile.minutes,
    skills: profile.skills,
  });
  const [results, setResults] = useState<Game[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  function run() {
    setResults(searchGames(all, f));
    setError(false);
  }

  async function invent() {
    setBusy(true);
    setError(false);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters: f, lang }),
      });
      if (!res.ok) throw new Error("bad status");
      const data = (await res.json()) as { game?: Game };
      if (!data.game) throw new Error("no game");
      onGenerated(data.game);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="screen">
      <div>
        <h1>{t.search.title}</h1>
        <p className="sub" style={{ marginTop: 6 }}>
          {t.search.sub}
        </p>
      </div>

      <div className="section">
        <h2>{t.search.howMany}</h2>
        <div className="seg" role="group">
          {[1, 2, 3, 4].map((n) => (
            <button key={n} type="button" className={f.kids === n ? "on" : ""} aria-pressed={f.kids === n} onClick={() => setF({ ...f, kids: n })}>
              {n === 4 ? "4+" : n}
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <h2>{t.search.ages}</h2>
        <div className="chips">
          {AGE_OPTIONS.map((a) => (
            <Chip key={a} on={f.ages.includes(a)} onClick={() => setF({ ...f, ages: toggle(f.ages, a) })}>
              {a} {t.common.years}
            </Chip>
          ))}
        </div>
      </div>

      <div className="section">
        <h2>{t.search.where}</h2>
        <div className="chips">
          {PLACES.map((p) => (
            <Chip key={p} on={f.places.includes(p)} onClick={() => setF({ ...f, places: toggle<Place>(f.places, p) })}>
              {t.places[p]}
            </Chip>
          ))}
        </div>
      </div>

      <div className="section">
        <h2>{t.search.items}</h2>
        <div className="chips">
          {ITEMS.filter((i) => i !== "nothing").map((i) => (
            <Chip key={i} on={f.items.includes(i)} onClick={() => setF({ ...f, items: toggle<Item>(f.items, i) })}>
              {t.items[i]}
            </Chip>
          ))}
        </div>
      </div>

      <div className="section">
        <h2>{t.search.time}</h2>
        <MinutesPicker value={f.minutes} onChange={(m) => setF({ ...f, minutes: m })} unit={t.common.min} />
      </div>

      <div className="section">
        <h2>{t.search.skills}</h2>
        <div className="chips">
          {SKILLS.map((s) => (
            <Chip key={s} on={f.skills.includes(s)} onClick={() => setF({ ...f, skills: toggle<Skill>(f.skills, s) })}>
              {t.skills[s]}
            </Chip>
          ))}
        </div>
      </div>

      <button type="button" className="btn" onClick={run}>
        {t.search.go}
      </button>

      {results && (
        <div className="section" aria-live="polite">
          {results.length > 0 ? (
            <>
              <h2>
                {t.search.results} ({results.length})
              </h2>
              {results.slice(0, 8).map((g) => (
                <button key={g.id} type="button" className="item" onClick={() => onOpen(g)}>
                  <span className="tile" style={{ background: "#ddebe3", color: "#1f5a51" }}>
                    {g[lang].t.charAt(0)}
                  </span>
                  <span className="grow">
                    <span className="meta" style={{ display: "block" }}>
                      {g.min === 20 ? "20+" : g.min} {t.common.min} · {g.ages[0]}-{g.ages[1]} {t.common.years}
                    </span>
                    <span className="name" style={{ display: "block" }}>
                      {g[lang].t}
                    </span>
                    <span className="sk" style={{ display: "block" }}>
                      {g.skills.map((s) => t.skills[s]).join(", ")}
                    </span>
                  </span>
                </button>
              ))}
            </>
          ) : (
            <p className="sub">{t.search.noResults}</p>
          )}
        </div>
      )}

      <div className="note">
        <Icon name="sparkle" size={20} stroke={2} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
          <p style={{ color: "#3a3170", fontSize: 14 }}>{t.search.inventHint}</p>
          <button type="button" className="btn secondary" style={{ minHeight: 44 }} onClick={invent} disabled={busy}>
            {busy ? t.search.inventing : t.search.invent}
          </button>
          {error && <div className="error">{t.search.inventError}</div>}
        </div>
      </div>
    </div>
  );
}

function GameDetail({
  game,
  state,
  lang,
  onBack,
  onPlayed,
  onFav,
}: {
  game: Game;
  state: AppState;
  lang: Lang;
  onBack: () => void;
  onPlayed: () => void;
  onFav: () => void;
}) {
  const t = DICT[lang];
  const g = game[lang];
  const isFav = state.favs.includes(game.id);
  const played = state.played.includes(game.id);
  const materials = game.items.filter((i) => i !== "nothing");

  async function share() {
    const text = `${g.t}: ${g.d}`;
    try {
      if (navigator.share) await navigator.share({ title: g.t, text });
      else await navigator.clipboard.writeText(text);
    } catch {
      /* user cancelled */
    }
  }

  return (
    <div className="screen">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <button type="button" className="back" onClick={onBack}>
          <Icon name="back" size={22} stroke={2.2} />
          {t.common.back}
        </button>
        <button
          type="button"
          className="icon-btn"
          style={{ width: 44, height: 44, color: isFav ? "#2f6f66" : "#5b6a71" }}
          onClick={onFav}
          aria-label={isFav ? t.game.unfav : t.game.fav}
          aria-pressed={isFav}
        >
          <Icon name="heart" size={22} stroke={2} fill={isFav ? "#2f6f66" : "none"} />
        </button>
      </div>

      <Scene scene={game.scene} gameId={game.id} label={`${t.game.animation}: ${g.t}`} rounded={24} />

      <div>
        <h1>{g.t}</h1>
        <div className="tags" style={{ marginTop: 12 }}>
          <span className="tag" style={{ background: "#fbe3d3" }}>
            {game.min === 20 ? "20+" : game.min} {t.common.min}
          </span>
          <span className="tag" style={{ background: "#ddebe3" }}>
            {game.kids[0] === game.kids[1] ? game.kids[0] : `${game.kids[0]}-${game.kids[1]}`} {t.common.kids}
          </span>
          <span className="tag" style={{ background: "#d8e9f4" }}>
            {game.ages[0]}-{game.ages[1]} {t.common.years}
          </span>
          <span className="tag" style={{ background: "#faf0c8" }}>
            {game.places.map((p) => t.places[p]).join(" / ")}
          </span>
          {game.generated && (
            <span className="tag" style={{ background: "#e4e0f5" }}>
              {t.game.generated}
            </span>
          )}
        </div>
      </div>

      <div className="card">
        <h2>{t.game.needs}</h2>
        <p>{materials.length > 0 ? materials.map((i) => t.items[i]).join(", ") : t.game.nothingNeeded}</p>
      </div>

      <div className="card">
        <h2>{t.game.how}</h2>
        <div className="steps">
          {g.s.map((s, i) => (
            <div className="step" key={i}>
              <span className="n">{i + 1}</span>
              <p>{s}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>{t.game.trains}</h2>
        <div className="tags">
          {game.skills.map((s) => (
            <span key={s} className="tag" style={{ background: "#2f6f66", color: "#fff" }}>
              {t.skills[s]}
            </span>
          ))}
        </div>
      </div>

      <div className="variants">
        <div className="variant" style={{ background: "#ddebe3" }}>
          <b style={{ color: "#1f5a51" }}>{t.game.easier}</b>
          <p>{g.e}</p>
        </div>
        <div className="variant" style={{ background: "#faf0c8" }}>
          <b style={{ color: "#6b5410" }}>{t.game.harder}</b>
          <p>{g.h}</p>
        </div>
      </div>

      <div className="safety">
        <span style={{ color: "#8a4b2c", flex: "none", marginTop: 1 }}>
          <Icon name="warn" size={20} stroke={2} />
        </span>
        <p>{t.game.safety}</p>
      </div>

      <div className="row">
        <button type="button" className={"btn" + (played ? " done" : "")} style={{ flex: 1 }} onClick={onPlayed}>
          {played ? t.game.playedDone : t.game.played}
        </button>
        <button type="button" className="btn secondary" onClick={share}>
          {t.game.share}
        </button>
      </div>
    </div>
  );
}

function HistoryScreen({
  lang,
  state,
  today,
  onOpen,
  onFav,
}: {
  lang: Lang;
  state: AppState;
  today: string;
  onOpen: (g: Game) => void;
  onFav: (id: string) => void;
}) {
  const t = DICT[lang];
  const [view, setView] = useState<"last" | "favs">("last");
  const recent = recentIds(state.history, today);
  const entries = Object.entries(state.history)
    .filter(([date, id]) => date === today || recent.has(id))
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, id]) => ({ date, game: findGame(id, state.custom) }))
    .filter((e): e is { date: string; game: Game } => !!e.game);
  const favs = state.favs.map((id) => findGame(id, state.custom)).filter((g): g is Game => !!g);
  const tints = ["#fbe3d3", "#d8e9f4", "#faf0c8", "#ddebe3", "#e4e0f5"];

  const fmt = (date: string) => {
    if (date === today) return t.history.today;
    const d = new Date(date + "T00:00:00");
    return `${d.getDate()} ${t.months[d.getMonth()].slice(0, 3).toLowerCase()}`;
  };

  return (
    <div className="screen">
      <div>
        <h1>{t.history.title}</h1>
        <p className="sub" style={{ marginTop: 6 }}>
          {t.history.sub}
        </p>
      </div>

      <div className="seg" role="group">
        <button type="button" className={view === "last" ? "on" : ""} aria-pressed={view === "last"} onClick={() => setView("last")}>
          {t.history.last30}
        </button>
        <button type="button" className={view === "favs" ? "on" : ""} aria-pressed={view === "favs"} onClick={() => setView("favs")}>
          {t.history.favs}
        </button>
      </div>

      <div className="section">
        {view === "last" &&
          (entries.length === 0 ? (
            <p className="sub">{t.history.empty}</p>
          ) : (
            entries.map(({ date, game }, i) => (
              <div key={date} className="item">
                <button type="button" className="row" style={{ flex: 1, border: 0, background: "transparent", textAlign: "left", gap: 12, minWidth: 0 }} onClick={() => onOpen(game)}>
                  <span className="tile" style={{ background: tints[i % tints.length], color: "#26343b" }}>
                    {game[lang].t.charAt(0)}
                  </span>
                  <span className="grow">
                    <span className="meta" style={{ display: "block" }}>
                      {fmt(date)} · {game.min === 20 ? "20+" : game.min} {t.common.min}
                      {state.played.includes(game.id) ? ` · ${t.game.playedDone}` : ""}
                    </span>
                    <span className="name" style={{ display: "block" }}>
                      {game[lang].t}
                    </span>
                    <span className="sk" style={{ display: "block" }}>
                      {game.skills.map((s) => t.skills[s]).join(", ")}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  className="step-btn"
                  style={{ color: state.favs.includes(game.id) ? "#2f6f66" : "#5b6a71" }}
                  onClick={() => onFav(game.id)}
                  aria-label={state.favs.includes(game.id) ? t.game.unfav : t.game.fav}
                  aria-pressed={state.favs.includes(game.id)}
                >
                  <Icon name="heart" size={22} stroke={2} fill={state.favs.includes(game.id) ? "#2f6f66" : "none"} />
                </button>
              </div>
            ))
          ))}

        {view === "favs" &&
          (favs.length === 0 ? (
            <p className="sub">{t.history.emptyFavs}</p>
          ) : (
            favs.map((game, i) => (
              <div key={game.id} className="item">
                <button type="button" className="row" style={{ flex: 1, border: 0, background: "transparent", textAlign: "left", gap: 12, minWidth: 0 }} onClick={() => onOpen(game)}>
                  <span className="tile" style={{ background: tints[i % tints.length], color: "#26343b" }}>
                    {game[lang].t.charAt(0)}
                  </span>
                  <span className="grow">
                    <span className="meta" style={{ display: "block" }}>
                      {game.min === 20 ? "20+" : game.min} {t.common.min} · {game.ages[0]}-{game.ages[1]} {t.common.years}
                    </span>
                    <span className="name" style={{ display: "block" }}>
                      {game[lang].t}
                    </span>
                    <span className="sk" style={{ display: "block" }}>
                      {game.skills.map((s) => t.skills[s]).join(", ")}
                    </span>
                  </span>
                </button>
                <button type="button" className="step-btn" style={{ color: "#2f6f66" }} onClick={() => onFav(game.id)} aria-label={t.game.unfav} aria-pressed={true}>
                  <Icon name="heart" size={22} stroke={2} fill="#2f6f66" />
                </button>
              </div>
            ))
          ))}
      </div>
    </div>
  );
}

function FamilyScreen({ lang, profile, onSave }: { lang: Lang; profile: Profile; onSave: (p: Profile) => void }) {
  const t = DICT[lang];
  const [p, setP] = useState<Profile>(profile);
  const setAge = (i: number, delta: number) =>
    setP({ ...p, kidAges: p.kidAges.map((a, idx) => (idx === i ? Math.min(10, Math.max(2, a + delta)) : a)) });
  const profileItems = ITEMS.filter((i) => i !== "nothing");
  const dots = ["#fbe3d3", "#d8e9f4", "#faf0c8", "#ddebe3", "#e4e0f5", "#fbe3d3"];

  return (
    <div className="screen">
      <div>
        <h1>{t.family.title}</h1>
        <p className="sub" style={{ marginTop: 6 }}>
          {t.family.sub}
        </p>
      </div>

      <div className="section">
        <h2>{t.family.kids}</h2>
        {p.kidAges.map((age, i) => (
          <div className="kid-row" key={i}>
            <span className="dot" style={{ background: dots[i % dots.length] }}>
              {i + 1}
            </span>
            <span style={{ flex: 1, fontSize: 16, fontWeight: 700 }}>
              {t.common.kid} {i + 1}
            </span>
            <button type="button" className="step-btn" style={{ color: "#2f6f66" }} onClick={() => setAge(i, -1)} aria-label={`${t.common.kid} ${i + 1}: -1`}>
              <Icon name="minus" size={18} stroke={2.4} />
            </button>
            <span style={{ minWidth: 64, textAlign: "center", fontSize: 16, fontWeight: 800 }}>
              {age} {t.common.years}
            </span>
            <button type="button" className="step-btn" style={{ color: "#2f6f66" }} onClick={() => setAge(i, 1)} aria-label={`${t.common.kid} ${i + 1}: +1`}>
              <Icon name="plus" size={18} stroke={2.4} />
            </button>
          </div>
        ))}
        {p.kidAges.length < 6 && (
          <button type="button" className="dashed-btn" onClick={() => setP({ ...p, kidAges: [...p.kidAges, 4] })}>
            <Icon name="plus" size={18} stroke={2.4} />
            {t.common.addKid}
          </button>
        )}
        {p.kidAges.length > 1 && (
          <button type="button" className="dashed-btn" style={{ borderColor: "#e3c9bd", color: "#8a4b2c" }} onClick={() => setP({ ...p, kidAges: p.kidAges.slice(0, -1) })}>
            <Icon name="minus" size={18} stroke={2.4} />
            {t.common.removeKid}
          </button>
        )}
      </div>

      <div className="section">
        <h2>{t.family.where}</h2>
        <div className="chips">
          {PLACES.map((x) => (
            <Chip key={x} on={p.places.includes(x)} onClick={() => setP({ ...p, places: toggle<Place>(p.places, x) })}>
              {t.places[x]}
            </Chip>
          ))}
        </div>
      </div>

      <div className="section">
        <h2>{t.family.items}</h2>
        <div className="chips">
          {profileItems.map((x) => (
            <Chip key={x} on={p.items.includes(x)} onClick={() => setP({ ...p, items: toggle<Item>(p.items, x) })}>
              {t.items[x]}
            </Chip>
          ))}
        </div>
      </div>

      <div className="section">
        <h2>{t.family.skills}</h2>
        <div className="chips">
          {SKILLS.map((x) => (
            <Chip key={x} on={p.skills.includes(x)} onClick={() => setP({ ...p, skills: toggle<Skill>(p.skills, x) })}>
              {t.skills[x]}
            </Chip>
          ))}
        </div>
      </div>

      <div className="section">
        <h2>{t.family.time}</h2>
        <MinutesPicker value={p.minutes} onChange={(m) => setP({ ...p, minutes: m })} unit={t.common.min} />
      </div>

      <button type="button" className="btn" onClick={() => onSave({ ...p, items: [...p.items] })}>
        {t.common.save}
      </button>
    </div>
  );
}
