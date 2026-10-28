import type { Item, Lang, Place, Skill } from "./types";

export const PLACES: Place[] = ["living", "bedroom", "kitchen", "garden", "park"];
export const ITEMS: Item[] = [
  "cushions",
  "boxes",
  "balloons",
  "paper",
  "tape",
  "pots",
  "ball",
  "blanket",
  "rope",
  "chalk",
  "socks",
  "nothing",
];
export const SKILLS: Skill[] = [
  "motor",
  "problem",
  "reflection",
  "collaboration",
  "creativity",
  "language",
];

type Dict = {
  app: string;
  tabs: { today: string; search: string; history: string; family: string };
  today: {
    title: string;
    start: string;
    swap: string;
    searchCta: string;
    searchSub: string;
    noGame: string;
  };
  common: {
    min: string;
    kids: string;
    fromAge: string;
    save: string;
    saved: string;
    back: string;
    ages: string;
    years: string;
    kid: string;
    addKid: string;
    removeKid: string;
  };
  family: { title: string; sub: string; kids: string; where: string; items: string; skills: string; time: string };
  search: {
    title: string;
    sub: string;
    howMany: string;
    ages: string;
    where: string;
    items: string;
    time: string;
    skills: string;
    go: string;
    inventHint: string;
    results: string;
    noResults: string;
    invent: string;
    inventing: string;
    inventError: string;
    anyAge: string;
  };
  game: {
    needs: string;
    how: string;
    trains: string;
    easier: string;
    harder: string;
    safety: string;
    played: string;
    playedDone: string;
    fav: string;
    unfav: string;
    share: string;
    nothingNeeded: string;
    animation: string;
    generated: string;
  };
  history: { title: string; sub: string; last30: string; favs: string; empty: string; emptyFavs: string; planned: string; today: string };
  places: Record<Place, string>;
  items: Record<Item, string>;
  skills: Record<Skill, string>;
  months: string[];
  days: string[];
};

