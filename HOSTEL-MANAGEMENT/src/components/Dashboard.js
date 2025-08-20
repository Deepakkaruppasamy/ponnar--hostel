import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Total Students', value: 120 },
  { label: 'Available Rooms', value: 15 },
  { label: 'Pending Requests', value: 8 },
];

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: idx * 0.2 }}
        >
          <div className="text-4xl font-bold mb-2 text-indigo-600">{stat.value}</div>
          <div className="text-lg">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
