import { motion } from "framer-motion";
import { useState } from "react";
import { GENERATORS } from "../game/config";
import { useGame } from "../game/GameProvider";
import { format } from "../utils/format";
import type { GeneratorDef } from "../game/config";

const formatMultiplier = (value: number) => `${value.toFixed(2)}x`;

const formatPrecise = (value: number) => {
  if (!Number.isFinite(value)) return "0";
  const abs = Math.abs(value);
  const decimals = abs >= 100 ? 0 : abs >= 10 ? 1 : 2;
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

type BuyMode = 1 | 25 | 50 | "max";

const BUY_OPTIONS: { mode: BuyMode; label: string }[] = [
  { mode: 1, label: "Buy 1" },
  { mode: 25, label: "Buy 25" },
  { mode: 50, label: "Buy 50" },
  { mode: "max", label: "Buy Max" },
];

const costAtCount = (def: GeneratorDef, count: number) =>
  Math.ceil(def.baseCost * Math.pow(def.costMult, count));

const calculatePurchasePreview = (
  def: GeneratorDef,
  startCount: number,
  availableEnergy: number,
  mode: BuyMode,
) => {
  const nextCost = costAtCount(def, startCount);

  if (mode === "max") {
    let quantity = 0;
    let totalCost = 0;
    let remainingEnergy = availableEnergy;
    let currentCount = startCount;

    while (quantity < 1_000_000) {
      const cost = costAtCount(def, currentCount);
      if (remainingEnergy < cost) break;
      remainingEnergy -= cost;
      totalCost += cost;
      quantity += 1;
      currentCount += 1;
    }

    return { quantity, cost: totalCost, nextCost };
  }

  let quantity = 0;
  let totalCost = 0;
  let remainingEnergy = availableEnergy;
  let currentCount = startCount;

  while (quantity < mode) {
    const cost = costAtCount(def, currentCount);
    if (remainingEnergy < cost) break;
    remainingEnergy -= cost;
    totalCost += cost;
    quantity += 1;
    currentCount += 1;
  }

  return { quantity, cost: totalCost, nextCost };
};

export default function GeneratorList() {
  const { state, dispatch, effects, prestigeMult, rate } = useGame();
  const [buyMode, setBuyMode] = useState<BuyMode>(1);

  const globalMultiplier = effects.globalGeneratorMultiplier;
  const prestigeStacks = state.prestige + effects.prestigeBonus;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-sky-400/20 bg-slate-900/60 p-4 shadow-lg shadow-sky-900/20 backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300/70">Insight Flow</div>
            <div className="text-lg font-semibold text-sky-100">{format(rate)} insight / sec</div>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-xs text-slate-200/80 sm:text-right">
            <div>
              <dt className="uppercase tracking-[0.25em] text-slate-400">Prestige Bonus</dt>
              <dd className="font-semibold text-slate-100">{formatPrecise(prestigeStacks)} pts → {formatMultiplier(prestigeMult)}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.25em] text-slate-400">Global Construct Boost</dt>
              <dd className="font-semibold text-slate-100">{formatMultiplier(globalMultiplier)}</dd>
            </div>
          </dl>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-300/80">
          Insight per second is the sum of each construct: <span className="font-semibold text-slate-100">count × base rate × global boosts × construct boosts × prestige multiplier</span>.
        </p>
        <div className="mt-4">
          <div className="text-[11px] uppercase tracking-[0.3em] text-sky-300/70">Purchase Mode</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {BUY_OPTIONS.map(option => {
              const isActive = buyMode === option.mode;
              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => setBuyMode(option.mode)}
                  className={`rounded-xl border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
                    isActive
                      ? "border-sky-400/70 bg-sky-500/20 text-sky-100 shadow-sky-900/20"
                      : "border-white/10 bg-slate-900/60 text-slate-300/80 hover:border-sky-400/40 hover:text-white"
                  }`}
                  aria-pressed={isActive}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {GENERATORS.filter(g => (g.unlockAt ?? 0) <= state.totalEnergy).map(g => {
        if (g.id === "click") return null;
        const count = state.gens[g.id]?.count ?? 0;
        const preview = calculatePurchasePreview(g, count, state.energy, buyMode);
        const canBuy = preview.quantity > 0;
        const desired = buyMode === "max" ? null : buyMode;
        let buttonLabel: string;
        if (buyMode === "max") {
          if (preview.quantity > 0) {
            buttonLabel = `Buy Max (${preview.quantity}) • ${format(preview.cost)}`;
          } else {
            buttonLabel = `Buy Max • ${format(preview.nextCost)}`;
          }
        } else {
          const amountText = preview.quantity > 0 && preview.quantity !== desired
            ? `${desired} (${preview.quantity})`
            : `${desired}`;
          const costText = preview.quantity > 0 ? format(preview.cost) : format(preview.nextCost);
          buttonLabel = `Buy ${amountText} • ${costText}`;
        }

        const amount = buyMode === "max" ? "max" : buyMode;
        const perConstructMultiplier = globalMultiplier * (effects.generatorMultipliers[g.id] ?? 1) * prestigeMult;
        const perConstructRate = g.baseRate * perConstructMultiplier;
        const totalRate = perConstructRate * count;
        return (
          <motion.div
            key={g.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: count * 0.05 }}
            className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-lg shadow-sky-900/20 backdrop-blur card-glow"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-sky-200">{g.name}</div>
                  <div className="text-[11px] uppercase tracking-[0.25em] text-slate-300/70">Owned: {count}</div>
                </div>
                <motion.button
                  whileTap={canBuy ? { scale: 0.94 } : undefined}
                  onClick={() => dispatch({ type: "BUY", id: g.id, amount })}
                  disabled={!canBuy}
                  className={`group relative overflow-hidden rounded-xl px-4 py-2 text-sm font-semibold transition
                    ${canBuy ? "bg-indigo-600 text-white shadow-indigo-500/30 shadow-lg" : "bg-slate-700/50 text-slate-400 cursor-not-allowed"}`}
                >
                  <span className="relative z-10">{buttonLabel}</span>
                  {canBuy && (
                    <motion.span
                      className="absolute inset-0 translate-y-full bg-gradient-to-r from-indigo-400/60 via-sky-400/60 to-emerald-400/60"
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                    />
                  )}
                </motion.button>
              </div>
              <div className="space-y-1 text-xs text-slate-200">
                <div className="flex items-center justify-between">
                  <span>Per construct</span>
                  <span className="font-semibold text-sky-100">{format(perConstructRate)} / sec</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total contribution</span>
                  <span className="font-semibold text-sky-100">{format(totalRate)} / sec</span>
                </div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                  {formatPrecise(g.baseRate)} base × {formatMultiplier(globalMultiplier)} global × {formatMultiplier(effects.generatorMultipliers[g.id] ?? 1)} construct × {formatMultiplier(prestigeMult)} prestige
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}