export const DICT: Record<Lang, Dict> = {
  it: {
    app: "Parents Supporter",
    tabs: { today: "Oggi", search: "Cerca", history: "Storico", family: "Famiglia" },
    today: {
      title: "Il gioco di oggi",
      start: "Vedi come si gioca",
      swap: "Proponimi un altro gioco",
      searchCta: "Cerca un altro gioco",
      searchSub: "Scegli tempo, luogo, materiali e abilità",
      noGame: "Nessun gioco disponibile per il tuo profilo. Prova a cambiare luogo o materiali.",
    },
    common: {
      min: "min",
      kids: "bambini",
      fromAge: "Da",
      save: "Salva profilo",
      saved: "Profilo salvato",
      back: "Indietro",
      ages: "Età",
      years: "anni",
      kid: "Bambino",
      addKid: "Aggiungi un bambino",
      removeKid: "Rimuovi",
    },
    family: {
      title: "Profilo famiglia",
      sub: "Servono per proporti ogni giorno giochi adatti a voi. I dati restano sul tuo dispositivo.",
      kids: "Bambini",
      where: "Dove giocate di solito",
      items: "Cosa hai in casa",
      skills: "Abilità da allenare",
      time: "Quanto tempo hai di solito",
    },
    search: {
      title: "Cerca un gioco",
      sub: "Parti dal tuo profilo e cambia solo quello che ti serve oggi.",
      howMany: "Quanti bambini giocano",
      ages: "Età",
      where: "Dove giocate",
      items: "Cosa hai a disposizione",
      time: "Durata",
      skills: "Abilità da allenare",
      go: "Trova un gioco",
      inventHint: "Nessun gioco perfetto per questa combinazione? Ne invento uno nuovo per voi.",
      results: "Giochi trovati",
      noResults: "Nessun gioco della libreria corrisponde a questa combinazione.",
      invent: "Inventa un gioco nuovo",
      inventing: "Sto inventando un gioco...",
      inventError: "Non sono riuscito a inventare un gioco adesso. Riprova tra poco.",
      anyAge: "Altra età",
    },
    game: {
      needs: "Cosa ti serve",
      how: "Come si gioca",
      trains: "Cosa allena",
      easier: "Più facile",
      harder: "Più difficile",
      safety: "Controlla che non ci siano spigoli vicini e che il pavimento non sia scivoloso. Gioca sempre con un adulto accanto.",
      played: "Abbiamo giocato",
      playedDone: "Giocato",
      fav: "Aggiungi ai preferiti",
      unfav: "Rimuovi dai preferiti",
      share: "Condividi",
      nothingNeeded: "Nessun materiale: bastate voi.",
      animation: "Animazione del gioco",
      generated: "Inventato per voi",
    },
    history: {
      title: "Storico e preferiti",
      sub: "Un gioco non si ripete prima di 30 giorni, così c'è sempre qualcosa di nuovo.",
      last30: "Ultimi 30 giorni",
      favs: "Preferiti",
      empty: "Qui appariranno i giochi che ti propongo ogni giorno.",
      emptyFavs: "Tocca il cuore su un gioco per ritrovarlo qui.",
      planned: "Proposto",
      today: "Oggi",
    },
    places: { living: "Salotto", bedroom: "Cameretta", kitchen: "Cucina", garden: "Giardino", park: "Parco" },
    items: {
      cushions: "Cuscini",
      boxes: "Scatole",
      balloons: "Palloncini",
      paper: "Carta e colori",
      tape: "Nastro adesivo",
      pots: "Pentole e mestoli",
      ball: "Palla",
      blanket: "Coperta",
      rope: "Corda",
      chalk: "Gessetti",
      socks: "Calzini",
      nothing: "Niente",
    },
    skills: {
      motor: "Motricità",
      problem: "Problem solving",
      reflection: "Riflessione",
      collaboration: "Collaborazione",
      creativity: "Creatività",
      language: "Linguaggio",
    },
    months: ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"],
    days: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"],
  },
  en: {
    app: "Parents Supporter",
    tabs: { today: "Today", search: "Search", history: "History", family: "Family" },
    today: {
      title: "Today's game",
      start: "See how to play",
      swap: "Suggest another game",
      searchCta: "Find another game",
      searchSub: "Pick time, place, materials and skills",
      noGame: "No game available for your profile. Try changing place or materials.",
    },
    common: {
      min: "min",
      kids: "children",
      fromAge: "From",
      save: "Save profile",
      saved: "Profile saved",
      back: "Back",
      ages: "Age",
      years: "years",
      kid: "Child",
      addKid: "Add a child",
      removeKid: "Remove",
    },
    family: {
      title: "Family profile",
      sub: "These help me suggest games that suit you every day. Your data stays on your device.",
      kids: "Children",
      where: "Where you usually play",
      items: "What you have at home",
      skills: "Skills to train",
      time: "How much time you usually have",
    },
    search: {
      title: "Find a game",
      sub: "Start from your profile and change only what you need today.",
      howMany: "How many children are playing",
      ages: "Age",
      where: "Where you play",
      items: "What you have",
      time: "Duration",
      skills: "Skills to train",
      go: "Find a game",
      inventHint: "No perfect game for this combination? I'll invent a new one for you.",
      results: "Games found",
      noResults: "No game in the library matches this combination.",
      invent: "Invent a new game",
      inventing: "Inventing a game...",
      inventError: "I couldn't invent a game right now. Please try again shortly.",
      anyAge: "Other age",
    },
    game: {
      needs: "What you need",
      how: "How to play",
      trains: "What it trains",
      easier: "Easier",
      harder: "Harder",
      safety: "Check there are no sharp corners nearby and that the floor isn't slippery. Always play with an adult close by.",
      played: "We played it",
      playedDone: "Played",
      fav: "Add to favorites",
      unfav: "Remove from favorites",
      share: "Share",
      nothingNeeded: "No materials: just you two.",
      animation: "Game animation",
      generated: "Invented for you",
    },
    history: {
      title: "History and favorites",
      sub: "A game won't repeat within 30 days, so there's always something new.",
      last30: "Last 30 days",
      favs: "Favorites",
      empty: "The games I suggest each day will show up here.",
      emptyFavs: "Tap the heart on a game to find it here.",
      planned: "Suggested",
      today: "Today",
    },
    places: { living: "Living room", bedroom: "Bedroom", kitchen: "Kitchen", garden: "Garden", park: "Park" },
    items: {
      cushions: "Cushions",
      boxes: "Boxes",
      balloons: "Balloons",
      paper: "Paper and colors",
      tape: "Tape",
      pots: "Pots and spoons",
      ball: "Ball",
      blanket: "Blanket",
      rope: "Rope",
      chalk: "Chalk",
      socks: "Socks",
      nothing: "Nothing",
    },
    skills: {
      motor: "Motor skills",
      problem: "Problem solving",
      reflection: "Reflection",
      collaboration: "Collaboration",
      creativity: "Creativity",
      language: "Language",
    },
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  },
};
