import React from 'react'
import { motion } from 'framer-motion'

const steps = [
  { title: 'Select Plan', desc: 'Choose room and mess plan tailored to you.' },
  { title: 'Review', desc: 'Verify details and discounts.' },
  { title: 'Pay Securely', desc: 'Fast, seamless checkout experience.' },
]

export default function PaymentFlow() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight mb-10">Payments</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <motion.div key={s.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="rounded-2xl p-6 bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-zinc-200/60 dark:border-white/10"
            >
              <div className="text-6xl font-semibold text-zinc-300 dark:text-zinc-700">{i + 1}</div>
              <div className="mt-3 text-xl font-medium">{s.title}</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{s.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
