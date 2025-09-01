export const ARTIFACTS = {
    toothyCharm: {
        id: 'toothyCharm',
        name: 'Toothy charm',
        desc: '+1 food per tap (stacks)',
        type: 'flatTap', 
        value: 1,
    },
    luckyPaw: {
        id: 'luckyPaw',
        name: 'Lucky paw',
        desc: '+5% crit chance (caps at +20% from artifacts)',
        type: 'critChance',
        value: 0.05, 
        cap: 0.20,
    },
    comboFeather: {
        id: 'comboFeather',
        name: 'Combo feather',
        desc: '+0.02 combo step',
        type: 'comboStep',
        value: 0.02,
    },
    clockworkFeeder: {
        id: 'clockworkFeeder',
        name: 'Clockwork feeder',
        desc: '+10% CPS',
        type: 'cpsMult',
        value: 0.10,
    },
    frenzyHorn: {
        id: 'frenzyHorn',
        name: 'Frenzy horn',
        desc: '+15% frenzy multiplier',
        type: 'frenzyMult',
        value: 0.15,
    },
    bossTotem: {
        id: 'bossTotem',
        name: 'Boss totem',
        desc: '-10% boss HP',
        type: 'bossHpMinus',
        value: 0.10,
    },
};

export const ARTIFACTS_IDS = Object.keys(ARTIFACTS);

export function summarizeArtifacts(equiped = []) {
    const sum = { flatTap: 0, critChance: 0, comboStep: 0, cpsMult: 0, frenzyMult: 0, bossHpMinus: 0 };
    for (const id of equiped) {
        const a = ARTIFACTS[id];
        if (!a) continue;
        sum[a.type] += a.value;
        if (a.type === 'critChance' && a.cap) sum.critChance = Math.min(sum.critChance, a.cap);
    }
    return sum;
}