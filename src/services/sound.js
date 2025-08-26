import { Audio } from 'expo-av';

let sounds = {};
let loaded = false;

const manifest = {
    tap: require('../../assets/sfx/tap.mp3'),
    crit: require('../../assets/sfx/crit.mp3'),
    evolve: require('../../assets/sfx/evolve.mp3'),
    frenzy: require('../../assets/sfx/frenzy.mp3'),
    bossStart: require('../../assets/sfx/boss_start.mp3'),
    bossWin: require('../../assets/sfx/boss_win.mp3'),
    bossFail: require('../../assets/sfx/boss_fail.mp3'),
    purchase: require('../../assets/sfx/purchase.mp3'),
};

async function ensureLoaded() {
    if (loaded) return;
    await Audio.setAudioModeAsync({ playsInSiletModeAndroid: true });
    const entries = Object.entries(manifest);
    for (const [key, mod] of entries) {
        const sound = new Audio.Sound();
        try {
            await sound.loadAsync(mod);
            sounds[key] = sound;
        } catch (e) {
            //ignore load error to avoid crashing
        }
    }
    loaded = true;
}

async function play(key) {
    try {
        await ensureLoaded();
        const s = sounds[key];
        if (!s) return;
        await s.replayAsync();
    } catch {}
}

export const SFX = {
  tap: () => play("tap"),
  crit: () => play("crit"),
  evolve: () => play("evolve"),
  frenzy: () => play("frenzy"),
  bossStart: () => play("bossStart"),
  bossWin: () => play("bossWin"),
  bossFail: () => play("bossFail"),
  purchase: () => play("purchase"),
};