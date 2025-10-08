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

export type PrestigeResearchDef = {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMult: number;
  unlockAtPrestige?: number;
  unlockAtTotal?: number;
  effect: (level: number) => Effect[];
  formatEffect: (level: number) => string;
};

export type PrestigeUpgradeDef = {
  id: string;
  name: string;
  description: string;
  cost: number;
  unlockAtPrestige?: number;
  unlockAtTotal?: number;
  effects: Effect[];
};

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
  { id: "continuum", name: "Continuum Loom", baseCost: 5_000_000_000, costMult: 1.3, baseRate: 650_000, unlockAt: 50_000_000 },
  { id: "rift", name: "Rift Engine", baseCost: 80_000_000_000, costMult: 1.32, baseRate: 4_500_000, unlockAt: 600_000_000 },
  { id: "void", name: "Void Conductor", baseCost: 1_200_000_000_000, costMult: 1.34, baseRate: 32_000_000, unlockAt: 7_000_000_000 },
  { id: "eternium", name: "Eternium Crucible", baseCost: 18_000_000_000_000, costMult: 1.36, baseRate: 240_000_000, unlockAt: 90_000_000_000 },
  { id: "omega", name: "Omega Archive", baseCost: 270_000_000_000_000, costMult: 1.38, baseRate: 1_800_000_000, unlockAt: 1_200_000_000_000 },
  { id: "nova", name: "Nova Array", baseCost: 4_000_000_000_000_000, costMult: 1.4, baseRate: 13_000_000_000, unlockAt: 18_000_000_000_000 },
  { id: "apex", name: "Apex Paradox", baseCost: 65_000_000_000_000_000, costMult: 1.42, baseRate: 95_000_000_000, unlockAt: 300_000_000_000_000 },
  { id: "eternity", name: "Eternity Gate", baseCost: 1_200_000_000_000_000_000, costMult: 1.44, baseRate: 720_000_000_000, unlockAt: 5_000_000_000_000_000 },
  { id: "infinity", name: "Infinity Spiral", baseCost: 22_000_000_000_000_000_000, costMult: 1.46, baseRate: 5_800_000_000_000, unlockAt: 90_000_000_000_000_000 },
  { id: "oblivion", name: "Oblivion Bloom", baseCost: 420_000_000_000_000_000_000, costMult: 1.48, baseRate: 44_000_000_000_000_000, unlockAt: 1_600_000_000_000_000_000 },
  { id: "eventide", name: "Eventide Singularity", baseCost: 8_000_000_000_000_000_000_000, costMult: 1.5, baseRate: 350_000_000_000_000_000, unlockAt: 28_000_000_000_000_000_000 },
  { id: "aurora", name: "Aurora Prism", baseCost: 120_000_000_000_000_000_000_000, costMult: 1.52, baseRate: 15_000_000_000_000_000_000, unlockAt: 400_000_000_000_000_000_000 },
  { id: "eclipse", name: "Eclipse Engine", baseCost: 2_400_000_000_000_000_000_000_000, costMult: 1.54, baseRate: 400_000_000_000_000_000_000, unlockAt: 8_500_000_000_000_000_000_000 },
  { id: "chronos", name: "Chronos Loom", baseCost: 48_000_000_000_000_000_000_000_000, costMult: 1.56, baseRate: 10_000_000_000_000_000_000_000, unlockAt: 180_000_000_000_000_000_000_000 },
  { id: "mythic", name: "Mythic Weave", baseCost: 950_000_000_000_000_000_000_000_000, costMult: 1.58, baseRate: 300_000_000_000_000_000_000_000, unlockAt: 3_600_000_000_000_000_000_000_000 },
  { id: "zenith", name: "Zenith Nexus", baseCost: 19_000_000_000_000_000_000_000_000_000, costMult: 1.6, baseRate: 9_000_000_000_000_000_000_000_000, unlockAt: 75_000_000_000_000_000_000_000_000 },
  { id: "apotheosis", name: "Apotheosis Spire", baseCost: 380_000_000_000_000_000_000_000_000_000, costMult: 1.62, baseRate: 270_000_000_000_000_000_000_000_000, unlockAt: 1_500_000_000_000_000_000_000_000_000 },
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
    description: "Boost all generators by 60%.",
    cost: 2_500,
    unlockAt: 1_500,
    effects: [{ kind: "multiplier", target: "all", value: 1.6 }],
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
  {
    id: "harmonic-forging",
    name: "Harmonic Forging",
    description: "Reactors hum in tune with the Forge, supercharging both tiers.",
    cost: 90_000,
    unlockAt: 60_000,
    effects: [
      { kind: "multiplier", target: "reactor", value: 1.75 },
      { kind: "multiplier", target: "forge", value: 2.25 },
    ],
  },
  {
    id: "forge-overseer",
    name: "Forge Overseer",
    description: "Deploy an artificer to auto-purchase Forges and push them 50% harder.",
    cost: 260_000,
    unlockAt: 180_000,
    effects: [
      {
        kind: "autoBuyer",
        target: "forge",
        interval: 7,
        label: "Forge Artificer",
        description: "Automatically buys a Forge every 7s if affordable.",
      },
      { kind: "multiplier", target: "forge", value: 1.5 },
    ],
  },
  {
    id: "continuum-architects",
    name: "Continuum Architects",
    description: "Ascension Gates stabilize the Continuum Loom for triple output.",
    cost: 4_500_000,
    unlockAt: 2_500_000,
    effects: [
      { kind: "multiplier", target: "ascension", value: 1.8 },
      { kind: "multiplier", target: "continuum", value: 3 },
    ],
  },
  {
    id: "void-synthesis",
    name: "Void Synthesis",
    description: "Every generator drinks from the void, doubling global output.",
    cost: 90_000_000,
    unlockAt: 40_000_000,
    effects: [{ kind: "multiplier", target: "all", value: 2 }],
  },
  {
    id: "paradox-weaving",
    name: "Paradox Weaving",
    description: "Rift Engines and beyond weave paradox threads for massive gains.",
    cost: 2_400_000_000,
    unlockAt: 1_000_000_000,
    effects: [
      { kind: "multiplier", target: "rift", value: 2.5 },
      { kind: "multiplier", target: "void", value: 2.5 },
      { kind: "multiplier", target: "eternium", value: 2.5 },
    ],
  },
  {
    id: "eventide-dictum",
    name: "Eventide Dictum",
    description: "The Eventide Singularity resonates across time, tripling upper-tier output.",
    cost: 180_000_000_000,
    unlockAt: 60_000_000_000,
    effects: [
      { kind: "multiplier", target: "omega", value: 3 },
      { kind: "multiplier", target: "nova", value: 3 },
      { kind: "multiplier", target: "apex", value: 3 },
      { kind: "multiplier", target: "eternity", value: 3 },
      { kind: "multiplier", target: "infinity", value: 3 },
      { kind: "multiplier", target: "oblivion", value: 3 },
      { kind: "multiplier", target: "eventide", value: 3 },
    ],
  },
  {
    id: "aurora-lattice",
    name: "Aurora Lattice",
    description: "Aurora Prisms refract Eventide light, supercharging late-tier generators.",
    cost: 3_600_000_000_000,
    unlockAt: 1_200_000_000_000,
    effects: [
      { kind: "multiplier", target: "oblivion", value: 2.8 },
      { kind: "multiplier", target: "eventide", value: 2.8 },
      { kind: "multiplier", target: "aurora", value: 4 },
    ],
  },
  {
    id: "eclipse-harmonics",
    name: "Eclipse Harmonics",
    description: "Eclipse Engines bend twilight into time, empowering the next two tiers.",
    cost: 95_000_000_000_000,
    unlockAt: 45_000_000_000_000,
    effects: [
      { kind: "multiplier", target: "aurora", value: 2.5 },
      { kind: "multiplier", target: "eclipse", value: 4 },
      { kind: "multiplier", target: "chronos", value: 3 },
    ],
  },
  {
    id: "chronos-convergence",
    name: "Chronos Convergence",
    description: "Chronos Looms synchronize with Mythic Weaves for dramatic gains.",
    cost: 2_400_000_000_000_000,
    unlockAt: 1_000_000_000_000_000,
    effects: [
      { kind: "multiplier", target: "chronos", value: 3.5 },
      { kind: "multiplier", target: "mythic", value: 3.5 },
    ],
  },
  {
    id: "zenith-edict",
    name: "Zenith Edict",
    description: "Zenith Nexuses declare dominion, tripling the apex of creation.",
    cost: 75_000_000_000_000_000,
    unlockAt: 35_000_000_000_000_000,
    effects: [
      { kind: "multiplier", target: "zenith", value: 4 },
      { kind: "multiplier", target: "apotheosis", value: 4 },
    ],
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
    description: "Forge 150,000 total energy to supercharge mid-tier structures by 60%.",
    threshold: 150_000,
    effects: [
      { kind: "multiplier", target: "reactor", value: 1.6 },
      { kind: "multiplier", target: "forge", value: 1.6 },
      { kind: "multiplier", target: "singularity", value: 1.6 },
      { kind: "multiplier", target: "quantum", value: 1.6 },
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
  {
    id: "milestone-astral-horizon",
    name: "Astral Horizon",
    description: "Push beyond 5,000,000 total energy to infuse all output by 75%.",
    threshold: 5_000_000,
    effects: [{ kind: "multiplier", target: "all", value: 1.75 }],
  },
  {
    id: "milestone-quantum-burst",
    name: "Quantum Burst",
    description: "Breach 40,000,000 total energy to add +2 virtual prestige levels to production.",
    threshold: 40_000_000,
    effects: [{ kind: "prestigeBoost", value: 2 }],
  },
  {
    id: "milestone-paradox-fleet",
    name: "Paradox Fleet",
    description: "Command 3,000,000,000 total energy to unlock a Singularity auto-buyer.",
    threshold: 3_000_000_000,
    effects: [
      {
        kind: "autoBuyer",
        target: "singularity",
        interval: 14,
        label: "Singularity Marshal",
        description: "Automatically buys a Singularity every 14s if affordable.",
      },
    ],
  },
  {
    id: "milestone-continuum-forge",
    name: "Continuum Forge",
    description: "Temper 250,000,000,000 total energy to empower end-game structures by 120%.",
    threshold: 250_000_000_000,
    effects: [
      { kind: "multiplier", target: "continuum", value: 2.2 },
      { kind: "multiplier", target: "rift", value: 2.2 },
      { kind: "multiplier", target: "void", value: 2.2 },
      { kind: "multiplier", target: "eternium", value: 2.2 },
    ],
  },
  {
    id: "milestone-omega-awakening",
    name: "Omega Awakening",
    description: "Awaken 20,000,000,000,000 total energy to unlock a Quantum Core auto-buyer and +100% tapping.",
    threshold: 20_000_000_000_000,
    effects: [
      {
        kind: "autoBuyer",
        target: "quantum",
        interval: 18,
        label: "Quantum Custodian",
        description: "Automatically buys a Quantum Core every 18s if affordable.",
      },
      { kind: "multiplier", target: "click", value: 2 },
    ],
  },
  {
    id: "milestone-eventide-surge",
    name: "Eventide Surge",
    description: "Channel 1,200,000,000,000,000,000 total energy to swell the Eventide tiers by 200% and grant a Rift auto-buyer.",
    threshold: 1_200_000_000_000_000_000,
    effects: [
      {
        kind: "autoBuyer",
        target: "rift",
        interval: 22,
        label: "Rift Navigator",
        description: "Automatically buys a Rift Engine every 22s if affordable.",
      },
      { kind: "multiplier", target: "omega", value: 3 },
      { kind: "multiplier", target: "nova", value: 3 },
      { kind: "multiplier", target: "apex", value: 3 },
      { kind: "multiplier", target: "eternity", value: 3 },
      { kind: "multiplier", target: "infinity", value: 3 },
      { kind: "multiplier", target: "oblivion", value: 3 },
      { kind: "multiplier", target: "eventide", value: 3 },
    ],
  },
  {
    id: "milestone-aurora-awakening",
    name: "Aurora Awakening",
    description: "Illumine 18Sx total energy to automate Aurora Prisms and ignite the dawn tiers.",
    threshold: 18_000_000_000_000_000_000_000,
    effects: [
      {
        kind: "autoBuyer",
        target: "aurora",
        interval: 26,
        label: "Aurora Warden",
        description: "Automatically buys an Aurora Prism every 26s if affordable.",
      },
      { kind: "multiplier", target: "aurora", value: 2.5 },
      { kind: "multiplier", target: "eclipse", value: 2.5 },
    ],
  },
  {
    id: "milestone-eclipse-dominion",
    name: "Eclipse Dominion",
    description: "Command 650Sx total energy to orchestrate Eclipse automation and +200% to temporal tiers.",
    threshold: 650_000_000_000_000_000_000_000,
    effects: [
      {
        kind: "autoBuyer",
        target: "eclipse",
        interval: 30,
        label: "Eclipse Regent",
        description: "Automatically buys an Eclipse Engine every 30s if affordable.",
      },
      { kind: "multiplier", target: "eclipse", value: 3 },
      { kind: "multiplier", target: "chronos", value: 2.2 },
    ],
  },
  {
    id: "milestone-chronos-vanguard",
    name: "Chronos Vanguard",
    description: "Amass 18Oc total energy to marshal Chronos Loom auto-buyers and surging mythic output.",
    threshold: 18_000_000_000_000_000_000_000_000,
    effects: [
      {
        kind: "autoBuyer",
        target: "chronos",
        interval: 34,
        label: "Chronos Adjudicator",
        description: "Automatically buys a Chronos Loom every 34s if affordable.",
      },
      { kind: "multiplier", target: "chronos", value: 3.2 },
      { kind: "multiplier", target: "mythic", value: 2.4 },
    ],
  },
  {
    id: "milestone-zenith-symmetry",
    name: "Zenith Symmetry",
    description: "Stabilize 520Oc total energy to automate Mythic Weaves and invigorate Zenith constructs.",
    threshold: 520_000_000_000_000_000_000_000_000,
    effects: [
      {
        kind: "autoBuyer",
        target: "mythic",
        interval: 38,
        label: "Mythic Artisan",
        description: "Automatically buys a Mythic Weave every 38s if affordable.",
      },
      { kind: "multiplier", target: "mythic", value: 3 },
      { kind: "multiplier", target: "zenith", value: 2.6 },
    ],
  },
  {
    id: "milestone-apotheosis-dawn",
    name: "Apotheosis Dawn",
    description: "Surpass 16No total energy to empower the ultimate tiers by +250% and unlock Zenith automation.",
    threshold: 16_000_000_000_000_000_000_000_000_000,
    effects: [
      {
        kind: "autoBuyer",
        target: "zenith",
        interval: 42,
        label: "Zenith Oracle",
        description: "Automatically buys a Zenith Nexus every 42s if affordable.",
      },
      { kind: "multiplier", target: "zenith", value: 3.2 },
      { kind: "multiplier", target: "apotheosis", value: 2.8 },
      { kind: "prestigeBoost", value: 4 },
    ],
  },
];

export const PRESTIGE_UPGRADES: PrestigeUpgradeDef[] = [
  {
    id: "echoes-of-power",
    name: "Echoes of Power",
    description: "Permanent 50% production boost carried across every run.",
    cost: 3,
    unlockAtPrestige: 1,
    effects: [{ kind: "multiplier", target: "all", value: 1.5 }],
  },
  {
    id: "timeless-impulse",
    name: "Timeless Impulse",
    description: "Clicks draw strength from prestige, granting +2 virtual levels forever.",
    cost: 6,
    unlockAtPrestige: 3,
    effects: [{ kind: "prestigeBoost", value: 2 }],
  },
  {
    id: "quantum-vaults",
    name: "Quantum Vaults",
    description: "Stash power between loops to double all generator output.",
    cost: 12,
    unlockAtTotal: 5_000_000,
    effects: [{ kind: "multiplier", target: "all", value: 2 }],
  },
  {
    id: "automation-matrix",
    name: "Automation Matrix",
    description: "An eternal steward auto-buys Void Conductors and Continuum Looms.",
    cost: 18,
    unlockAtTotal: 80_000_000,
    effects: [
      {
        kind: "autoBuyer",
        target: "continuum",
        interval: 16,
        label: "Continuum Steward",
        description: "Automatically buys a Continuum Loom every 16s if affordable.",
      },
      {
        kind: "autoBuyer",
        target: "void",
        interval: 28,
        label: "Void Anchor",
        description: "Automatically buys a Void Conductor every 28s if affordable.",
      },
    ],
  },
  {
    id: "chronal-overflow",
    name: "Chronal Overflow",
    description: "Prestige energy compounds quicker: +5 effective prestige levels.",
    cost: 30,
    unlockAtTotal: 6_000_000_000,
    effects: [{ kind: "prestigeBoost", value: 5 }],
  },
  {
    id: "eventide-archive",
    name: "Eventide Archive",
    description: "The Eventide Singularity is etched into memory, tripling all Eventide-tier structures permanently.",
    cost: 55,
    unlockAtTotal: 500_000_000_000_000,
    effects: [
      { kind: "multiplier", target: "omega", value: 3 },
      { kind: "multiplier", target: "nova", value: 3 },
      { kind: "multiplier", target: "apex", value: 3 },
      { kind: "multiplier", target: "eternity", value: 3 },
      { kind: "multiplier", target: "infinity", value: 3 },
      { kind: "multiplier", target: "oblivion", value: 3 },
      { kind: "multiplier", target: "eventide", value: 3 },
    ],
  },
  {
    id: "aurora-resonance",
    name: "Aurora Resonance",
    description: "Bind auroral light between loops for a colossal late-game surge.",
    cost: 85,
    unlockAtTotal: 15_000_000_000_000_000,
    effects: [
      { kind: "multiplier", target: "aurora", value: 3.5 },
      { kind: "multiplier", target: "eclipse", value: 3 },
    ],
  },
  {
    id: "chronos-vault",
    name: "Chronos Vault",
    description: "Secure chronal fragments for permanent boosts to timeforged tiers.",
    cost: 120,
    unlockAtTotal: 950_000_000_000_000_000,
    effects: [
      { kind: "multiplier", target: "chronos", value: 4 },
      { kind: "multiplier", target: "mythic", value: 3.2 },
    ],
  },
  {
    id: "zenith-crown",
    name: "Zenith Crown",
    description: "Crown the apex of the ring, quadrupling its power and gifting enduring prestige.",
    cost: 180,
    unlockAtTotal: 55_000_000_000_000_000_000_000,
    effects: [
      { kind: "multiplier", target: "zenith", value: 4 },
      { kind: "multiplier", target: "apotheosis", value: 4 },
      { kind: "prestigeBoost", value: 5 },
    ],
  },
];

export const PRESTIGE_RESEARCH: PrestigeResearchDef[] = [
  {
    id: "resonance-theory",
    name: "Resonance Theory",
    description: "Refine prestige laboratories to permanently amplify every generator.",
    baseCost: 24,
    costMult: 1.65,
    unlockAtPrestige: 10,
    effect: level => (level > 0 ? [{ kind: "multiplier", target: "all", value: Math.pow(1.35, level) }] : []),
    formatEffect: level => `x${Math.pow(1.35, level).toFixed(2)} to all generators`,
  },
  {
    id: "temporal-superposition",
    name: "Temporal Superposition",
    description: "Stretch the loop to grant enduring prestige levels every rank.",
    baseCost: 32,
    costMult: 1.7,
    unlockAtPrestige: 15,
    unlockAtTotal: 200_000_000_000,
    effect: level => (level > 0 ? [{ kind: "prestigeBoost", value: level * 2 }] : []),
    formatEffect: level => `+${(level * 2).toFixed(0)} virtual prestige levels`,
  },
  {
    id: "dawn-engineering",
    name: "Dawn Engineering",
    description: "Engineer the auroral dawn to surge Aurora, Eclipse, and Chronos output by 80% per rank.",
    baseCost: 55,
    costMult: 1.75,
    unlockAtTotal: 3_500_000_000_000_000,
    effect: level => {
      if (level <= 0) return [];
      const mult = Math.pow(1.8, level);
      return [
        { kind: "multiplier", target: "aurora", value: mult },
        { kind: "multiplier", target: "eclipse", value: mult },
        { kind: "multiplier", target: "chronos", value: mult },
      ];
    },
    formatEffect: level => `x${Math.pow(1.8, level).toFixed(2)} Aurora•Eclipse•Chronos`,
  },
  {
    id: "apotheosis-glyphs",
    name: "Apotheosis Glyphs",
    description: "Decode apotheosis glyphs to automate the Spire and unleash the apex tiers.",
    baseCost: 110,
    costMult: 1.85,
    unlockAtTotal: 2_500_000_000_000_000_000_000_000,
    effect: level => {
      if (level <= 0) return [];
      const mult = Math.pow(1.6, level);
      const effects: Effect[] = [
        { kind: "multiplier", target: "mythic", value: mult },
        { kind: "multiplier", target: "zenith", value: mult },
        { kind: "multiplier", target: "apotheosis", value: mult },
      ];
      if (level >= 1) {
        effects.push({
          kind: "autoBuyer",
          target: "apotheosis",
          interval: 48,
          label: "Apotheosis Curator",
          description: "Automatically buys an Apotheosis Spire every 48s if affordable.",
        });
      }
      return effects;
    },
    formatEffect: level => `x${Math.pow(1.6, level).toFixed(2)} Mythic•Zenith•Apotheosis`,
  },
];

export const CLICK_BASE_GAIN = 1; // energy per click
export const PRESTIGE_REQ = 100_000; // min energy for prestige
export const PRESTIGE_CONVERT = (energy: number) => Math.floor(Math.sqrt(energy / 1000));
export const SAVE_KEY = "idle-ring-save-v1";

export const AUTO_BUYER_CONFIG = (() => {
  const allEffects = [
    ...UPGRADES.flatMap(def => def.effects),
    ...MILESTONES.flatMap(def => def.effects),
    ...PRESTIGE_UPGRADES.flatMap(def => def.effects),
    ...PRESTIGE_RESEARCH.flatMap(def => def.effect(1)),
  ]
    .filter((effect): effect is AutoBuyerEffect => effect.kind === "autoBuyer");
  const map = new Map<string, AutoBuyerEffect>();
  for (const effect of allEffects) {
    if (!map.has(effect.target)) {
      map.set(effect.target, effect);
    }
  }
  return map;
})();

  