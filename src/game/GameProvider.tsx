import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  AUTO_BUYER_CONFIG,
  CLICK_BASE_GAIN,
  GENERATORS,
  MILESTONES,
  PRESTIGE_CONVERT,
  PRESTIGE_REQ,
  PRESTIGE_UPGRADES,
  PRESTIGE_RESEARCH,
  UPGRADES,
} from "./config";
import type { GeneratorDef, Effect, PrestigeResearchDef } from "./config";
import { loadGameState, loadGameStateSync, saveGameState } from "../utils/persist";

type GenState = Record<string, { count: number }>;
type UpgradeState = Record<string, boolean>;
type MilestoneState = Record<string, boolean>;
type PrestigeUpgradeState = Record<string, boolean>;
type PrestigeResearchState = Record<string, number>;
type AutoBuyerState = Record<string, { enabled: boolean; interval: number; timer: number }>;

type EffectSummary = {
  clickMultiplier: number;
  globalGeneratorMultiplier: number;
  generatorMultipliers: Record<string, number>;
  prestigeBonus: number;
};

type State = {
  energy: number;
  totalEnergy: number;
  gens: GenState;
  prestige: number;     // prestige points
  lastTs: number;       // ms for offline calc
  upgrades: UpgradeState;
  milestones: MilestoneState;
  prestigeUpgrades: PrestigeUpgradeState;
  prestigeResearch: PrestigeResearchState;
  autoBuyers: AutoBuyerState;
};

type Action =
  | { type: "TICK"; dt: number }                       // dt in seconds
  | { type: "CLICK" }
  | { type: "BUY"; id: string }
  | { type: "LOAD"; payload: State }
  | { type: "PRESTIGE" }
  | { type: "BUY_UPGRADE"; id: string }
  | { type: "CLAIM_MILESTONE"; id: string }
  | { type: "BUY_PRESTIGE_UPGRADE"; id: string }
  | { type: "BUY_PRESTIGE_RESEARCH"; id: string }
  | { type: "TOGGLE_AUTOBUYER"; id: string; enabled: boolean }
  ;

const makeDefaultGenState = () => Object.fromEntries(GENERATORS.map(g => [g.id, { count: 0 }]));
const makeDefaultUpgradeState = () => Object.fromEntries(UPGRADES.map(up => [up.id, false]));
const makeDefaultMilestoneState = () => Object.fromEntries(MILESTONES.map(m => [m.id, false]));
const makeDefaultPrestigeUpgradeState = () => Object.fromEntries(PRESTIGE_UPGRADES.map(p => [p.id, false]));
const makeDefaultPrestigeResearchState = () => Object.fromEntries(PRESTIGE_RESEARCH.map(p => [p.id, 0]));

const initial: State = {
  energy: 0,
  totalEnergy: 0,
  gens: makeDefaultGenState(),
  prestige: 0,
  lastTs: Date.now(),
  upgrades: makeDefaultUpgradeState(),
  milestones: makeDefaultMilestoneState(),
  prestigeUpgrades: makeDefaultPrestigeUpgradeState(),
  prestigeResearch: makeDefaultPrestigeResearchState(),
  autoBuyers: {},
};

const summarizeEffects = (flags: {
  upgrades: UpgradeState;
  milestones: MilestoneState;
  prestigeUpgrades: PrestigeUpgradeState;
  prestigeResearch: PrestigeResearchState;
}): EffectSummary => {
  const summary: EffectSummary = {
    clickMultiplier: 1,
    globalGeneratorMultiplier: 1,
    generatorMultipliers: {},
    prestigeBonus: 0,
  };

  const collectEffects = (): Effect[] => {
    const effects: Effect[] = [];
    for (const up of UPGRADES) {
      if (flags.upgrades[up.id]) {
        effects.push(...up.effects);
      }
    }
    for (const milestone of MILESTONES) {
      if (flags.milestones[milestone.id]) {
        effects.push(...milestone.effects);
      }
    }
    for (const upgrade of PRESTIGE_UPGRADES) {
      if (flags.prestigeUpgrades[upgrade.id]) {
        effects.push(...upgrade.effects);
      }
    }
    for (const research of PRESTIGE_RESEARCH) {
      const level = flags.prestigeResearch[research.id] ?? 0;
      if (level > 0) {
        effects.push(...research.effect(level));
      }
    }
    return effects;
  };

  for (const effect of collectEffects()) {
    if (effect.kind === "multiplier") {
      if (effect.target === "click") {
        summary.clickMultiplier *= effect.value;
      } else if (effect.target === "all") {
        summary.globalGeneratorMultiplier *= effect.value;
      } else {
        summary.generatorMultipliers[effect.target] = (summary.generatorMultipliers[effect.target] ?? 1) * effect.value;
      }
    } else if (effect.kind === "prestigeBoost") {
      summary.prestigeBonus += effect.value;
    }
  }

  return summary;
};

