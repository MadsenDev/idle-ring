export type GeneratorDef = {
  id: string;
  name: string;
  baseCost: number;
  costMult: number; // cost increase per purchase
  baseRate: number; // insight/sec per unit
  unlockAt?: number; // insight needed to show
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
  { id: "click", name: "Manual Solve", baseCost: 0, costMult: 1, baseRate: 0, unlockAt: 0 }, // special: click-only
  { id: "spark", name: "Counting Bead", baseCost: 10, costMult: 1.15, baseRate: 0.1, unlockAt: 0 },
  { id: "coil", name: "Abacus Row", baseCost: 120, costMult: 1.16, baseRate: 1.25, unlockAt: 50 },
  { id: "reactor", name: "Equation Engine", baseCost: 1_800, costMult: 1.18, baseRate: 12, unlockAt: 450 },
  { id: "forge", name: "Proof Forge", baseCost: 12_000, costMult: 1.2, baseRate: 65, unlockAt: 3_000 },
  { id: "singularity", name: "Logic Nexus", baseCost: 150_000, costMult: 1.22, baseRate: 380, unlockAt: 20_000 },
  { id: "quantum", name: "Tensor Core", baseCost: 2_000_000, costMult: 1.24, baseRate: 2_400, unlockAt: 150_000 },
  { id: "nebula", name: "Fractal Loom", baseCost: 25_000_000, costMult: 1.26, baseRate: 15_000, unlockAt: 1_000_000 },
  { id: "ascension", name: "Theorem Gate", baseCost: 350_000_000, costMult: 1.28, baseRate: 110_000, unlockAt: 8_000_000 },
  { id: "orbital", name: "Lemma Assembly", baseCost: 5_000_000_000, costMult: 1.3, baseRate: 800_000, unlockAt: 120_000_000 },
  { id: "void", name: "Concept Beacon", baseCost: 80_000_000_000, costMult: 1.32, baseRate: 5_800_000, unlockAt: 1_200_000_000 },
  { id: "rift", name: "Topology Engine", baseCost: 1_200_000_000_000, costMult: 1.34, baseRate: 42_000_000, unlockAt: 20_000_000_000 },
  { id: "aether", name: "Calculus Spire", baseCost: 18_000_000_000_000, costMult: 1.36, baseRate: 320_000_000, unlockAt: 350_000_000_000 },
  { id: "nova", name: "Algorithm Crucible", baseCost: 270_000_000_000_000, costMult: 1.38, baseRate: 2_500_000_000, unlockAt: 5_000_000_000_000 },
  { id: "cosmic", name: "Research Observatory", baseCost: 4_000_000_000_000_000, costMult: 1.4, baseRate: 19_000_000_000, unlockAt: 80_000_000_000_000 },
  { id: "eternity", name: "Convergence Anchor", baseCost: 60_000_000_000_000_000, costMult: 1.42, baseRate: 150_000_000_000, unlockAt: 1_200_000_000_000_000 },
  { id: "infinity", name: "Infinity Prism", baseCost: 900_000_000_000_000_000, costMult: 1.44, baseRate: 1_200_000_000_000, unlockAt: 18_000_000_000_000_000 },
  { id: "paradox", name: "Paradox Resolver", baseCost: 14_000_000_000_000_000_000, costMult: 1.46, baseRate: 9_500_000_000_000, unlockAt: 280_000_000_000_000_000 },
  { id: "omega", name: "Omega Archive", baseCost: 2_500_000_000_000_000_000_000, costMult: 1.48, baseRate: 75_000_000_000_000, unlockAt: 4_500_000_000_000_000_000 },
  { id: "dc", name: "Decillion Lectern", baseCost: 3e33, costMult: 1.5, baseRate: 650_000_000_000_000, unlockAt: 7e30 },
];

