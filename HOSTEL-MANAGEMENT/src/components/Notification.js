import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Notification({ message, show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-6 right-6 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-50"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.4 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
