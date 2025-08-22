export const BIOMES = [
  { key: "Forest", emoji: "🌲" },
  { key: "Arctic", emoji: "🧊" },
  { key: "Jungle", emoji: "🌿" }
];

// Animals are ordered; lastInBiome marks biome completion thresholds.
export const ANIMALS = [
  { name: "Bunny",   emoji: "🐰", biome: "Forest" },
  { name: "Fox",     emoji: "🦊", biome: "Forest", lastInBiome: true },

  { name: "Penguin", emoji: "🐧", biome: "Arctic" },
  { name: "Polar Bear", emoji: "🐻‍❄️", biome: "Arctic", lastInBiome: true },

  { name: "Panda",   emoji: "🐼", biome: "Jungle" },
  { name: "Tiger",   emoji: "🐯", biome: "Jungle", lastInBiome: true }
];
