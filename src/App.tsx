import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { IconType } from "react-icons";
import {
  FiActivity,
  FiAperture,
  FiCpu,
  FiFlag,
  FiGrid,
  FiStar,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";
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

  const hudCards = useMemo(
    () => [
      {
        label: "Current Insight",
        value: format(state.energy),
        hint: "available to allocate",
        accent: "from-cyan-500/50 via-sky-500/40 to-transparent",
        icon: FiZap,
      },
      {
        label: "Total Insight",
        value: format(state.totalEnergy),
        hint: "recorded this cycle",
        accent: "from-indigo-500/50 via-purple-500/40 to-transparent",
        icon: FiActivity,
      },
      {
        label: "Prestige Rank",
        value: state.prestige,
        hint: "ascension echoes",
        accent: "from-amber-500/50 via-pink-500/40 to-transparent",
        icon: FiAperture,
      },
    ],
    [state.energy, state.prestige, state.totalEnergy]
  );

  return (
    <motion.div
      className="grid w-full grid-cols-1 gap-3 text-sm md:grid-cols-3"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {hudCards.map(({ label, value, hint, accent, icon: Icon }) => (
        <motion.article
          key={label}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-4 shadow-lg shadow-sky-900/30 backdrop-blur-lg"
          whileHover={{ y: -4 }}
        >
          <div
            className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent} opacity-70 mix-blend-screen`}
            aria-hidden
          />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-slate-300/70">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.35em] text-slate-400/80">{hint}</p>
            </div>
            <motion.span
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/70 text-xl text-white/80"
              initial={{ rotate: -12, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
            >
              <Icon aria-hidden />
            </motion.span>
          </div>
        </motion.article>
      ))}
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
      <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
        <div className="aurora-backdrop" aria-hidden />
        <div className="starlight-mask" aria-hidden />
        <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 pb-28 pt-10 sm:px-8 lg:flex-row lg:pb-16">
          <motion.aside
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative flex flex-col gap-6 rounded-[2.5rem] border border-white/10 bg-slate-900/70 p-4 shadow-2xl shadow-indigo-900/30 backdrop-blur-xl lg:sticky lg:top-10 lg:h-[calc(100vh-5rem)] lg:w-64"
          >
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-600/20 via-slate-900 to-transparent p-5 text-center">
              <motion.h1
                className="text-3xl font-black uppercase tracking-[0.5em] text-indigo-100"
                initial={{ letterSpacing: "0.25em" }}
                animate={{ letterSpacing: "0.5em" }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{ fontFamily: "Orbitron, sans-serif" }}
              >
                Idle
                <span className="block text-[0.75em] text-white/70">Ring</span>
              </motion.h1>
              <motion.p
                className="mt-4 text-[11px] uppercase tracking-[0.45em] text-slate-300/70"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Architect the loop • Harvest the proof
              </motion.p>
              <OfflineGainToast />
            </div>

            <nav className="hidden flex-1 flex-col gap-2 lg:flex">
              {sectionOrder.map((section) => {
                const Icon = sectionIcons[section.id];
                const isActive = activeSection === section.id;
                return (
                  <motion.button
                    key={section.id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveSection(section.id)}
                    className={`group relative flex items-center gap-3 rounded-3xl border px-4 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
                      isActive
                        ? "border-sky-400/70 bg-sky-500/10 text-white shadow-lg shadow-sky-900/30"
                        : "border-white/5 bg-slate-900/60 text-slate-300/70 hover:border-sky-400/40 hover:text-white"
                    }`}
                    aria-pressed={isActive}
                  >
                    <span className={`flex h-10 w-10 items-center justify-center rounded-2xl text-lg ${isActive ? "bg-sky-500/20 text-sky-100" : "bg-white/5 text-slate-200/80"}`}>
                      <Icon aria-hidden />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-xs font-semibold uppercase tracking-[0.4em]">{section.label}</span>
                      <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400/70">{isActive ? "viewing" : "inspect"}</span>
                    </span>
                    {isActive && (
                      <span className="pointer-events-none absolute inset-0 rounded-3xl border border-sky-400/40" />
                    )}
                  </motion.button>
                );
              })}
            </nav>

            <motion.div
              className="hidden rounded-3xl border border-white/10 bg-slate-900/60 p-4 text-[10px] uppercase tracking-[0.45em] text-slate-300/60 lg:block"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              tip: the cycle continues while you are away – momentum accrues offline.
            </motion.div>
          </motion.aside>

          <div className="flex flex-1 flex-col gap-8">
            <motion.section
              className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-indigo-900/30 backdrop-blur-xl"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/20 via-indigo-500/10 to-transparent" aria-hidden />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start">
                <div className="flex-1 space-y-6">
                  <HUD />
                </div>
                <motion.div
                  className="relative mx-auto flex w-full max-w-sm flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-950/50 p-6 shadow-xl shadow-indigo-900/40"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
                >
                  <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-sky-500/20 via-indigo-500/10 to-transparent" aria-hidden />
                  <motion.h2
                    className="relative text-xs font-semibold uppercase tracking-[0.5em] text-slate-200/80"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    The Prime Loop
                  </motion.h2>
                  <div className="relative mt-4 flex w-full justify-center">
                    <Ring />
                  </div>
                </motion.div>
              </div>
            </motion.section>

            <AnimatePresence mode="wait">
              <motion.section
                key={activeSection}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-cyan-900/20 backdrop-blur-xl"
              >
                <div className="pointer-events-none absolute inset-0 bg-grid-fade" aria-hidden />
                <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.45em] text-slate-400/80">{activeLabel}</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      {activeLabel === "Constructs" ? "Design constructs" : activeLabel === "Upgrades" ? "Tune accelerants" : activeLabel === "Milestones" ? "Chart ascensions" : activeLabel === "Automation" ? "Program rituals" : "Prestige gateway"}
                    </h2>
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.35em] text-slate-400/70">{new Date().toLocaleTimeString()}</div>
                </div>
                <div className="relative mt-6">
                  {renderSectionContent(activeSection)}
                </div>
              </motion.section>
            </AnimatePresence>
          </div>
        </div>

        <nav className="lg:hidden">
          <div className="fixed bottom-5 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-5">
            <div className="relative flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/80 p-2 shadow-2xl shadow-indigo-900/40 backdrop-blur-xl">
              {sectionOrder.map((section) => {
                const Icon = sectionIcons[section.id];
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-3xl px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
                      isActive
                        ? "bg-sky-500/20 text-sky-100 shadow-inner shadow-sky-500/30"
                        : "text-slate-300/70 hover:text-white"
                    }`}
                    aria-pressed={isActive}
                  >
                    <Icon aria-hidden className="text-lg" />
                    <span className="hidden sm:inline">{section.label}</span>
                    <span className="sr-only sm:hidden">{section.label}</span>
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
