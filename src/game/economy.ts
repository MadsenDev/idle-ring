import { CLICK_BASE_GAIN, GENERATORS } from "./config";
import type { BaseState, EffectSummary } from "./types";

const generatorMap = new Map(GENERATORS.map((generator) => [generator.id, generator]));

export const getGeneratorDef = (id: string) => generatorMap.get(id);

export const nextCost = (id: string, count: number): number => {
  const def = generatorMap.get(id);
  if (!def) {
    throw new Error(`Unknown generator id: ${id}`);
  }
  return Math.ceil(def.baseCost * Math.pow(def.costMult, count));
};

let cachedPrestige = { prestige: Number.NaN, bonus: Number.NaN, value: 1 };

const getPrestigeMultiplier = (prestige: number, bonus: number): number => {
  if (cachedPrestige.prestige === prestige && cachedPrestige.bonus === bonus) {
    return cachedPrestige.value;
  }
  const value = 1 + (prestige + bonus) * 0.1;
  cachedPrestige = { prestige, bonus, value };
  return value;
};

export const calculatePrestigeMultiplier = (state: BaseState, effects: EffectSummary): number =>
  getPrestigeMultiplier(state.prestige, effects.prestigeBonus);

let cachedRate = {
  gensRef: null as BaseState["gens"] | null,
  prestigeMult: Number.NaN,
  effectsRef: null as EffectSummary | null,
  value: 0,
};

export const calculateRate = (state: BaseState, effects: EffectSummary): number => {
  const prestigeMult = getPrestigeMultiplier(state.prestige, effects.prestigeBonus);
  if (
    cachedRate.gensRef === state.gens &&
    cachedRate.effectsRef === effects &&
    cachedRate.prestigeMult === prestigeMult
  ) {
    return cachedRate.value;
  }

  let sum = 0;
  for (const generator of GENERATORS) {
    if (generator.id === "click") continue;
    const count = state.gens[generator.id]?.count ?? 0;
    if (count === 0) continue;
    const mult = effects.globalGeneratorMultiplier * (effects.generatorMultipliers[generator.id] ?? 1);
    sum += count * generator.baseRate * mult * prestigeMult;
  }

  cachedRate = { gensRef: state.gens, effectsRef: effects, prestigeMult, value: sum };
  return sum;
};

let cachedClick = {
  effectsRef: null as EffectSummary | null,
  prestigeMult: Number.NaN,
  value: 0,
};

export const calculateClickGain = (effects: EffectSummary, prestigeMult: number): number => {
  if (cachedClick.effectsRef === effects && cachedClick.prestigeMult === prestigeMult) {
    return cachedClick.value;
  }
  const value = CLICK_BASE_GAIN * effects.clickMultiplier * prestigeMult;
  cachedClick = { effectsRef: effects, prestigeMult, value };
  return value;
};
