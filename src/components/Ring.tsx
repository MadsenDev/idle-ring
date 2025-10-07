import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "../game/GameProvider";
import { format } from "../utils/format";

type Burst = { id: number; x: number; y: number; value: number };

export default function Ring() {
  const { state, dispatch, rate } = useGame();
  const controls = useAnimationControls();
  const [bursts, setBursts] = useState<Burst[]>([]);
  const idRef = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const pulse = useCallback(() => {
    controls.start({
      scale: [1, 0.94, 1],
      transition: { duration: 0.35, ease: "anticipate", times: [0, 0.45, 1] },
    }).catch(() => {});
  }, [controls]);

  const spawnBurst = () => {
    const angle = Math.random() * Math.PI * 2;
    const radius = 36 + Math.random() * 20;
    const id = idRef.current++;
    const value = Number.isFinite(rate) && rate > 0 ? rate : 1;
    const burst: Burst = {
      id,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      value,
    };
    setBursts(prev => [...prev, burst]);
    const timeout = window.setTimeout(() => {
      setBursts(prev => prev.filter(b => b.id !== id));
      timers.current = timers.current.filter(t => t !== timeout);
    }, 800);
    timers.current.push(timeout);
  };

  const handleClick = () => {
    pulse();
    spawnBurst();
    dispatch({ type: "CLICK" });
  };

  const formattedRate = useMemo(() => format(rate), [rate]);

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.button
        onClick={handleClick}
        animate={controls}
        whileTap={{ scale: 0.9 }}
        className="relative h-44 w-44 rounded-full border-4 border-indigo-500/70 flex items-center justify-center shadow-inner focus:outline-none"
      >
        <div className="text-center">
          <div className="text-3xl font-bold text-indigo-100 drop-shadow-lg">{format(state.energy)}</div>
          <div className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">Energy</div>
        </div>
        <motion.div
          className="absolute -inset-2 rounded-full ring-2 ring-indigo-400/40"
          animate={{ opacity: [0.2, 0.55, 0.2], scale: [1, 1.05, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <AnimatePresence>
          {bursts.map(burst => (
            <motion.span
              key={burst.id}
              initial={{ opacity: 0, scale: 0.6, x: 0, y: 0 }}
              animate={{ opacity: 1, scale: 1, x: burst.x, y: burst.y }}
              exit={{ opacity: 0, scale: 0.4, y: burst.y - 12 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="pointer-events-none absolute select-none rounded-full bg-indigo-500/80 px-2 py-1 text-[10px] font-semibold tracking-wide text-white shadow-lg shadow-indigo-500/50"
            >
              +{format(burst.value)}
            </motion.span>
          ))}
        </AnimatePresence>
      </motion.button>
      <motion.div
        className="mt-3 text-xs uppercase tracking-[0.3em] text-indigo-200/80"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        +{formattedRate}/s • Tap for +1 (× prestige)
      </motion.div>
    </div>
  );
}