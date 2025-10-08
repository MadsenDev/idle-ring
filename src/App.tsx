import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { IconType } from "react-icons";
import { FiCpu, FiFlag, FiGrid, FiStar, FiTrendingUp } from "react-icons/fi";
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

const sectionOrder = [
  { id: "constructs", label: "Constructs" },
  { id: "upgrades", label: "Upgrades" },
  { id: "milestones", label: "Milestones" },
  { id: "automation", label: "Automation" },
  { id: "prestige", label: "Prestige" },
] as const;

type SectionId = (typeof sectionOrder)[number]["id"];

const sectionIcons: Record<SectionId, IconType> = {
  constructs: FiGrid,
  upgrades: FiTrendingUp,
  milestones: FiFlag,
  automation: FiCpu,
  prestige: FiStar,
};

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>("constructs");

  const renderSectionContent = (sectionId: SectionId) => {
    switch (sectionId) {
      case "constructs":
        return <GeneratorList />;
      case "upgrades":
        return <UpgradePanel />;
      case "milestones":
        return <MilestonesPanel />;
      case "automation":
        return <AutomationPanel />;
      case "prestige":
        return <PrestigePanel />;
      default:
        return null;
    }
  };

  const activeLabel = sectionOrder.find((section) => section.id === activeSection)?.label ?? "";

  return (
    <GameProvider>
      <div className="relative min-h-screen overflow-hidden text-slate-100">
        <div className="cosmic-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative mx-auto flex min-h-screen max-w-screen-md flex-col gap-6 px-4 pb-28 pt-8 sm:px-6 sm:pb-12">
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

          <div className="relative">
            <nav className="hidden items-center justify-center gap-2 rounded-full border border-indigo-500/30 bg-slate-900/70 p-1 shadow-lg shadow-indigo-900/25 backdrop-blur sm:flex">
              {sectionOrder.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`relative rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 ${
                    activeSection === section.id
                      ? "bg-indigo-500/30 text-indigo-100 shadow-inner shadow-indigo-500/20"
                      : "text-slate-300/70 hover:text-slate-100"
                  }`}
                  aria-pressed={activeSection === section.id}
                >
                  {section.label}
                  {activeSection === section.id && (
                    <span className="pointer-events-none absolute inset-x-2 -bottom-1 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent" />
                  )}
                </button>
              ))}
            </nav>

            <AnimatePresence mode="wait">
              {activeSection === "prestige" ? (
                <motion.div
                  key="prestige"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="mt-6"
                >
                  {renderSectionContent(activeSection)}
                </motion.div>
              ) : (
                <motion.section
                  key={activeSection}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className={`mt-6 rounded-3xl border p-5 shadow-2xl backdrop-blur card-glow ${
                    activeSection === "constructs"
                      ? "border-sky-500/30 bg-slate-900/55 shadow-sky-900/25"
                      : activeSection === "upgrades"
                      ? "border-emerald-500/30 bg-emerald-500/10 shadow-emerald-900/20"
                      : activeSection === "milestones"
                      ? "border-fuchsia-500/30 bg-fuchsia-500/10 shadow-fuchsia-900/20"
                      : "border-cyan-500/30 bg-cyan-500/10 shadow-cyan-900/20"
                  }`}
                >
                  <h2
                    className={`font-semibold uppercase tracking-wider ${
                      activeSection === "constructs"
                        ? "text-sky-200"
                        : activeSection === "upgrades"
                        ? "text-emerald-200"
                        : activeSection === "milestones"
                        ? "text-fuchsia-200"
                        : "text-cyan-200"
                    }`}
                  >
                    {activeLabel}
                  </h2>
                  <div className="mt-4">{renderSectionContent(activeSection)}</div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>

          <motion.footer
            className="mt-4 text-center text-xs uppercase tracking-[0.4em] text-slate-300/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            tip: close the tab and come back later—offline progress is saved.
          </motion.footer>
        </div>

        <nav className="sm:hidden">
          <div className="fixed bottom-4 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 px-4">
            <div className="flex items-stretch justify-between gap-1 rounded-3xl border border-indigo-500/40 bg-slate-950/80 px-2 py-2 shadow-2xl shadow-indigo-900/40 backdrop-blur-xl">
              {sectionOrder.map((section) => {
                const Icon = sectionIcons[section.id];
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`flex flex-1 flex-col items-center justify-center rounded-2xl px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 ${
                      activeSection === section.id
                        ? "bg-indigo-500/25 text-indigo-100 shadow-inner shadow-indigo-500/20"
                        : "text-slate-300/70 hover:text-slate-100"
                    }`}
                    aria-pressed={activeSection === section.id}
                  >
                    <Icon
                      aria-hidden
                      className={`text-lg ${
                        activeSection === section.id ? "text-indigo-100" : "text-slate-300/80"
                      }`}
                    />
                    <span className="sr-only">{section.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </GameProvider>
  );
}
