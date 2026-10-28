import { DEFAULT_PROFILE } from "./pick";
import type { AppState, Lang } from "./types";

const KEY = "parents-supporter:v1";

export function defaultState(lang: Lang = "it"): AppState {
  return {
    lang,
    profile: DEFAULT_PROFILE,
    history: {},
    played: [],
    favs: [],
    custom: [],
  };
}

export function loadState(): AppState {
  const fallbackLang: Lang =
    typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("en") ? "en" : "it";
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState(fallbackLang);
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const base = defaultState(fallbackLang);
    return {
      ...base,
      ...parsed,
      profile: { ...base.profile, ...(parsed.profile ?? {}) },
      history: parsed.history ?? {},
      played: parsed.played ?? [],
      favs: parsed.favs ?? [],
      custom: parsed.custom ?? [],
    };
  } catch {
    return defaultState(fallbackLang);
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage may be unavailable (private mode); the app still works for this session */
  }
}
