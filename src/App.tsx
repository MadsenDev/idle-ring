import { motion } from "framer-motion";
import GeneratorList from "./components/GeneratorList";
import AutomationPanel from "./components/AutomationPanel";
import MilestonesPanel from "./components/MilestonesPanel";
import OfflineGainToast from "./components/OfflineGainToast";
import PrestigePanel from "./components/PrestigePanel";
import Ring from "./components/Ring";
import UpgradePanel from "./components/UpgradePanel";
import { GameProvider, useGame } from "./game/GameProvider";
import { format } from "./utils/format";

function HUD() {
  const { state } = useGame();
  return (
    <motion.div
      className="grid w-full grid-cols-1 gap-3 text-sm sm:grid-cols-3"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="rounded-xl bg-slate-900/60 px-4 py-3 font-semibold shadow-lg shadow-indigo-500/20">
        <div className="text-[11px] uppercase tracking-[0.3em] text-indigo-200/70">Insight</div>
        <div className="text-lg text-indigo-200">{format(state.energy)}</div>
      </div>
      <div className="rounded-xl bg-slate-900/60 px-4 py-3 font-semibold shadow-lg shadow-indigo-500/20">
        <div className="text-[11px] uppercase tracking-[0.3em] text-sky-200/70">Total Insight</div>
        <div className="text-lg text-sky-200">{format(state.totalEnergy)}</div>
      </div>
      <div className="rounded-xl bg-slate-900/60 px-4 py-3 font-semibold shadow-lg shadow-indigo-500/20">
        <div className="text-[11px] uppercase tracking-[0.3em] text-pink-200/70">Prestige</div>
        <div className="text-lg text-pink-200">{state.prestige}</div>
      </div>
    </motion.div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <div className="relative min-h-screen overflow-hidden text-slate-100">
        <div className="cosmic-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto flex min-h-screen max-w-screen-md flex-col gap-6 px-4 pb-12 pt-8 sm:px-6">
          <header className="relative mb-4 flex flex-col gap-2 text-center">
            <motion.h1
              className="text-4xl font-bold tracking-wide text-indigo-200 drop-shadow"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{ fontFamily: "Orbitron, sans-serif" }}
            >
              Idle Ring
            </motion.h1>
            <motion.p
              className="text-sm uppercase tracking-[0.3em] text-indigo-300/80"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
            >
              Balance the proofs • Ascend the ring
            </motion.p>
            <OfflineGainToast />
          </header>

          <motion.section
            className="rounded-3xl border border-indigo-500/30 bg-slate-900/60 p-5 shadow-2xl shadow-indigo-900/30 backdrop-blur card-glow"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <HUD />
            <div className="mt-6 flex justify-center">
              <Ring />
            </div>
          </motion.section>

          <motion.section
            className="rounded-3xl border border-sky-500/30 bg-slate-900/55 p-5 shadow-2xl shadow-sky-900/25 backdrop-blur card-glow"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
          >
            <h2 className="font-semibold uppercase tracking-wider text-sky-200">Constructs</h2>
            <div className="mt-4">
              <GeneratorList />
            </div>
          </motion.section>

          <motion.section
            className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 shadow-2xl shadow-emerald-900/20 backdrop-blur card-glow"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.08 }}
          >
            <h2 className="font-semibold uppercase tracking-wider text-emerald-200">Upgrades</h2>
            <div className="mt-4">
              <UpgradePanel />
            </div>
          </motion.section>

          <motion.section
            className="rounded-3xl border border-fuchsia-500/30 bg-fuchsia-500/10 p-5 shadow-2xl shadow-fuchsia-900/20 backdrop-blur card-glow"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
          >
            <h2 className="font-semibold uppercase tracking-wider text-fuchsia-200">Milestones</h2>
            <div className="mt-4">
              <MilestonesPanel />
            </div>
          </motion.section>

          <motion.section
            className="rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-5 shadow-2xl shadow-cyan-900/20 backdrop-blur card-glow"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.12 }}
          >
            <h2 className="font-semibold uppercase tracking-wider text-cyan-200">Automation</h2>
            <div className="mt-4">
              <AutomationPanel />
            </div>
          </motion.section>

          <motion.section
            className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-2xl shadow-amber-900/20 backdrop-blur card-glow"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.14 }}
          >
            <PrestigePanel />
          </motion.section>

          <motion.footer
            className="mt-4 text-center text-xs uppercase tracking-[0.4em] text-slate-300/60"
            initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
          >
            tip: close the tab and come back later—offline progress is saved.
          </motion.footer>
        </div>
      </div>
    </GameProvider>
  );
}