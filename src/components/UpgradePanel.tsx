import { motion } from "framer-motion";
import { UPGRADES } from "../game/config";
import { useGame } from "../game/GameProvider";
import { format } from "../utils/format";

export default function UpgradePanel() {
  const { state, dispatch } = useGame();

  return (
    <div className="space-y-3">
      {UPGRADES.map((upgrade, index) => {
        const isUnlocked = (upgrade.unlockAt ?? 0) <= state.totalEnergy;
        const purchased = Boolean(state.upgrades[upgrade.id]);
        const canAfford = state.energy >= upgrade.cost;
        const canBuy = isUnlocked && !purchased && canAfford;
        const statusLabel = purchased
          ? "Purchased"
          : isUnlocked
            ? `Cost: ${format(upgrade.cost)}`
            : `Unlocks at ${format(upgrade.unlockAt ?? 0)} total insight`;

        const containerClasses = [
          "flex flex-col gap-3 rounded-2xl border bg-emerald-500/10 p-4 shadow-lg shadow-emerald-900/20 backdrop-blur card-glow",
          purchased ? "border-emerald-400/50" : "border-emerald-500/30",
          !isUnlocked ? "opacity-60" : "",
        ]
          .filter(Boolean)
          .join(" ");

        const buttonClasses = [
          "group relative overflow-hidden rounded-xl px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] transition",
          purchased
            ? "bg-emerald-500/30 text-emerald-100 cursor-not-allowed"
            : canBuy
              ? "bg-emerald-400 text-slate-900 shadow-lg shadow-emerald-400/40"
              : "bg-slate-800/60 text-emerald-200/60 cursor-not-allowed",
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
              <div className="font-semibold text-emerald-100">{upgrade.name}</div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-emerald-200/70">{statusLabel}</div>
              <div className="mt-2 text-sm text-emerald-100/90">{upgrade.description}</div>
            </div>
            <motion.button
              whileTap={canBuy ? { scale: 0.94 } : undefined}
              onClick={() => canBuy && dispatch({ type: "BUY_UPGRADE", id: upgrade.id })}
              disabled={!canBuy}
              className={buttonClasses}
            >
              <span className="relative z-10">
                {purchased ? "Owned" : isUnlocked ? `Upgrade • ${format(upgrade.cost)}` : "Locked"}
              </span>
              {canBuy && (
                <motion.span
                  className="absolute inset-0 translate-y-full bg-gradient-to-r from-emerald-300/60 via-teal-300/60 to-sky-300/60"
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
