import type { Effect } from "./config";
import { MILESTONES, UPGRADES } from "./config";
import type { EffectSummary, MilestoneState, UpgradeState } from "./types";

const effectCache = new WeakMap<UpgradeState, WeakMap<MilestoneState, EffectSummary>>();

const cloneSummary = (summary: EffectSummary): EffectSummary => ({
  clickMultiplier: summary.clickMultiplier,
  globalGeneratorMultiplier: summary.globalGeneratorMultiplier,
  generatorMultipliers: { ...summary.generatorMultipliers },
  prestigeBonus: summary.prestigeBonus,
});

const freezeSummary = (summary: EffectSummary): EffectSummary => {
  Object.freeze(summary.generatorMultipliers);
  return Object.freeze(summary);
};

const buildSummary = (flags: { upgrades: UpgradeState; milestones: MilestoneState }): EffectSummary => {
  const summary: EffectSummary = {
    clickMultiplier: 1,
    globalGeneratorMultiplier: 1,
    generatorMultipliers: {},
    prestigeBonus: 0,
  };

  const effects: Effect[] = [];
  for (const upgrade of UPGRADES) {
    if (flags.upgrades[upgrade.id]) {
      effects.push(...upgrade.effects);
    }
  }
  for (const milestone of MILESTONES) {
    if (flags.milestones[milestone.id]) {
      effects.push(...milestone.effects);
    }
  }

  for (const effect of effects) {
    if (effect.kind === "multiplier") {
      if (effect.target === "click") {
        summary.clickMultiplier *= effect.value;
      } else if (effect.target === "all") {
        summary.globalGeneratorMultiplier *= effect.value;
      } else {
        summary.generatorMultipliers[effect.target] =
          (summary.generatorMultipliers[effect.target] ?? 1) * effect.value;
      }
    } else if (effect.kind === "prestigeBoost") {
      summary.prestigeBonus += effect.value;
    }
  }

  return summary;
};

export const getEffectSummary = (upgrades: UpgradeState, milestones: MilestoneState): EffectSummary => {
  let milestoneCache = effectCache.get(upgrades);
  if (!milestoneCache) {
    milestoneCache = new WeakMap<MilestoneState, EffectSummary>();
    effectCache.set(upgrades, milestoneCache);
  }

  let summary = milestoneCache.get(milestones);
  if (!summary) {
    const built = freezeSummary(cloneSummary(buildSummary({ upgrades, milestones })));
    summary = built;
    milestoneCache.set(milestones, summary);
  }

  return summary;
};