export const UPGRADES: UpgradeDef[] = [
  {
    id: "focused-tap",
    name: "Focused Study",
    description: "Double the insight gained from manual solving. Persists through prestige.",
    cost: 100,
    unlockAt: 50,
    effects: [{ kind: "multiplier", target: "click", value: 2 }],
  },
  {
    id: "resonant-sparks",
    name: "Rhythmic Counting",
    description: "Counting Beads generate twice as much insight.",
    cost: 400,
    unlockAt: 250,
    effects: [{ kind: "multiplier", target: "spark", value: 2 }],
  },
  {
    id: "overclocked-grid",
    name: "Structured Syllabus",
    description: "Boost all constructs by 50%.",
    cost: 2_500,
    unlockAt: 1_500,
    effects: [{ kind: "multiplier", target: "all", value: 1.5 }],
  },
  {
    id: "quantum-supervisor",
    name: "Bead Instructor",
    description: "Unlock an auto-buyer that purchases Counting Beads every few seconds.",
    cost: 12_000,
    unlockAt: 8_000,
    effects: [
      {
        kind: "autoBuyer",
        target: "spark",
        interval: 4,
        label: "Bead Instructor",
        description: "Automatically buys a Counting Bead every 4s if affordable.",
      },
      { kind: "multiplier", target: "spark", value: 1.25 },
    ],
  },
  {
    id: "stellar-circuitry",
    name: "Lemma Warm-Up",
    description: "Manual solving feeds your intuition, adding +1 virtual prestige point to production.",
    cost: 30_000,
    unlockAt: 20_000,
    effects: [{ kind: "prestigeBoost", value: 1 }],
  },
  {
    id: "orbital-synthesis",
    name: "Coordinated Arguments",
    description: "Strengthen Theorem Gates and Lemma Assemblies by 75%.",
    cost: 250_000_000,
    unlockAt: 120_000_000,
    effects: [
      { kind: "multiplier", target: "ascension", value: 1.75 },
      { kind: "multiplier", target: "orbital", value: 1.75 },
    ],
  },
  {
    id: "void-harmonics",
    name: "Concept Resonance",
    description: "Concept Beacons and Topology Engines operate twice as efficiently.",
    cost: 3_500_000_000,
    unlockAt: 1_500_000_000,
    effects: [
      { kind: "multiplier", target: "void", value: 2 },
      { kind: "multiplier", target: "rift", value: 2 },
    ],
  },
  {
    id: "chrono-accumulator",
    name: "Timeless Insight",
    description: "Amplify all research by 150% and gain +3 virtual prestige.",
    cost: 90_000_000_000,
    unlockAt: 20_000_000_000,
    effects: [
      { kind: "multiplier", target: "all", value: 2.5 },
      { kind: "prestigeBoost", value: 3 },
    ],
  },
  {
    id: "aether-refineries",
    name: "Calculus Workshops",
    description: "Refine Calculus Spires and Algorithm Crucibles for 2.5x output.",
    cost: 1_800_000_000_000,
    unlockAt: 300_000_000_000,
    effects: [
      { kind: "multiplier", target: "aether", value: 2.5 },
      { kind: "multiplier", target: "nova", value: 2.5 },
    ],
  },
  {
    id: "cosmic-overmind",
    name: "Endless Hypotheses",
    description: "Late scholarly structures output three times as much insight.",
    cost: 28_000_000_000_000,
    unlockAt: 6_500_000_000_000,
    effects: [
      { kind: "multiplier", target: "cosmic", value: 3 },
      { kind: "multiplier", target: "eternity", value: 3 },
      { kind: "multiplier", target: "infinity", value: 3 },
    ],
  },
  {
    id: "timeline-dilation",
    name: "Parallel Proofs",
    description: "Work across timelines, tripling all output and granting +10 virtual prestige points.",
    cost: 420_000_000_000_000,
    unlockAt: 110_000_000_000_000,
    effects: [
      { kind: "multiplier", target: "all", value: 3 },
      { kind: "prestigeBoost", value: 10 },
    ],
  },
  {
    id: "omni-singularity",
    name: "Grand Unification",
    description: "Double the power of Paradox Resolvers, Omega Archives, and the Decillion Lectern.",
    cost: 15_000_000_000_000_000,
    unlockAt: 2_500_000_000_000_000,
    effects: [
      { kind: "multiplier", target: "paradox", value: 2 },
      { kind: "multiplier", target: "omega", value: 2 },
      { kind: "multiplier", target: "dc", value: 2 },
    ],
  },
];

