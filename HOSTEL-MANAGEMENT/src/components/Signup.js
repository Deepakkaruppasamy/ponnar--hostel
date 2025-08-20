import React from 'react';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Signup() {
  return (
    <motion.div
      className="max-w-md mx-auto bg-white/30 backdrop-blur-lg rounded-2xl shadow-xl p-8 mt-12"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-3xl font-bold text-center text-pink-700 mb-6">Sign Up</h2>
      <form className="space-y-6">
        <div className="relative">
          <FaUser className="absolute left-3 top-3 text-pink-400" />
          <input
            type="text"
            placeholder="Username"
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
          />
        </div>
        <div className="relative">
          <FaEnvelope className="absolute left-3 top-3 text-pink-400" />
          <input
            type="email"
            placeholder="Email"
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
          />
        </div>
        <div className="relative">
          <FaLock className="absolute left-3 top-3 text-pink-400" />
          <input
            type="password"
            placeholder="Password"
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-semibold shadow-lg hover:scale-105 transition"
        >
          Create Account
        </button>
      </form>
      <p className="mt-6 text-center text-gray-700">
        Already have an account? <a href="/login" className="text-pink-600 font-bold hover:underline">Login</a>
      </p>
    </motion.div>
  );
}