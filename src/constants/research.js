// Define research nodes (title, desc, max, cost curve) and tracks
export const RESEARCH_NODES = {
  tapPower:    { track: "Tap",     title: "Sharp Teeth",        desc: "+1 food per tap / lvl",       max: 10, costs: [1,2,3,4,5,6,7,8,9,10] },
  critChance:  { track: "Tap",     title: "Critical Instincts", desc: "+2% crit chance / lvl",       max: 10, costs: [2,3,4,5,6,7,8,9,10,11] },

  cpsPower:    { track: "CPS",     title: "Efficient Feeders",  desc: "+1 CPS / lvl",                max: 10, costs: [1,2,3,4,5,6,7,8,9,10] },
  cpsMulti:    { track: "CPS",     title: "Industrial Line",    desc: "+10% CPS mult / lvl",         max: 5,  costs: [3,4,5,6,7] },

  comboStep:   { track: "Utility", title: "Combo Mastery",      desc: "+0.01 combo step / lvl",      max: 5,  costs: [1,2,3,4,5] },
  boostDuration:{track: "Utility", title: "Longer Boosts",      desc: "+5s boost duration / lvl",    max: 6,  costs: [2,3,4,5,6,7] },
};

export const RESEARCH_TRACKS = ["Tap", "CPS", "Utility"];

export const researchCostFor = (key, level) => {
  const node = RESEARCH_NODES[key];
  if (!node) return Infinity;
  if (level >= node.max) return Infinity;
  return node.costs[level] ?? node.costs[node.costs.length - 1];
};
