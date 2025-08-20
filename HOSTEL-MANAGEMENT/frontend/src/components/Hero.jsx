import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function Hero() {
  const ref = useRef(null)
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 400], [0, 60])
  const scale = useTransform(scrollY, [0, 400], [1, 1.08])
  const progress = useTransform(scrollY, [0, 600], [0, 1])
  const progressWidth = useTransform(progress, (v) => `${v * 100}%`)
  return (
    <section ref={ref} className="relative min-h-[80vh] md:min-h-[92vh] flex items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-black">
      {/* Scroll progress bar */}
      <motion.div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-teal-400"
        style={{ width: progressWidth }} />

      <motion.div style={{ y: y1, scale }}
        className="absolute inset-0 opacity-40 pointer-events-none"
      >
        <div className="absolute -top-20 -left-24 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.18),transparent_60%)] blur-3xl"/>
        <div className="absolute -bottom-28 -right-24 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18),transparent_60%)] blur-3xl"/>
        {/* Parallax floating shapes */}
        <motion.div aria-hidden className="absolute left-10 top-16 w-24 h-24 rounded-2xl bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/30 shadow"
          animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div aria-hidden className="absolute right-12 bottom-20 w-16 h-16 rounded-full bg-white/30 dark:bg-white/5 backdrop-blur-md border border-white/30 shadow"
          animate={{ y: [0, 12, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }} />
      </motion.div>

      <div className="relative z-10 text-center px-6 max-w-5xl">
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight">
          Smart Hostel Management
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-4 md:mt-6 text-lg md:text-xl text-zinc-600 dark:text-zinc-300">
          Minimal. Powerful. Effortless control over rooms, mess, payments and more.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.8 }}
          className="mt-8 flex items-center justify-center gap-3">
          <a href="#rooms" className="btn group relative overflow-hidden">
            <span className="relative z-10">Explore Rooms</span>
            <span className="absolute inset-0 -z-0 bg-gradient-to-r from-indigo-500/0 via-emerald-400/20 to-transparent translate-x-[-120%] group-hover:translate-x-[120%] transition-all duration-700" />
          </a>
          <a href="#features" className="btn btn-ghost">Learn More</a>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1 }}
          className="mt-12 md:mt-16 rounded-2xl shadow-2xl/20 shadow-[0_30px_120px_-30px_rgba(0,0,0,0.25)] ring-1 ring-zinc-200/60 dark:ring-white/10 overflow-hidden">
          <img src="/hero-hostel.jpg" alt="Hostel" className="w-full h-[320px] md:h-[420px] object-cover" />
        </motion.div>
      </div>
    </section>
  )
}
