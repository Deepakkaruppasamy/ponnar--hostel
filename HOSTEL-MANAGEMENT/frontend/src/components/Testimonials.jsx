import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const items = [
  { name: 'Aarav', role: 'Student', quote: 'Payments and mess plans are so smooth now.' },
  { name: 'Priya', role: 'Warden', quote: 'Room allocation is effortless and transparent.' },
  { name: 'Ishan', role: 'Student', quote: 'Feels premium and fast. Love the clean design.' },
]

export default function Testimonials() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), 3200)
    return () => clearInterval(id)
  }, [])
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-10">What People Say</h2>
        <div className="relative overflow-hidden rounded-2xl">
          <div className="flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.blockquote key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl text-center rounded-2xl p-8 bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-zinc-200/60 dark:border-white/10"
              >
                <p className="text-lg md:text-xl text-zinc-700 dark:text-zinc-300">“{items[index].quote}”</p>
                <footer className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">— {items[index].name}, {items[index].role}</footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            {items.map((_, i) => (
              <button key={i} onClick={() => setIndex(i)} className={`w-2.5 h-2.5 rounded-full ${i===index? 'bg-emerald-500' : 'bg-zinc-400/60'}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
