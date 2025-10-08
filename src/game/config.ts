export type GeneratorDef = {
  id: string;
  name: string;
  baseCost: number;
  costMult: number; // cost increase per purchase
  baseRate: number; // energy/sec per unit
  unlockAt?: number; // energy needed to show
};

export type EffectMultiplierTarget = "click" | "all" | string;

export type MultiplierEffect = {
  kind: "multiplier";
  target: EffectMultiplierTarget;
  value: number;
};

export type PrestigeBoostEffect = {
  kind: "prestigeBoost";
  value: number;
};

export type AutoBuyerEffect = {
  kind: "autoBuyer";
  target: string;
  interval: number;
  label: string;
  description: string;
};

export type Effect = MultiplierEffect | PrestigeBoostEffect | AutoBuyerEffect;

export type UpgradeDef = {
  id: string;
  name: string;
  description: string;
  cost: number;
  unlockAt?: number;
  effects: Effect[];
};

export type MilestoneDef = {
  id: string;
  name: string;
  description: string;
  threshold: number;
  effects: Effect[];
};

export const GENERATORS: GeneratorDef[] = [
  { id: "click", name: "Manual Tap", baseCost: 0, costMult: 1, baseRate: 0, unlockAt: 0 }, // special: click-only
  { id: "spark", name: "Spark", baseCost: 10, costMult: 1.15, baseRate: 0.1, unlockAt: 0 },
  { id: "coil", name: "Coil", baseCost: 120, costMult: 1.16, baseRate: 1.25, unlockAt: 50 },
  { id: "reactor", name: "Reactor", baseCost: 1_800, costMult: 1.18, baseRate: 12, unlockAt: 450 },
  { id: "forge", name: "Forge", baseCost: 12_000, costMult: 1.2, baseRate: 65, unlockAt: 3_000 },
  { id: "singularity", name: "Singularity", baseCost: 150_000, costMult: 1.22, baseRate: 380, unlockAt: 20_000 },
  { id: "quantum", name: "Quantum Core", baseCost: 2_000_000, costMult: 1.24, baseRate: 2_400, unlockAt: 150_000 },
  { id: "nebula", name: "Nebula Loom", baseCost: 25_000_000, costMult: 1.26, baseRate: 15_000, unlockAt: 1_000_000 },
  { id: "ascension", name: "Ascension Gate", baseCost: 350_000_000, costMult: 1.28, baseRate: 110_000, unlockAt: 8_000_000 },
];

export const UPGRADES: UpgradeDef[] = [
  {
    id: "focused-tap",
    name: "Focused Tap",
    description: "Double the energy gained from manual tapping. Persists through prestige.",
    cost: 100,
    unlockAt: 50,
    effects: [{ kind: "multiplier", target: "click", value: 2 }],
  },
  {
    id: "resonant-sparks",
    name: "Resonant Sparks",
    description: "Sparks generate twice as much energy.",
    cost: 400,
    unlockAt: 250,
    effects: [{ kind: "multiplier", target: "spark", value: 2 }],
  },
  {
    id: "overclocked-grid",
    name: "Overclocked Grid",
    description: "Boost all generators by 50%.",
    cost: 2_500,
    unlockAt: 1_500,
    effects: [{ kind: "multiplier", target: "all", value: 1.5 }],
  },
  {
    id: "quantum-supervisor",
    name: "Quantum Supervisor",
    description: "Unlock an auto-buyer that purchases Sparks every few seconds.",
    cost: 12_000,
    unlockAt: 8_000,
    effects: [
      {
        kind: "autoBuyer",
        target: "spark",
        interval: 4,
        label: "Spark Overseer",
        description: "Automatically buys a Spark every 4s if affordable.",
      },
      { kind: "multiplier", target: "spark", value: 1.25 },
    ],
  },
  {
    id: "stellar-circuitry",
    name: "Stellar Circuitry",
    description: "Manual tapping feeds the grid, adding +1 virtual prestige point to production.",
    cost: 30_000,
    unlockAt: 20_000,
    effects: [{ kind: "prestigeBoost", value: 1 }],
  },
];

export const MILESTONES: MilestoneDef[] = [
  {
    id: "milestone-first-loop",
    name: "First Resonance",
    description: "Reach 500 total energy to harden the ring, granting +25% generator output.",
    threshold: 500,
    effects: [{ kind: "multiplier", target: "all", value: 1.25 }],
  },
  {
    id: "milestone-shimmer",
    name: "Shimmer of Infinity",
    description: "Accumulate 5,000 total energy to empower prestige by +1.",
    threshold: 5_000,
    effects: [{ kind: "prestigeBoost", value: 1 }],
  },
  {
    id: "milestone-automation",
    name: "Automation Protocol",
    description: "Hit 25,000 total energy to unlock an auto-buyer for Coils.",
    threshold: 25_000,
    effects: [
      {
        kind: "autoBuyer",
        target: "coil",
        interval: 6,
        label: "Coil Steward",
        description: "Automatically buys a Coil every 6s if affordable.",
      },
    ],
  },
  {
    id: "milestone-stellar-forge",
    name: "Stellar Forge",
    description: "Forge 150,000 total energy to supercharge late-game structures by 40%.",
    threshold: 150_000,
    effects: [
      { kind: "multiplier", target: "reactor", value: 1.4 },
      { kind: "multiplier", target: "forge", value: 1.4 },
      { kind: "multiplier", target: "singularity", value: 1.4 },
      { kind: "multiplier", target: "quantum", value: 1.4 },
    ],
  },
  {
    id: "milestone-constellation",
    name: "Constellation Architects",
    description: "Harness 1,000,000 total energy to unlock a Nebula Loom auto-buyer and +50% tap power.",
    threshold: 1_000_000,
    effects: [
      {
        kind: "autoBuyer",
        target: "nebula",
        interval: 12,
        label: "Nebula Caretaker",
        description: "Automatically buys a Nebula Loom every 12s if affordable.",
      },
      { kind: "multiplier", target: "click", value: 1.5 },
    ],
  },
];

export const CLICK_BASE_GAIN = 1; // energy per click
export const PRESTIGE_REQ = 100_000; // min energy for prestige
export const PRESTIGE_CONVERT = (energy: number) => Math.floor(Math.sqrt(energy / 1000));
export const SAVE_KEY = "idle-ring-save-v1";

export const AUTO_BUYER_CONFIG = (() => {
  const allEffects = [...UPGRADES, ...MILESTONES]
    .flatMap(def => def.effects)
    .filter((effect): effect is AutoBuyerEffect => effect.kind === "autoBuyer");
  const map = new Map<string, AutoBuyerEffect>();
  for (const effect of allEffects) {
    if (!map.has(effect.target)) {
      map.set(effect.target, effect);
    }
  }
  return map;
})();

  