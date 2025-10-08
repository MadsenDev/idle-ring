import { motion } from "framer-motion";
import { PRESTIGE_RESEARCH } from "../game/config";
import { useGame } from "../game/GameProvider";
import { format } from "../utils/format";
import type { PrestigeResearchDef } from "../game/config";

const researchCost = (def: PrestigeResearchDef, level: number) => Math.ceil(def.baseCost * Math.pow(def.costMult, level));

export default function PrestigeResearchPanel() {
  const { state, dispatch } = useGame();

  if (PRESTIGE_RESEARCH.length === 0) {
    return <div className="text-sm text-rose-100/70">No research blueprints discovered yet.</div>;
  }

  return (
    <div className="space-y-3">
      {PRESTIGE_RESEARCH.map((research, index) => {
        const level = state.prestigeResearch[research.id] ?? 0;
        const cost = researchCost(research, level);
        const prestigeUnlocked = (research.unlockAtPrestige ?? 0) <= state.prestige;
        const totalUnlocked = (research.unlockAtTotal ?? 0) <= state.totalEnergy;
        const unlocked = prestigeUnlocked && totalUnlocked;
        const canBuy = unlocked && state.prestige >= cost;

        const requirementSegments: string[] = [];
        if (!prestigeUnlocked && (research.unlockAtPrestige ?? 0) > 0) {
          requirementSegments.push(`${research.unlockAtPrestige ?? 0} prestige`);
        }
        if (!totalUnlocked && (research.unlockAtTotal ?? 0) > 0) {
          requirementSegments.push(`${format(research.unlockAtTotal ?? 0)} total energy`);
        }

        const currentEffect = research.formatEffect(level);
        const nextEffect = research.formatEffect(level + 1);

        const statusLabel = unlocked
          ? `Rank ${level}`
          : requirementSegments.length > 0
            ? `Requires ${requirementSegments.join(" & ")}`
            : `Rank ${level}`;

        const containerClasses = [
          "flex flex-col gap-3 rounded-2xl border bg-indigo-500/10 p-4 shadow-lg shadow-indigo-900/25 backdrop-blur card-glow",
          unlocked ? "border-indigo-400/50" : "border-indigo-500/30 opacity-80",
        ].join(" ");

        const buttonClasses = [
          "group relative overflow-hidden rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] transition",
          canBuy
            ? "bg-indigo-400 text-slate-900 shadow-lg shadow-indigo-400/30"
            : unlocked
              ? "bg-slate-800/60 text-indigo-100/70 cursor-not-allowed"
              : "bg-slate-800/60 text-indigo-100/40 cursor-not-allowed",
        ].join(" ");

        return (
          <motion.div
            key={research.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.05 }}
            className={containerClasses}
          >
            <div>
              <div className="font-semibold text-indigo-100">{research.name}</div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-indigo-200/70">{statusLabel}</div>
              <div className="mt-2 text-sm text-indigo-100/90">{research.description}</div>
              <div className="mt-2 grid gap-1 text-xs uppercase tracking-[0.3em] text-indigo-100/80">
                <span>Current: {currentEffect}</span>
                <span>Next: {nextEffect}</span>
              </div>
            </div>
            <motion.button
              whileTap={canBuy ? { scale: 0.94 } : undefined}
              onClick={() => canBuy && dispatch({ type: "BUY_PRESTIGE_RESEARCH", id: research.id })}
              disabled={!canBuy}
              className={buttonClasses}
            >
              <span className="relative z-10">
                {canBuy ? `Research • ${cost}P` : unlocked ? `Need ${cost}P` : "Locked"}
              </span>
              {canBuy && (
                <motion.span
                  className="absolute inset-0 translate-y-full bg-gradient-to-r from-indigo-300/60 via-sky-300/60 to-rose-300/60"
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
