// Centralized theming with a dynamic proxy.
// Components can keep importing { colors } and they'll pick up the active theme.

const DARK = {
  name: "dark",
  bg: "#230356ff",
  card: "#111827",
  surface: "#0b1220",
  text: "#e5e7eb",
  textDim: "#94a3b8",
  primary: "#6366f1", // indigo
  info: "#60a5fa",
  border: "#1f2937",
  track: "#0b1220",
  textUnlocked: '#86efac',
  button: '#25ec6eff',
  bar: '#25ec6eff',
};

const LOFI = {
  name: "lofi",
  bg: "#F4EEE0",       // paper
  card: "#E9E0D1",     // cardstock
  surface: "#E2D6C3",  // panel
  text: "#3b2f2f",     // coffee ink
  textDim: "#6b5e53",
  primary: "#7C6A46",  // warm coffee accent
  info: "#8B7E74",
  border: "#D6C7B2",
  track: "#DCCFBC",
  textUnlocked: '#625454ff',
  button: '#a89898ff',
  bar: '#8abfffff',
};

export const THEMES = { dark: DARK, lofi: LOFI };

let currentTheme = "dark";

export function setTheme(name) {
  currentTheme = THEMES[name] ? name : "dark";
}

export function themeName() {
  return currentTheme;
}

// Dynamic proxy so reads like colors.bg always reflect currentTheme.
export const colors = new Proxy({}, {
  get(_, key) {
    const theme = THEMES[currentTheme] || DARK;
    return theme[key];
  },
});
