import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Reaction {
  id: string;
  emoji: string;
  x: number;
}

interface ReactionsProps {
  onSendReaction: (emoji: string) => void;
  reactions: Reaction[];
}

const EMOJIS = ["❤️", "😂", "🔥", "😮", "😢", "👏"];

export default function Reactions({ reactions }: { reactions: Reaction[] }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {reactions.map((r) => (
          <motion.div
            key={r.id}
            initial={{ y: "100%", opacity: 0, scale: 0.5, x: `${r.x}%` }}
            animate={{ y: "-20%", opacity: 1, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 4, ease: "linear" }}
            className="absolute bottom-0 text-4xl select-none"
          >
            {r.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
