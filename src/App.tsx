import { motion } from "framer-motion";
import GeneratorList from "./components/GeneratorList";
import OfflineGainToast from "./components/OfflineGainToast";
import PrestigePanel from "./components/PrestigePanel";
import Ring from "./components/Ring";
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
        <div className="text-[11px] uppercase tracking-[0.3em] text-indigo-200/70">Energy</div>
        <div className="text-lg text-indigo-200">{format(state.energy)}</div>
      </div>
      <div className="rounded-xl bg-slate-900/60 px-4 py-3 font-semibold shadow-lg shadow-indigo-500/20">
        <div className="text-[11px] uppercase tracking-[0.3em] text-sky-200/70">Total</div>
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
              Harness the loop • Ascend the ring
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
            <h2 className="font-semibold uppercase tracking-wider text-sky-200">Generators</h2>
            <div className="mt-4">
              <GeneratorList />
            </div>
          </motion.section>

          <motion.section
            className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-2xl shadow-amber-900/20 backdrop-blur card-glow"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
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