import { motion } from "framer-motion";
import { GENERATORS } from "../game/config";
import { useGame } from "../game/GameProvider";
import { format } from "../utils/format";

export default function GeneratorList() {
  const { state, dispatch, costOf } = useGame();

  return (
    <div className="space-y-3">
      {GENERATORS.filter(g => (g.unlockAt ?? 0) <= state.totalEnergy).map(g => {
        if (g.id === "click") return null;
        const cost = costOf(g.id);
        const count = state.gens[g.id]?.count ?? 0;
        const canBuy = state.energy >= cost;
        return (
          <motion.div
            key={g.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: count * 0.05 }}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-lg shadow-sky-900/20 backdrop-blur card-glow"
          >
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
          </motion.div>
        );
      })}
    </div>
  );
}