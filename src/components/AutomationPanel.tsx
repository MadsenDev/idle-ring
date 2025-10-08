import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { GENERATORS, MILESTONES, UPGRADES } from "../game/config";
import { useGame } from "../game/GameProvider";
import { format } from "../utils/format";

type AutoDisplay = {
  id: string;
  label: string;
  description: string;
  interval: number;
  generatorName: string;
  source:
    | { kind: "upgrade"; id: string; name: string; cost: number; unlockAt?: number }
    | { kind: "milestone"; id: string; name: string; threshold: number };
};

const autoDisplays: AutoDisplay[] = (() => {
  const seen = new Set<string>();
  const entries: AutoDisplay[] = [];

  for (const upgrade of UPGRADES) {
    for (const effect of upgrade.effects) {
      if (effect.kind !== "autoBuyer" || seen.has(effect.target)) continue;
      const generatorName = GENERATORS.find(g => g.id === effect.target)?.name ?? effect.target;
      entries.push({
        id: effect.target,
        label: effect.label,
        description: effect.description,
        interval: effect.interval,
        generatorName,
        source: { kind: "upgrade", id: upgrade.id, name: upgrade.name, cost: upgrade.cost, unlockAt: upgrade.unlockAt },
      });
      seen.add(effect.target);
    }
  }

  for (const milestone of MILESTONES) {
    for (const effect of milestone.effects) {
      if (effect.kind !== "autoBuyer" || seen.has(effect.target)) continue;
      const generatorName = GENERATORS.find(g => g.id === effect.target)?.name ?? effect.target;
      entries.push({
        id: effect.target,
        label: effect.label,
        description: effect.description,
        interval: effect.interval,
        generatorName,
        source: { kind: "milestone", id: milestone.id, name: milestone.name, threshold: milestone.threshold },
      });
      seen.add(effect.target);
    }
  }

  return entries.sort((a, b) => a.interval - b.interval);
})();

export default function AutomationPanel() {
  const { state, dispatch } = useGame();

  if (autoDisplays.length === 0) {
    return <div className="text-sm text-cyan-100/80">No automation blueprints yet.</div>;
  }

  return (
    <div className="space-y-3">
      {autoDisplays.map((auto, index) => {
        const entry = state.autoBuyers[auto.id];
        const unlocked = Boolean(entry);
        const enabled = entry?.enabled ?? false;
        const statusLabel = unlocked ? (enabled ? "Running" : "Paused") : "Locked";
        const statusColor = unlocked ? (enabled ? "text-emerald-200" : "text-amber-200") : "text-slate-300/70";

        let requirement: ReactNode = null;
        if (!unlocked) {
          if (auto.source.kind === "upgrade") {
            const owned = Boolean(state.upgrades[auto.source.id]);
            const available = (auto.source.unlockAt ?? 0) <= state.totalEnergy;
            requirement = (
              <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-100/60">
                {owned
                  ? "Purchase upgrade to deploy"
                  : available
                    ? `Buy ${auto.source.name} (${format(auto.source.cost)})`
                    : `Unlocks with ${auto.source.name} at ${format(auto.source.unlockAt ?? 0)} total`}
              </div>
            );
          } else {
            const progress = Math.min(state.totalEnergy / auto.source.threshold, 1);
            requirement = (
              <div className="text-[11px] uppercase tracking-[0.3em] text-cyan-100/60">
                {`Reach ${format(auto.source.threshold)} total (${Math.floor(progress * 100)}%)`}
              </div>
            );
          }
        }

        const containerClasses = [
          "flex flex-col gap-3 rounded-2xl border bg-cyan-500/10 p-4 shadow-lg shadow-cyan-900/20 backdrop-blur card-glow",
          unlocked ? "border-cyan-400/40" : "border-cyan-500/30 opacity-75",
        ].join(" ");

        const buttonClasses = [
          "group relative overflow-hidden rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] transition",
          unlocked
            ? enabled
              ? "bg-emerald-400 text-slate-900 shadow-lg shadow-emerald-400/30"
              : "bg-slate-800/60 text-cyan-100"
            : "bg-slate-800/60 text-cyan-200/40 cursor-not-allowed",
        ].join(" ");

        return (
          <motion.div
            key={auto.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.05 }}
            className={containerClasses}
          >
            <div>
              <div className="font-semibold text-cyan-100">
                {auto.label}
                <span className="ml-2 text-xs uppercase tracking-[0.3em] text-cyan-200/70">{auto.generatorName}</span>
              </div>
              <div className="mt-1 text-sm text-cyan-100/80">{auto.description}</div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.3em] text-cyan-200/70">Interval: every {auto.interval}s</div>
              {requirement}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`text-xs font-semibold uppercase tracking-[0.3em] ${statusColor}`}>{statusLabel}</span>
              <motion.button
                whileTap={unlocked ? { scale: 0.94 } : undefined}
                onClick={() => unlocked && dispatch({ type: "TOGGLE_AUTOBUYER", id: auto.id, enabled: !enabled })}
                disabled={!unlocked}
                className={buttonClasses}
              >
                <span className="relative z-10">{enabled ? "Pause" : unlocked ? "Activate" : "Locked"}</span>
                {unlocked && enabled && (
                  <motion.span
                    className="absolute inset-0 translate-y-full bg-gradient-to-r from-emerald-300/60 via-teal-300/60 to-cyan-300/60"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  />
                )}
              </motion.button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
