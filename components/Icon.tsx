const PATHS: Record<string, string> = {
  today: "M4 8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3zM8 3v4M16 3v4M4 10h16",
  search: "M17 11a6 6 0 1 1-12 0 6 6 0 0 1 12 0zM20 20l-4.5-4.5",
  heart: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z",
  family: "M12 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM19.5 9a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM3 19c0-3.3 2.7-5 6-5s6 1.7 6 5M15 14.2c3 0 6 1.2 6 4.8",
  check: "M5 12.5l4.5 4.5L19 7",
  plus: "M12 6v12M6 12h12",
  minus: "M6 12h12",
  back: "M15 5l-7 7 7 7",
  swap: "M4 12a8 8 0 0 1 13.5-5.8L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.5 5.8L4 15.5M4 20v-4.5h4.5",
  sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z",
  warn: "M12 3l9 16H3zM12 10v4M12 17h.01",
  share: "M12 4v11M8 8l4-4 4 4M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4",
  user: "M12 8.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0zM5 20c0-4 3-6 7-6s7 2 7 6",
};

export function Icon({
  name,
  size = 24,
  stroke = 1.9,
  fill = "none",
}: {
  name: keyof typeof PATHS | string;
  size?: number;
  stroke?: number;
  fill?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
