import { motion } from "framer-motion";
import { MILESTONES } from "../game/config";
import { useGame } from "../game/GameProvider";
import { format } from "../utils/format";

export default function MilestonesPanel() {
  const { state, dispatch } = useGame();

  return (
    <div className="space-y-3">
      {MILESTONES.map((milestone, index) => {
        const claimed = Boolean(state.milestones[milestone.id]);
        const progressRaw = Math.min(state.totalEnergy / milestone.threshold, 1);
        const canClaim = !claimed && progressRaw >= 1;
        const progressPercent = Math.floor(progressRaw * 100);

        const containerClasses = [
          "flex flex-col gap-4 rounded-2xl border bg-fuchsia-500/10 p-4 shadow-lg shadow-fuchsia-900/20 backdrop-blur card-glow",
          claimed ? "border-fuchsia-400/50" : "border-fuchsia-500/40",
        ].join(" ");

        const buttonClasses = [
          "group relative self-start overflow-hidden rounded-xl px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] transition",
          claimed
            ? "bg-fuchsia-500/20 text-fuchsia-100 cursor-not-allowed"
            : canClaim
              ? "bg-fuchsia-400 text-slate-900 shadow-lg shadow-fuchsia-400/40"
              : "bg-slate-800/60 text-fuchsia-200/60 cursor-not-allowed",
        ].join(" ");

        return (
          <motion.div
            key={milestone.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.05 }}
            className={containerClasses}
          >
            <div>
              <div className="font-semibold text-fuchsia-100">{milestone.name}</div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-fuchsia-200/70">Goal: {format(milestone.threshold)} total insight</div>
              <div className="mt-2 text-sm text-fuchsia-100/90">{milestone.description}</div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-fuchsia-400 via-rose-400 to-amber-300"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.3em] text-fuchsia-100/70">
                Progress {format(Math.min(state.totalEnergy, milestone.threshold))}/{format(milestone.threshold)} ({progressPercent}%)
              </div>
            </div>
            <motion.button
              whileTap={canClaim ? { scale: 0.94 } : undefined}
              onClick={() => canClaim && dispatch({ type: "CLAIM_MILESTONE", id: milestone.id })}
              disabled={!canClaim}
              className={buttonClasses}
            >
              <span className="relative z-10">{claimed ? "Claimed" : canClaim ? "Claim Reward" : "Locked"}</span>
              {canClaim && (
                <motion.span
                  className="absolute inset-0 translate-y-full bg-gradient-to-r from-fuchsia-300/60 via-rose-300/60 to-amber-300/60"
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
