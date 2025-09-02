import defs from '../data/research.json';

export const RESEARCH_NODES = defs;
export const RESEARCH_TRACKS = Array.from(new Set(Object.values(defs).map((d) => d.track)));

export const researchCostFor = (key, level) => {
  const node = defs[key];
  if (!node) return Infinity;
  if (level >= node.max) return Infinity;
  return node.costs[level] ?? node.costs[node.costs.length - 1];
};