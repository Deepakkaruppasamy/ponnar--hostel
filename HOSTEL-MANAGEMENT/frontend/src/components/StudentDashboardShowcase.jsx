import React from 'react'
import { motion } from 'framer-motion'

const cards = [
  { title: 'Profile', desc: 'Manage personal details and documents.' },
  { title: 'Fees', desc: 'View dues and payment history.' },
  { title: 'Mess Plan', desc: 'Switch plans and view menus.' },
  { title: 'Notifications', desc: 'Stay updated with hostel alerts.' },
]

export default function StudentDashboardShowcase() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-10">Student Dashboard</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c, i) => (
            <motion.div key={c.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="rounded-2xl p-6 bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-zinc-200/60 dark:border-white/10 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)]"
            >
              <div className="text-xl font-medium">{c.title}</div>
              <div className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm">{c.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
