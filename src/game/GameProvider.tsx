import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { CLICK_BASE_GAIN, GENERATORS, PRESTIGE_CONVERT, PRESTIGE_REQ } from "./config";
import type { GeneratorDef } from "./config";
import { loadGameState, loadGameStateSync, saveGameState } from "../utils/persist";

type GenState = Record<string, { count: number }>;

type State = {
  energy: number;
  totalEnergy: number;
  gens: GenState;
  prestige: number;     // prestige points
  lastTs: number;       // ms for offline calc
};

type Action =
  | { type: "TICK"; dt: number }                       // dt in seconds
  | { type: "CLICK" }
  | { type: "BUY"; id: string }
  | { type: "LOAD"; payload: State }
  | { type: "PRESTIGE" }
  ;

const makeDefaultGenState = () => Object.fromEntries(GENERATORS.map(g => [g.id, { count: 0 }]));

const initial: State = {
  energy: 0,
  totalEnergy: 0,
  gens: makeDefaultGenState(),
  prestige: 0,
  lastTs: Date.now(),
};

const rateOf = (state: State) => {
  // global prestige multiplier: 1 + 0.1 per point
  const mult = 1 + state.prestige * 0.1;
  return GENERATORS.reduce((sum, g) => {
    if (g.id === "click") return sum;
    const c = state.gens[g.id]?.count ?? 0;
    return sum + c * g.baseRate * mult;
  }, 0);
};

const nextCost = (def: GeneratorDef, count: number) =>
  Math.ceil(def.baseCost * Math.pow(def.costMult, count));

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "TICK": {
      const gain = rateOf(state) * action.dt;
      if (gain <= 0) return { ...state };
      const energy = state.energy + gain;
      return { ...state, energy, totalEnergy: state.totalEnergy + gain };
    }
    case "CLICK": {
      const add = CLICK_BASE_GAIN * (1 + state.prestige * 0.1);
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
        energy: 0,
        totalEnergy: 0,
        gens: makeDefaultGenState(),
        prestige: state.prestige + gained,
        lastTs: performance.now(),
      };
    }
    case "LOAD": return action.payload;
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
  const rate = useMemo(() => rateOf(state), [state]);
  const costOf = useCallback((id: string) => {
    const def = GENERATORS.find(g => g.id === id)!;
    const cnt = state.gens[id]?.count ?? 0;
    return nextCost(def, cnt);
  }, [state]);
  const canPrestige = state.totalEnergy >= PRESTIGE_REQ;

  stateRef.current = state;

  const flushPersist = useCallback(() => {
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
    void saveGameState(snapshot);
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
          const loaded: State = {
            ...initial,
            ...stored,
            gens: { ...makeDefaultGenState(), ...stored.gens },
          };
          const rawTs = typeof loaded.lastTs === "number" ? loaded.lastTs : Number.NaN;
          const nowSafe = Number.isFinite(now) ? now : Date.now();
          const legacyThreshold = 10_000_000_000; // ~Sat Nov 20 2286 using ms, plenty above any perf.now values
          const normalizedTs = Number.isFinite(rawTs) && rawTs > 0
            ? (rawTs < legacyThreshold ? nowSafe : rawTs)
            : nowSafe;
          const msGap = Math.max(0, nowSafe - normalizedTs);
          const dt = msGap / 1000;
          const mult = 1 + (loaded.prestige ?? 0) * 0.1;
          const tempRate = GENERATORS.reduce((sum, g) => {
            if (g.id === "click") return sum;
            const c = loaded.gens[g.id]?.count ?? 0;
            return sum + c * g.baseRate * mult;
          }, 0);
          const gain = tempRate * dt;
          loaded.energy += gain;
          loaded.totalEnergy += gain;
          loaded.lastTs = nowSafe;
          baseDispatch({ type: "LOAD", payload: loaded });
          setOfflineGain(gain > 0 ? gain : 0);
        } else {
          baseDispatch({ type: "LOAD", payload: { ...initial, gens: makeDefaultGenState(), lastTs: now } });
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
        flushPersist();
      }
    };
    window.addEventListener("beforeunload", flushPersist);
    window.addEventListener("pagehide", flushPersist);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("beforeunload", flushPersist);
      window.removeEventListener("pagehide", flushPersist);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(id);
      flushPersist();
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

  const value = useMemo(() => ({ state, dispatch, rate, costOf, canPrestige, offlineGain, ackOfflineGain }), [state, dispatch, rate, costOf, canPrestige, offlineGain, ackOfflineGain]);
  return <GameCtx.Provider value={value}>{children}</GameCtx.Provider>;
};

export const useGame = () => {
  const ctx = useContext(GameCtx);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
};