const rateOf = (state: State, effects: EffectSummary) => {
  const prestigeMult = 1 + (state.prestige + effects.prestigeBonus) * 0.1;
  return GENERATORS.reduce((sum, g) => {
    if (g.id === "click") return sum;
    const c = state.gens[g.id]?.count ?? 0;
    const mult = effects.globalGeneratorMultiplier * (effects.generatorMultipliers[g.id] ?? 1);
    return sum + c * g.baseRate * mult * prestigeMult;
  }, 0);
};

const nextCost = (def: GeneratorDef, count: number) =>
  Math.ceil(def.baseCost * Math.pow(def.costMult, count));

const researchCost = (def: PrestigeResearchDef, level: number) =>
  Math.ceil(def.baseCost * Math.pow(def.costMult, level));

const applyUnlockEffects = (state: State, effects: Effect[]): State => {
  let autoBuyers = state.autoBuyers;
  let changed = false;
  for (const effect of effects) {
    if (effect.kind === "autoBuyer") {
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
  }
  if (!changed) return state;
  return { ...state, autoBuyers };
};

const ensureAutoBuyersForState = (state: State): State => {
  let current = state;
  for (const up of UPGRADES) {
    if (current.upgrades[up.id]) {
      current = applyUnlockEffects(current, up.effects);
    }
  }
  for (const milestone of MILESTONES) {
    if (current.milestones[milestone.id]) {
      current = applyUnlockEffects(current, milestone.effects);
    }
  }
  for (const upgrade of PRESTIGE_UPGRADES) {
    if (current.prestigeUpgrades[upgrade.id]) {
      current = applyUnlockEffects(current, upgrade.effects);
    }
  }
  for (const research of PRESTIGE_RESEARCH) {
    const level = current.prestigeResearch[research.id] ?? 0;
    if (level > 0) {
      current = applyUnlockEffects(current, research.effect(level));
    }
  }
  return current;
};

const resetAutoBuyerTimers = (autoBuyers: AutoBuyerState): AutoBuyerState => {
  const entries = Object.entries(autoBuyers);
  if (entries.length === 0) return autoBuyers;
  const next: AutoBuyerState = {};
  for (const [id, entry] of entries) {
    next[id] = { ...entry, timer: 0 };
  }
  return next;
};

const processAutoBuyers = (state: State, energy: number, dt: number) => {
  if (Object.keys(state.autoBuyers).length === 0) {
    return { energy, gens: state.gens, autoBuyers: state.autoBuyers };
  }

  let currentEnergy = energy;
  let gens = state.gens;
  let autoBuyers: AutoBuyerState = state.autoBuyers;
  let autoMutated = false;
  let gensMutated = false;

  for (const [id, entry] of Object.entries(state.autoBuyers)) {
    if (!entry) continue;
    if (!entry.enabled) {
      if (entry.timer !== 0) {
        if (!autoMutated) {
          autoBuyers = { ...autoBuyers };
          autoMutated = true;
        }
        autoBuyers[id] = { ...entry, timer: 0 };
      }
      continue;
    }

    const def = GENERATORS.find(g => g.id === id);
    if (!def) continue;

    let timer = entry.timer + dt;
    let workingEnergy = currentEnergy;
    let workingGens = gens;
    let localMutated = false;

    while (timer >= entry.interval) {
      const currentCount = workingGens[id]?.count ?? 0;
      const cost = nextCost(def, currentCount);
      if (workingEnergy >= cost) {
        if (!localMutated) {
          workingGens = { ...workingGens };
          localMutated = true;
        }
        workingGens[id] = { count: currentCount + 1 };
        workingEnergy -= cost;
        timer -= entry.interval;
      } else {
        break;
      }
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

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "TICK": {
      const effects = summarizeEffects({
        upgrades: state.upgrades,
        milestones: state.milestones,
        prestigeUpgrades: state.prestigeUpgrades,
        prestigeResearch: state.prestigeResearch,
      });
      const gain = rateOf(state, effects) * action.dt;
      const updated = processAutoBuyers(state, state.energy + gain, action.dt);
      return {
        ...state,
        energy: updated.energy,
        totalEnergy: state.totalEnergy + gain,
        gens: updated.gens,
        autoBuyers: updated.autoBuyers,
      };
    }
    case "CLICK": {
      const effects = summarizeEffects({
        upgrades: state.upgrades,
        milestones: state.milestones,
        prestigeUpgrades: state.prestigeUpgrades,
        prestigeResearch: state.prestigeResearch,
      });
      const prestigeMult = 1 + (state.prestige + effects.prestigeBonus) * 0.1;
      const add = CLICK_BASE_GAIN * effects.clickMultiplier * prestigeMult;
      return { ...state, energy: state.energy + add, totalEnergy: state.totalEnergy + add };
    }
    case "BUY": {
      const def = GENERATORS.find(x => x.id === action.id);
      if (!def) return state;
      if (def.id === "click") return state;
      const current = state.gens[def.id]?.count ?? 0;
      const cost = nextCost(def, current);
      if (state.energy < cost) return state;
      return {
        ...state,
        energy: state.energy - cost,
        gens: { ...state.gens, [def.id]: { count: current + 1 } },
      };
    }
    case "PRESTIGE": {
      if (state.totalEnergy < PRESTIGE_REQ) return state;
      const gained = PRESTIGE_CONVERT(state.totalEnergy);
      return {
        ...state,
        energy: 0,
        totalEnergy: 0,
        gens: makeDefaultGenState(),
        prestige: state.prestige + gained,
        lastTs: typeof performance !== "undefined" ? performance.now() : Date.now(),
        autoBuyers: resetAutoBuyerTimers(state.autoBuyers),
      };
    }
    case "BUY_UPGRADE": {
      const def = UPGRADES.find(x => x.id === action.id);
      if (!def) return state;
      if (state.upgrades[def.id]) return state;
      if ((def.unlockAt ?? 0) > state.totalEnergy) return state;
      if (state.energy < def.cost) return state;
      const next: State = {
        ...state,
        energy: state.energy - def.cost,
        upgrades: { ...state.upgrades, [def.id]: true },
      };
      return applyUnlockEffects(next, def.effects);
    }
    case "CLAIM_MILESTONE": {
      const def = MILESTONES.find(x => x.id === action.id);
      if (!def) return state;
      if (state.milestones[def.id]) return state;
      if (state.totalEnergy < def.threshold) return state;
      const next: State = {
        ...state,
        milestones: { ...state.milestones, [def.id]: true },
      };
      return applyUnlockEffects(next, def.effects);
    }
    case "BUY_PRESTIGE_UPGRADE": {
      const def = PRESTIGE_UPGRADES.find(x => x.id === action.id);
      if (!def) return state;
      if (state.prestigeUpgrades[def.id]) return state;
      if ((def.unlockAtPrestige ?? 0) > state.prestige) return state;
      if ((def.unlockAtTotal ?? 0) > state.totalEnergy) return state;
      if (state.prestige < def.cost) return state;
      const next: State = {
        ...state,
        prestige: state.prestige - def.cost,
        prestigeUpgrades: { ...state.prestigeUpgrades, [def.id]: true },
      };
      return applyUnlockEffects(next, def.effects);
    }
    case "BUY_PRESTIGE_RESEARCH": {
      const def = PRESTIGE_RESEARCH.find(x => x.id === action.id);
      if (!def) return state;
      const level = state.prestigeResearch[def.id] ?? 0;
      if ((def.unlockAtPrestige ?? 0) > state.prestige) return state;
      if ((def.unlockAtTotal ?? 0) > state.totalEnergy) return state;
      const cost = researchCost(def, level);
      if (state.prestige < cost) return state;
      const nextLevel = level + 1;
      const next: State = {
        ...state,
        prestige: state.prestige - cost,
        prestigeResearch: { ...state.prestigeResearch, [def.id]: nextLevel },
      };
      return applyUnlockEffects(next, def.effect(nextLevel));
    }
    case "TOGGLE_AUTOBUYER": {
      const current = state.autoBuyers[action.id];
      if (!current) return state;
      if (current.enabled === action.enabled) return state;
      return {
        ...state,
        autoBuyers: {
          ...state.autoBuyers,
          [action.id]: { ...current, enabled: action.enabled, timer: action.enabled ? current.timer : 0 },
        },
      };
    }
    case "LOAD":
      return ensureAutoBuyersForState(action.payload);
    default: return state;
  }
}

type Ctx = {
  state: State;
  dispatch: React.Dispatch<Action>;
  rate: number;
  costOf: (id: string) => number;
  canPrestige: boolean;
  offlineGain: number;
  ackOfflineGain: () => void;
  clickGain: number;
  prestigeMult: number;
  effects: EffectSummary;
};
const GameCtx = createContext<Ctx | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, baseDispatch] = useReducer(reducer, initial);
  const stateRef = useRef<State>(initial);
  const initializedRef = useRef(false);
  const saveRef = useRef<number>(0);
  const pendingImmediateSave = useRef(false);
  const latestSnapshotRef = useRef<State>(initial);
  const idleHandleRef = useRef<number | null>(null);
  const [offlineGain, setOfflineGain] = useState(0);
  const effects = useMemo(
    () => summarizeEffects({
      upgrades: state.upgrades,
      milestones: state.milestones,
      prestigeUpgrades: state.prestigeUpgrades,
      prestigeResearch: state.prestigeResearch,
    }),
    [state.upgrades, state.milestones, state.prestigeUpgrades, state.prestigeResearch],
  );
  const rate = useMemo(() => rateOf(state, effects), [state.gens, state.prestige, effects]);
  const prestigeMult = useMemo(() => 1 + (state.prestige + effects.prestigeBonus) * 0.1, [state.prestige, effects]);
  const clickGain = useMemo(() => CLICK_BASE_GAIN * effects.clickMultiplier * prestigeMult, [effects, prestigeMult]);
  const costOf = useCallback((id: string) => {
    const def = GENERATORS.find(g => g.id === id)!;
    const cnt = state.gens[id]?.count ?? 0;
    return nextCost(def, cnt);
  }, [state.gens]);
  const canPrestige = state.totalEnergy >= PRESTIGE_REQ;

  stateRef.current = state;

  const flushPersist = useCallback((forceLocal = false) => {
    if (idleHandleRef.current !== null && typeof window !== "undefined") {
      if (typeof (window as any).cancelIdleCallback === "function") {
        (window as any).cancelIdleCallback(idleHandleRef.current);
      } else {
        clearTimeout(idleHandleRef.current);
      }
      idleHandleRef.current = null;
    }
    const now = Date.now();
    saveRef.current = now;
    const snapshot = { ...latestSnapshotRef.current, lastTs: now };
    void saveGameState(snapshot, { forceLocal });
  }, []);

  const schedulePersist = useCallback(() => {
    if (typeof window === "undefined") {
      flushPersist();
      return;
    }
    if (idleHandleRef.current !== null) return;
    const run = () => {
      idleHandleRef.current = null;
      flushPersist();
    };
    if (typeof (window as any).requestIdleCallback === "function") {
      idleHandleRef.current = (window as any).requestIdleCallback(run, { timeout: 500 });
    } else {
      idleHandleRef.current = window.setTimeout(run, 120);
    }
  }, [flushPersist]);

  const persist = useCallback(() => {
    latestSnapshotRef.current = stateRef.current;
    schedulePersist();
  }, [schedulePersist]);

  const dispatch = useCallback((action: Action) => {
    if (action.type !== "TICK") {
      pendingImmediateSave.current = true;
    }
    baseDispatch(action);
  }, [baseDispatch]);

  const ackOfflineGain = useCallback(() => setOfflineGain(0), []);

  useEffect(() => {
    if (!pendingImmediateSave.current) return;
    pendingImmediateSave.current = false;
    persist();
  }, [state, persist]);

  // load + offline progress
  useEffect(() => {
    const populate = async () => {
      const now = Date.now();
      const applyLoaded = (stored: State | null) => {
        if (initializedRef.current) return;
        initializedRef.current = true;
        if (stored) {
          const baseAuto: AutoBuyerState = {};
          if (stored.autoBuyers) {
            for (const [id, entry] of Object.entries(stored.autoBuyers)) {
              if (!entry) continue;
              const cfg = AUTO_BUYER_CONFIG.get(id);
              const interval = typeof entry.interval === "number" && entry.interval > 0
                ? entry.interval
                : cfg?.interval ?? 5;
              baseAuto[id] = {
                enabled: Boolean(entry.enabled),
                interval,
                timer: 0,
              };
            }
          }

          let loaded: State = {
            ...initial,
            ...stored,
            gens: { ...makeDefaultGenState(), ...stored.gens },
            upgrades: { ...makeDefaultUpgradeState(), ...stored.upgrades },
            milestones: { ...makeDefaultMilestoneState(), ...stored.milestones },
            prestigeUpgrades: { ...makeDefaultPrestigeUpgradeState(), ...stored.prestigeUpgrades },
            prestigeResearch: { ...makeDefaultPrestigeResearchState(), ...stored.prestigeResearch },
            autoBuyers: baseAuto,
          };
          loaded = ensureAutoBuyersForState(loaded);
          loaded = { ...loaded, autoBuyers: resetAutoBuyerTimers(loaded.autoBuyers) };

          const rawTs = typeof loaded.lastTs === "number" ? loaded.lastTs : Number.NaN;
          const nowSafe = Number.isFinite(now) ? now : Date.now();
          const legacyThreshold = 10_000_000_000; // ~Sat Nov 20 2286 using ms, plenty above any perf.now values
          const normalizedTs = Number.isFinite(rawTs) && rawTs > 0
            ? (rawTs < legacyThreshold ? nowSafe : rawTs)
            : nowSafe;
          const msGap = Math.max(0, nowSafe - normalizedTs);
          const dt = msGap / 1000;
          const effectSnapshot = summarizeEffects({
            upgrades: loaded.upgrades,
            milestones: loaded.milestones,
            prestigeUpgrades: loaded.prestigeUpgrades,
            prestigeResearch: loaded.prestigeResearch,
          });
          const tempRate = rateOf(loaded, effectSnapshot);
          const gain = tempRate * dt;
          loaded.energy += gain;
          loaded.totalEnergy += gain;
          loaded.lastTs = nowSafe;
          baseDispatch({ type: "LOAD", payload: loaded });
          setOfflineGain(gain > 0 ? gain : 0);
        } else {
          baseDispatch({
            type: "LOAD",
            payload: {
              ...initial,
              gens: makeDefaultGenState(),
              upgrades: makeDefaultUpgradeState(),
              milestones: makeDefaultMilestoneState(),
              prestigeUpgrades: makeDefaultPrestigeUpgradeState(),
              prestigeResearch: makeDefaultPrestigeResearchState(),
              lastTs: now,
            },
          });
          setOfflineGain(0);
        }
      };

      const sync = loadGameStateSync<State>();
      if (sync) {
        applyLoaded(sync);
        return;
      }

      const asyncStored = await loadGameState<State>();
      applyLoaded(asyncStored);
    };

    void populate();
  }, []);

  // save often
  useEffect(() => {
    const id = window.setInterval(persist, 3000);
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        flushPersist(true);
      }
    };
    const handleBeforeUnload = () => flushPersist(true);
    const handlePageHide = () => flushPersist(true);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(id);
      flushPersist(true);
    };
  }, [persist, flushPersist]);

  // game loop
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = () => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      // cap dt in case of tab resume
      const capped = Math.min(dt, 0.25);
      baseDispatch({ type: "TICK", dt: capped });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      rate,
      costOf,
      canPrestige,
      offlineGain,
      ackOfflineGain,
      clickGain,
      prestigeMult,
      effects,
    }),
    [state, dispatch, rate, costOf, canPrestige, offlineGain, ackOfflineGain, clickGain, prestigeMult, effects],
  );
  return <GameCtx.Provider value={value}>{children}</GameCtx.Provider>;
};

export const useGame = () => {
  const ctx = useContext(GameCtx);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
};