import { GENERATORS, MILESTONES, UPGRADES } from "./config";

export type GenState = Record<string, { count: number }>;
export type UpgradeState = Record<string, boolean>;
export type MilestoneState = Record<string, boolean>;
export type AutoBuyerState = Record<string, { enabled: boolean; interval: number; timer: number }>;

export type BaseState = {
  energy: number;
  totalEnergy: number;
  gens: GenState;
  prestige: number;
  lastTs: number;
  upgrades: UpgradeState;
  milestones: MilestoneState;
  autoBuyers: AutoBuyerState;
};

export type EffectSummary = {
  clickMultiplier: number;
  globalGeneratorMultiplier: number;
  generatorMultipliers: Record<string, number>;
  prestigeBonus: number;
};

export const makeDefaultGenState = (): GenState =>
  Object.fromEntries(GENERATORS.map((generator) => [generator.id, { count: 0 }]));

export const makeDefaultUpgradeState = (): UpgradeState =>
  Object.fromEntries(UPGRADES.map((upgrade) => [upgrade.id, false]));

export const makeDefaultMilestoneState = (): MilestoneState =>
  Object.fromEntries(MILESTONES.map((milestone) => [milestone.id, false]));

export const createInitialState = (): BaseState => ({
  energy: 0,
  totalEnergy: 0,
  gens: makeDefaultGenState(),
  prestige: 0,
  lastTs: Date.now(),
  upgrades: makeDefaultUpgradeState(),
  milestones: makeDefaultMilestoneState(),
  autoBuyers: {},
});
