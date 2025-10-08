import { motion } from "framer-motion";
import { useGame } from "../game/GameProvider";
import { format } from "../utils/format";
import { PRESTIGE_CONVERT, PRESTIGE_REQ } from "../game/config";

export default function PrestigePanel() {
  const { state, dispatch, canPrestige } = useGame();
  const willGet = PRESTIGE_CONVERT(state.totalEnergy);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-100 shadow-lg shadow-amber-900/20 backdrop-blur"
    >
      <div className="font-semibold mb-1 uppercase tracking-[0.35em] text-amber-200">Prestige</div>
      <div className="text-sm text-amber-100/90 mb-4">
        Reset everything to gain Prestige points (+10% insight production each).<br/>
        Requires {format(PRESTIGE_REQ)} total insight. You’ll get: <b>{willGet}</b>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <motion.button
          whileTap={canPrestige ? { scale: 0.94 } : undefined}
          onClick={() => canPrestige && dispatch({ type: "PRESTIGE" })}
          disabled={!canPrestige}
          className={`group relative overflow-hidden rounded-xl px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] transition
            ${canPrestige ? "bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/30 hover:bg-amber-400" : "bg-slate-700/60 text-slate-400 cursor-not-allowed"}`}
        >
          <span className="relative z-10">Ascend (+{willGet})</span>
          {canPrestige && (
            <motion.span
              className="absolute inset-0 translate-y-full bg-gradient-to-r from-amber-400/70 via-rose-400/60 to-fuchsia-400/60"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            />
          )}
        </motion.button>
        <div className="text-xs uppercase tracking-[0.3em] text-amber-100/70">Current: {format(state.prestige)}</div>
      </div>
    </motion.div>
  );
}