export const MILESTONES: MilestoneDef[] = [
  {
    id: "milestone-first-loop",
    name: "First Breakthrough",
    description: "Reach 500 total insight to reinforce the ring, granting +25% generator output.",
    threshold: 500,
    effects: [{ kind: "multiplier", target: "all", value: 1.25 }],
  },
  {
    id: "milestone-shimmer",
    name: "Emergent Proof",
    description: "Accumulate 5,000 total insight to empower prestige by +1.",
    threshold: 5_000,
    effects: [{ kind: "prestigeBoost", value: 1 }],
  },
  {
    id: "milestone-automation",
    name: "Automation Theorem",
    description: "Hit 25,000 total insight to unlock an auto-buyer for Abacus Rows.",
    threshold: 25_000,
    effects: [
      {
        kind: "autoBuyer",
        target: "coil",
        interval: 6,
        label: "Row Steward",
        description: "Automatically buys an Abacus Row every 6s if affordable.",
      },
    ],
  },
  {
    id: "milestone-stellar-forge",
    name: "Proof Refinery",
    description: "Forge 150,000 total insight to supercharge Equation Engines, Proof Forges, Logic Nexuses, and Tensor Cores by 40%.",
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
    name: "Fractal Architects",
    description: "Harness 1,000,000 total insight to unlock a Fractal Loom auto-buyer and +50% manual solve power.",
    threshold: 1_000_000,
    effects: [
      {
        kind: "autoBuyer",
        target: "nebula",
        interval: 12,
        label: "Loom Curator",
        description: "Automatically buys a Fractal Loom every 12s if affordable.",
      },
      { kind: "multiplier", target: "click", value: 1.5 },
    ],
  },
  {
    id: "milestone-orbital-array",
    name: "Lemma Array",
    description: "Amass 10,000,000 total insight to empower Theorem Gates by 60%.",
    threshold: 10_000_000,
    effects: [{ kind: "multiplier", target: "ascension", value: 1.6 }],
  },
  {
    id: "milestone-voidbound",
    name: "Concept Custodians",
    description: "Reach 150,000,000 total insight to unlock automation for Lemma Assemblies.",
    threshold: 150_000_000,
    effects: [
      {
        kind: "autoBuyer",
        target: "orbital",
        interval: 14,
        label: "Assembly Custodian",
        description: "Automatically buys a Lemma Assembly every 14s if affordable.",
      },
    ],
  },
  {
    id: "milestone-rift-protocol",
    name: "Topology Protocol",
    description: "Accumulate 2,500,000,000 total insight to double Concept Beacons and automate Topology Engines.",
    threshold: 2_500_000_000,
    effects: [
      { kind: "multiplier", target: "void", value: 2 },
      {
        kind: "autoBuyer",
        target: "void",
        interval: 18,
        label: "Beacon Pathfinder",
        description: "Automatically buys a Concept Beacon every 18s if affordable.",
      },
      {
        kind: "autoBuyer",
        target: "rift",
        interval: 20,
        label: "Topology Artificer",
        description: "Automatically buys a Topology Engine every 20s if affordable.",
      },
    ],
  },
  {
    id: "milestone-aether-sea",
    name: "Calculus Tide",
    description: "Harness 60,000,000,000 total insight to triple Calculus Spires and automate their purchase.",
    threshold: 60_000_000_000,
    effects: [
      { kind: "multiplier", target: "aether", value: 3 },
      {
        kind: "autoBuyer",
        target: "aether",
        interval: 18,
        label: "Calculus Navigator",
        description: "Automatically buys a Calculus Spire every 18s if affordable.",
      },
    ],
  },
  {
    id: "milestone-cosmic-symphony",
    name: "Algorithm Symphony",
    description: "Absorb 1,500,000,000,000 total insight to double Algorithm Crucibles and unlock automation for them.",
    threshold: 1_500_000_000_000,
    effects: [
      { kind: "multiplier", target: "nova", value: 2 },
      {
        kind: "autoBuyer",
        target: "nova",
        interval: 22,
        label: "Algorithm Maestro",
        description: "Automatically buys an Algorithm Crucible every 22s if affordable.",
      },
    ],
  },
  {
    id: "milestone-eternal-echo",
    name: "Eternal Proof",
    description: "Collect 40,000,000,000,000 total insight to grant +8 virtual prestige and automate Research Observatories.",
    threshold: 40_000_000_000_000,
    effects: [
      { kind: "prestigeBoost", value: 8 },
      {
        kind: "autoBuyer",
        target: "cosmic",
        interval: 24,
        label: "Research Conductor",
        description: "Automatically buys a Research Observatory every 24s if affordable.",
      },
    ],
  },
  {
    id: "milestone-infinite-parade",
    name: "Infinite Procession",
    description: "Amass 1,200,000,000,000,000 total insight to triple Convergence Anchors and unlock Infinity Prism automation.",
    threshold: 1_200_000_000_000_000,
    effects: [
      { kind: "multiplier", target: "eternity", value: 3 },
      {
        kind: "autoBuyer",
        target: "infinity",
        interval: 26,
        label: "Prism Courier",
        description: "Automatically buys an Infinity Prism every 26s if affordable.",
      },
    ],
  },
  {
    id: "milestone-omega-parade",
    name: "Omega Symposium",
    description: "Bank 30,000,000,000,000,000 total insight to gain +15 prestige and automate Paradox Resolvers.",
    threshold: 30_000_000_000_000_000,
    effects: [
      { kind: "prestigeBoost", value: 15 },
      {
        kind: "autoBuyer",
        target: "paradox",
        interval: 30,
        label: "Resolver Marshal",
        description: "Automatically buys a Paradox Resolver every 30s if affordable.",
      },
    ],
  },
  {
    id: "milestone-decillion-awakening",
    name: "Decillion Enlightenment",
    description: "Stabilize 3e27 total insight to empower Omega Archives and the Decillion Lectern while unlocking their automation.",
    threshold: 3e27,
    effects: [
      { kind: "multiplier", target: "omega", value: 3 },
      { kind: "multiplier", target: "dc", value: 3 },
      {
        kind: "autoBuyer",
        target: "omega",
        interval: 34,
        label: "Archive Seneschal",
        description: "Automatically buys an Omega Archive every 34s if affordable.",
      },
      {
        kind: "autoBuyer",
        target: "dc",
        interval: 40,
        label: "Lectern Regent",
        description: "Automatically buys a Decillion Lectern every 40s if affordable.",
      },
      { kind: "prestigeBoost", value: 25 },
    ],
  },
];

export const CLICK_BASE_GAIN = 1; // insight per click
export const PRESTIGE_REQ = 100_000; // min insight for prestige
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

  