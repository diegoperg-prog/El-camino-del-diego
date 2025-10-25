import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import phrases from "../data/phrases";

export default function LevelUpEffect({ visible }) {
  const [phrase, setPhrase] = useState("");

  useEffect(() => {
    if (visible) {
      setPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
    }
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="levelup-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="levelup-box"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="levelup-title">LEVEL UP!</h1>
            <div className="levelup-phrase">{phrase}</div>

            {/* halo */}
            <motion.div
              className="levelup-halo"
              initial={{ scale: 0.4, opacity: 0.2 }}
              animate={{ scale: 2.2, opacity: 0.6 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 1 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
