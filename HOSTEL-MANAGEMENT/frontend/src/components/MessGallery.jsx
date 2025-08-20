import React, { useRef } from 'react'
import { motion } from 'framer-motion'

const items = [
  { title: 'Breakfast', img: '/mess-breakfast.jpg' },
  { title: 'Lunch', img: '/mess-lunch.jpg' },
  { title: 'Dinner', img: '/mess-dinner.jpg' },
]

export default function MessGallery() {
  const trackRef = useRef(null)
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-8">Mess Management</h2>
        <motion.div className="overflow-hidden rounded-2xl border border-zinc-200/60 dark:border-white/10 bg-white/40 dark:bg-zinc-900/40 backdrop-blur"
          whileTap={{ cursor: 'grabbing' }}
        >
          <motion.div ref={trackRef} className="flex gap-6 p-6" drag="x" dragConstraints={{ left: -480, right: 0 }}
            dragTransition={{ bounceStiffness: 200, bounceDamping: 20 }}
          >
            {items.concat(items).map((it, i) => (
              <motion.div key={`${it.title}-${i}`} className="min-w-[280px] md:min-w-[360px] rounded-2xl overflow-hidden border border-zinc-200/60 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 backdrop-blur"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i%3) * 0.06 }}
                whileHover={{ y: -6 }}
              >
                <div className="overflow-hidden">
                  <motion.img src={it.img} alt={it.title} className="w-full h-56 object-cover"
                    whileHover={{ scale: 1.06 }} transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }} />
                </div>
                <div className="p-5">
                  <div className="text-lg font-medium">{it.title}</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Curated menus with seasonal freshness.</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
