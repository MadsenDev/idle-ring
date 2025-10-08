import { motion } from "framer-motion";
import { GENERATORS } from "../game/config";
import { useGame } from "../game/GameProvider";
import { format } from "../utils/format";

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

export default function GeneratorList() {
  const { state, dispatch, costOf, effects, prestigeMult, rate } = useGame();

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
      </div>

      {GENERATORS.filter(g => (g.unlockAt ?? 0) <= state.totalEnergy).map(g => {
        if (g.id === "click") return null;
        const cost = costOf(g.id);
        const count = state.gens[g.id]?.count ?? 0;
        const canBuy = state.energy >= cost;
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
                  onClick={() => dispatch({ type: "BUY", id: g.id })}
                  disabled={!canBuy}
                  className={`group relative overflow-hidden rounded-xl px-4 py-2 text-sm font-semibold transition
                    ${canBuy ? "bg-indigo-600 text-white shadow-indigo-500/30 shadow-lg" : "bg-slate-700/50 text-slate-400 cursor-not-allowed"}`}
                >
                  <span className="relative z-10">Buy • {format(cost)}</span>
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