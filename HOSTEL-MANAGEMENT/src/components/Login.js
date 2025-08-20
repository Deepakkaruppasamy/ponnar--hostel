import React from 'react';
import { FaUser, FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Login() {
  return (
    <motion.div
      className="max-w-md mx-auto bg-white/30 backdrop-blur-lg rounded-2xl shadow-xl p-8 mt-12"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">Login</h2>
      <form className="space-y-6">
        <div className="relative">
          <FaUser className="absolute left-3 top-3 text-indigo-400" />
          <input
            type="text"
            placeholder="Username"
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />
        </div>
        <div className="relative">
          <FaLock className="absolute left-3 top-3 text-indigo-400" />
          <input
            type="password"
            placeholder="Password"
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold shadow-lg hover:scale-105 transition"
        >
          Sign In
        </button>
      </form>
      <p className="mt-6 text-center text-gray-700">
        Don't have an account? <a href="/signup" className="text-indigo-600 font-bold hover:underline">Sign Up</a>
      </p>
    </motion.div>
  );
}