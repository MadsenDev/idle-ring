export type GeneratorDef = {
    id: string;
    name: string;
    baseCost: number;
    costMult: number;     // cost increase per purchase
    baseRate: number;     // energy/sec per unit
    unlockAt?: number;    // energy needed to show
  };
  
export const GENERATORS: GeneratorDef[] = [
    { id: "click",     name: "Manual Tap", baseCost: 0,        costMult: 1,    baseRate: 0,     unlockAt: 0 }, // special: click-only
    { id: "spark",     name: "Spark",      baseCost: 10,       costMult: 1.15, baseRate: 0.1,   unlockAt: 0 },
    { id: "coil",      name: "Coil",       baseCost: 120,      costMult: 1.16, baseRate: 1.25,  unlockAt: 50 },
    { id: "reactor",   name: "Reactor",    baseCost: 1_800,    costMult: 1.18, baseRate: 12,    unlockAt: 450 },
    { id: "forge",     name: "Forge",      baseCost: 12_000,   costMult: 1.2,  baseRate: 65,    unlockAt: 3_000 },
    { id: "singularity", name: "Singularity", baseCost: 150_000, costMult: 1.22, baseRate: 380,  unlockAt: 20_000 },
    { id: "quantum",   name: "Quantum Core", baseCost: 2_000_000, costMult: 1.24, baseRate: 2_400, unlockAt: 150_000 },
    { id: "nebula",    name: "Nebula Loom", baseCost: 25_000_000, costMult: 1.26, baseRate: 15_000, unlockAt: 1_000_000 },
    { id: "ascension", name: "Ascension Gate", baseCost: 350_000_000, costMult: 1.28, baseRate: 110_000, unlockAt: 8_000_000 },
  ];
  
  export const CLICK_BASE_GAIN = 1;              // energy per click
  export const PRESTIGE_REQ = 100_000;           // min energy for prestige
  export const PRESTIGE_CONVERT = (energy: number) => Math.floor(Math.sqrt(energy / 1000));
  export const SAVE_KEY = "idle-ring-save-v1";
  