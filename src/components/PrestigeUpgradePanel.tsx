import { motion } from "framer-motion";
import { PRESTIGE_UPGRADES } from "../game/config";
import { useGame } from "../game/GameProvider";
import { format } from "../utils/format";

export default function PrestigeUpgradePanel() {
  const { state, dispatch } = useGame();

  return (
    <div className="space-y-3">
      {PRESTIGE_UPGRADES.map((upgrade, index) => {
        const purchased = Boolean(state.prestigeUpgrades[upgrade.id]);
        const prestigeEnough = state.prestige >= upgrade.cost;
        const prestigeUnlocked = (upgrade.unlockAtPrestige ?? 0) <= state.prestige;
        const totalUnlocked = (upgrade.unlockAtTotal ?? 0) <= state.totalEnergy;
        const unlocked = prestigeUnlocked && totalUnlocked;
        const canBuy = unlocked && !purchased && prestigeEnough;

        const requirementSegments: string[] = [];
        if (!prestigeUnlocked && (upgrade.unlockAtPrestige ?? 0) > 0) {
          requirementSegments.push(`${upgrade.unlockAtPrestige ?? 0} prestige`);
        }
        if (!totalUnlocked && (upgrade.unlockAtTotal ?? 0) > 0) {
          requirementSegments.push(`${format(upgrade.unlockAtTotal ?? 0)} total energy`);
        }
        const statusLabel = purchased
          ? "Purchased"
          : unlocked
            ? `Cost: ${upgrade.cost} prestige`
            : requirementSegments.length > 0
              ? `Requires ${requirementSegments.join(" & ")}`
              : `Cost: ${upgrade.cost} prestige`;

        const containerClasses = [
          "flex flex-col gap-3 rounded-2xl border bg-amber-500/10 p-4 shadow-lg shadow-amber-900/20 backdrop-blur card-glow",
          purchased ? "border-amber-400/50" : "border-amber-500/30",
          !unlocked ? "opacity-70" : "",
        ]
          .filter(Boolean)
          .join(" ");

        const buttonClasses = [
          "group relative overflow-hidden rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] transition",
          purchased
            ? "bg-amber-500/30 text-amber-100 cursor-not-allowed"
            : canBuy
              ? "bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/40"
              : "bg-slate-800/60 text-amber-200/60 cursor-not-allowed",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <motion.div
            key={upgrade.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.05 }}
            className={containerClasses}
          >
            <div>
              <div className="font-semibold text-amber-100">{upgrade.name}</div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-amber-200/70">{statusLabel}</div>
              <div className="mt-2 text-sm text-amber-100/90">{upgrade.description}</div>
            </div>
            <motion.button
              whileTap={canBuy ? { scale: 0.94 } : undefined}
              onClick={() => canBuy && dispatch({ type: "BUY_PRESTIGE_UPGRADE", id: upgrade.id })}
              disabled={!canBuy}
              className={buttonClasses}
            >
              <span className="relative z-10">
                {purchased ? "Owned" : unlocked ? `Empower • ${upgrade.cost}P` : "Locked"}
              </span>
              {canBuy && (
                <motion.span
                  className="absolute inset-0 translate-y-full bg-gradient-to-r from-amber-300/60 via-rose-300/60 to-fuchsia-300/60"
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
