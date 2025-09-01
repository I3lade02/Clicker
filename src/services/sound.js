import { createAudioPlayer, setAudioModeAsync } from "expo-audio";

const manifest = {
  tap:       require("../../assets/sfx/tap.wav"),  
  crit:      require("../../assets/sfx/crit.mp3"),
  evolve:    require("../../assets/sfx/evolve.mp3"),
  frenzy:    require("../../assets/sfx/frenzy.mp3"),
  bossStart: require("../../assets/sfx/boss_start.mp3"),
  bossWin:   require("../../assets/sfx/boss_win.mp3"),
  bossFail:  require("../../assets/sfx/boss_fail.mp3"),
  purchase:  require("../../assets/sfx/purchase.mp3"),
};

const POOL_SIZE = { tap: 3, crit: 2, purchase: 2, default: 1 };

let players = {};
let cursors = {};
let initPromise = null;
let volume = 1;

async function ensureLoaded() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    // Enable playback under iOS silent switch
    try { await setAudioModeAsync({ playsInSilentMode: true }); } catch {}

    // Create players (pool) per sound key
    for (const [key, src] of Object.entries(manifest)) {
      const size = POOL_SIZE[key] || POOL_SIZE.default;
      players[key] = Array.from({ length: size }, () => {
        const p = createAudioPlayer(src);
        try { p.volume = volume; } catch {}
        return p;
      });
      cursors[key] = 0;
    }
  })();
  return initPromise;
}

function playFromPoolSync(key) {
  const pool = players[key];
  if (!pool || pool.length === 0) {
    if (__DEV__) console.warn(`[SFX] No player for key "${key}"`);
    return;
  }
  const i = (cursors[key] = (cursors[key] + 1) % pool.length);
  const p = pool[i];
  try {
    try { p.volume = volume; } catch {}
    p.seekTo(0);
    p.play();
  } catch (e) {
    if (__DEV__) console.warn(`[SFX] play failed for "${key}":`, e?.message || e);
  }
}

export const SFX = {
  tap:       () => ensureLoaded().then(() => playFromPoolSync("tap")),
  crit:      () => ensureLoaded().then(() => playFromPoolSync("crit")),
  evolve:    () => ensureLoaded().then(() => playFromPoolSync("evolve")),
  frenzy:    () => ensureLoaded().then(() => playFromPoolSync("frenzy")),
  bossStart: () => ensureLoaded().then(() => playFromPoolSync("bossStart")),
  bossWin:   () => ensureLoaded().then(() => playFromPoolSync("bossWin")),
  bossFail:  () => ensureLoaded().then(() => playFromPoolSync("bossFail")),
  purchase:  () => ensureLoaded().then(() => playFromPoolSync("purchase")),
  setVolume: (v) => {
    volume = Math.max(0, Math.min(1, v ?? 0));
    //Update existing players as well
    Object.values(players).forEach(pool => 
        pool?.forEach(p => { try { p.volume = volume; } catch {} })
    );
  },
  getVolume: () => volume,

  // Optional: quick self-test you can call from anywhere (e.g., a temporary button)
  __debugTest: async () => {
    await ensureLoaded();
    const keys = Object.keys(manifest);
    let i = 0;
    const tick = () => {
      if (i >= keys.length) return;
      const k = keys[i++];
      playFromPoolSync(k);
      setTimeout(tick, 350);
    };
    tick();
  },
};
