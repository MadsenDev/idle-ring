import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import {
  AUTO_BUYER_CONFIG,
  MILESTONES,
  PRESTIGE_CONVERT,
  PRESTIGE_REQ,
  UPGRADES,
} from "./config";
import { loadGameState, loadGameStateSync, saveGameState } from "../utils/persist";
import {
  applyUnlockEffects,
  ensureAutoBuyersForState,
  processAutoBuyers,
  resetAutoBuyerTimers,
} from "./autoBuyers";
import {
  calculateClickGain,
  calculatePrestigeMultiplier,
  calculateRate,
  getGeneratorDef,
  nextCost,
} from "./economy";
import { getEffectSummary } from "./effects";
import {
  createInitialState,
  makeDefaultGenState,
  makeDefaultMilestoneState,
  makeDefaultUpgradeState,
} from "./types";
import type { AutoBuyerState, BaseState, EffectSummary } from "./types";

const MIN_AUTOSAVE_INTERVAL = 12_000;

type State = BaseState;

type BuyAmount = number | "max";

type Action =
  | { type: "TICK"; dt: number }
  | { type: "CLICK" }
  | { type: "BUY"; id: string; amount?: BuyAmount }
  | { type: "LOAD"; payload: State }
  | { type: "PRESTIGE" }
  | { type: "BUY_UPGRADE"; id: string }
  | { type: "CLAIM_MILESTONE"; id: string }
  | { type: "TOGGLE_AUTOBUYER"; id: string; enabled: boolean };

const initial: State = createInitialState();

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "TICK": {
      const effects = getEffectSummary(state.upgrades, state.milestones);
      const gain = calculateRate(state, effects) * action.dt;
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
      const effects = getEffectSummary(state.upgrades, state.milestones);
      const prestigeMult = calculatePrestigeMultiplier(state, effects);
      const add = calculateClickGain(effects, prestigeMult);
      return { ...state, energy: state.energy + add, totalEnergy: state.totalEnergy + add };
    }
    case "BUY": {
      const def = getGeneratorDef(action.id);
      if (!def || def.id === "click") return state;
      const current = state.gens[def.id]?.count ?? 0;
      const amount = action.amount ?? 1;
      const limit = amount === "max" ? Number.POSITIVE_INFINITY : Math.max(1, Math.floor(amount));
      let remainingEnergy = state.energy;
      let nextCount = current;
      let purchased = 0;

      while (purchased < limit) {
        if (amount === "max" && purchased >= 1_000_000) break;
        const cost = nextCost(def.id, nextCount);
        if (remainingEnergy < cost) break;
        remainingEnergy -= cost;
        nextCount += 1;
        purchased += 1;
      }

      if (purchased === 0) return state;

      return {
        ...state,
        energy: remainingEnergy,
        gens: { ...state.gens, [def.id]: { count: nextCount } },
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
      const def = UPGRADES.find((upgrade) => upgrade.id === action.id);
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
      const def = MILESTONES.find((milestone) => milestone.id === action.id);
      if (!def) return state;
      if (state.milestones[def.id]) return state;
      if (state.totalEnergy < def.threshold) return state;
      const next: State = {
        ...state,
        milestones: { ...state.milestones, [def.id]: true },
      };
      return applyUnlockEffects(next, def.effects);
    }
    case "TOGGLE_AUTOBUYER": {
      const current = state.autoBuyers[action.id];
      if (!current || current.enabled === action.enabled) return state;
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
    default:
      return state;
  }
};

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
  const lastPersistedPayloadRef = useRef<string | null>(null);
  const idleHandleRef = useRef<number | null>(null);
  const [offlineGain, setOfflineGain] = useState(0);
  const effects = useMemo(
    () => getEffectSummary(state.upgrades, state.milestones),
    [state.upgrades, state.milestones],
  );
  const rate = useMemo(() => calculateRate(state, effects), [state.gens, state.prestige, effects]);
  const prestigeMult = useMemo(() => calculatePrestigeMultiplier(state, effects), [state.prestige, effects]);
  const clickGain = useMemo(() => calculateClickGain(effects, prestigeMult), [effects, prestigeMult]);
  const costOf = useCallback(
    (id: string) => {
      const cnt = state.gens[id]?.count ?? 0;
      return nextCost(id, cnt);
    },
    [state.gens],
  );
  const canPrestige = state.totalEnergy >= PRESTIGE_REQ;

  stateRef.current = state;
  latestSnapshotRef.current = state;

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
    const snapshot = { ...latestSnapshotRef.current, lastTs: now };
    const payload = JSON.stringify(snapshot);
    if (!forceLocal && payload === lastPersistedPayloadRef.current) {
      saveRef.current = now;
      return;
    }
    saveRef.current = now;
    lastPersistedPayloadRef.current = payload;
    void saveGameState(payload, { forceLocal });
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

  const persist = useCallback((options: { immediate?: boolean } = {}) => {
    const immediate = options.immediate ?? false;
    latestSnapshotRef.current = stateRef.current;

    if (!immediate) {
      const lastSave = saveRef.current;
      if (lastSave !== 0 && Date.now() - lastSave < MIN_AUTOSAVE_INTERVAL) {
        return;
      }
    }

    if (typeof window === "undefined" || immediate) {
      flushPersist();
      return;
    }

    schedulePersist();
  }, [flushPersist, schedulePersist]);

  const dispatch = useCallback((action: Action) => {
    if (action.type !== "TICK" && action.type !== "CLICK") {
      pendingImmediateSave.current = true;
    }
    baseDispatch(action);
  }, [baseDispatch]);

  const ackOfflineGain = useCallback(() => setOfflineGain(0), []);

  useEffect(() => {
    if (!pendingImmediateSave.current) return;
    pendingImmediateSave.current = false;
    persist({ immediate: true });
  }, [state, persist]);

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
            autoBuyers: baseAuto,
          };
          loaded = ensureAutoBuyersForState(loaded);
          loaded = { ...loaded, autoBuyers: resetAutoBuyerTimers(loaded.autoBuyers) };

          const rawTs = typeof loaded.lastTs === "number" ? loaded.lastTs : Number.NaN;
          const nowSafe = Number.isFinite(now) ? now : Date.now();
          const legacyThreshold = 10_000_000_000;
          const normalizedTs = Number.isFinite(rawTs) && rawTs > 0
            ? (rawTs < legacyThreshold ? nowSafe : rawTs)
            : nowSafe;
          const msGap = Math.max(0, nowSafe - normalizedTs);
          const dt = msGap / 1000;
          const effectSnapshot = getEffectSummary(loaded.upgrades, loaded.milestones);
          const tempRate = calculateRate(loaded, effectSnapshot);
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

  useEffect(() => {
    const id = window.setInterval(() => persist(), 3000);
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

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = () => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
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
