import type { Effect } from "./config";
import { MILESTONES, UPGRADES } from "./config";
import { getGeneratorDef, nextCost } from "./economy";
import type { AutoBuyerState, BaseState } from "./types";

export const applyUnlockEffects = (state: BaseState, effects: Effect[]): BaseState => {
  let autoBuyers = state.autoBuyers;
  let changed = false;
  for (const effect of effects) {
    if (effect.kind !== "autoBuyer") continue;
    const existing = autoBuyers[effect.target];
    const nextEntry = {
      enabled: existing?.enabled ?? false,
      timer: existing?.enabled ? existing.timer : 0,
      interval: effect.interval,
    };
    if (!existing || existing.interval !== effect.interval || existing.timer !== nextEntry.timer) {
      if (!changed) {
        autoBuyers = { ...autoBuyers };
        changed = true;
      }
      autoBuyers[effect.target] = nextEntry;
    }
  }

  if (!changed) return state;
  return { ...state, autoBuyers };
};

export const ensureAutoBuyersForState = (state: BaseState): BaseState => {
  let current = state;
  for (const upgrade of UPGRADES) {
    if (current.upgrades[upgrade.id]) {
      current = applyUnlockEffects(current, upgrade.effects);
    }
  }
  for (const milestone of MILESTONES) {
    if (current.milestones[milestone.id]) {
      current = applyUnlockEffects(current, milestone.effects);
    }
  }
  return current;
};

export const resetAutoBuyerTimers = (autoBuyers: AutoBuyerState): AutoBuyerState => {
  const entries = Object.entries(autoBuyers);
  if (entries.length === 0) return autoBuyers;
  const next: AutoBuyerState = {};
  for (const [id, entry] of entries) {
    next[id] = { ...entry, timer: 0 };
  }
  return next;
};

export const processAutoBuyers = (
  state: BaseState,
  energy: number,
  dt: number,
): { energy: number; gens: BaseState["gens"]; autoBuyers: AutoBuyerState } => {
  if (Object.keys(state.autoBuyers).length === 0) {
    return { energy, gens: state.gens, autoBuyers: state.autoBuyers };
  }

  let currentEnergy = energy;
  let gens = state.gens;
  let autoBuyers: AutoBuyerState = state.autoBuyers;
  let autoMutated = false;
  let gensMutated = false;

  for (const [id, entry] of Object.entries(state.autoBuyers)) {
    if (!entry || !entry.enabled) {
      if (entry && entry.timer !== 0) {
        if (!autoMutated) {
          autoBuyers = { ...autoBuyers };
          autoMutated = true;
        }
        autoBuyers[id] = { ...entry, timer: 0 };
      }
      continue;
    }

    const def = getGeneratorDef(id);
    if (!def) continue;

    let timer = entry.timer + dt;
    let workingEnergy = currentEnergy;
    let workingGens = gens;
    let localMutated = false;

    while (timer >= entry.interval) {
      const currentCount = workingGens[id]?.count ?? 0;
      const cost = nextCost(id, currentCount);
      if (workingEnergy < cost) break;
      if (!localMutated) {
        workingGens = { ...workingGens };
        localMutated = true;
      }
      workingGens[id] = { count: currentCount + 1 };
      workingEnergy -= cost;
      timer -= entry.interval;
    }

    if (localMutated) {
      gens = workingGens;
      gensMutated = true;
      currentEnergy = workingEnergy;
    }

    if (timer !== entry.timer || localMutated) {
      if (!autoMutated) {
        autoBuyers = { ...autoBuyers };
        autoMutated = true;
      }
      autoBuyers[id] = { ...entry, timer };
    }
  }

  return {
    energy: currentEnergy,
    gens: gensMutated ? gens : state.gens,
    autoBuyers: autoMutated ? autoBuyers : state.autoBuyers,
  };
};
