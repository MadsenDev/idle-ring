import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useGame } from "../game/GameProvider";
import { format } from "../utils/format";

export default function OfflineGainModal() {
  const { offlineGain, ackOfflineGain } = useGame();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (offlineGain > 0) {
      setOpen(true);
    }
  }, [offlineGain]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        ackOfflineGain();
      }
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true } as EventListenerOptions);
  }, [open, ackOfflineGain]);

  if (!open || offlineGain <= 0) return null;

  const close = () => {
    setOpen(false);
    ackOfflineGain();
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl dark:bg-slate-900"
          >
            <h2 className="text-xl font-semibold text-indigo-600 dark:text-indigo-300">Welcome back!</h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              While you were away your constructs produced <b>{format(offlineGain)}</b> insight.
            </p>
            <motion.button
              onClick={close}
              whileTap={{ scale: 0.94 }}
              className="mt-6 inline-flex justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-600/40 transition hover:bg-indigo-500 focus:outline-none focus-visible:ring focus-visible:ring-indigo-400"
            >
              Nice!
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

