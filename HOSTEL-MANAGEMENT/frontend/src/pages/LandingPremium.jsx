import React from 'react'
import Hero from '../components/Hero.jsx'
import RoomsGrid from '../components/RoomsGrid.jsx'
import StudentDashboardShowcase from '../components/StudentDashboardShowcase.jsx'
import MessGallery from '../components/MessGallery.jsx'
import PaymentFlow from '../components/PaymentFlow.jsx'
import Testimonials from '../components/Testimonials.jsx'
import PremiumFooter from '../components/PremiumFooter.jsx'
import SectionNav from '../components/SectionNav.jsx'

export default function LandingPremium() {
  return (
    <div className="space-y-6 md:space-y-10">
      <SectionNav />
      <div id="top"><Hero /></div>
      <section id="features" className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-6">
          {[{
            t: 'Attendance', d: 'Track presence with a tap.'
          }, {
            t: 'Gate Pass', d: 'Request, approve, and verify seamlessly.'
          }, {
            t: 'Health & Safety', d: 'Sick leaves and emergencies with care.'
          }].map((f) => (
            <div key={f.t} className="rounded-2xl p-6 bg-white/70 dark:bg-zinc-900/60 backdrop-blur border border-zinc-200/60 dark:border-white/10">
              <div className="text-lg font-medium">{f.t}</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{f.d}</div>
            </div>
          ))}
        </div>
      </section>
      <RoomsGrid />
      <StudentDashboardShowcase />
      <MessGallery />
      <PaymentFlow />
      <Testimonials />
      <PremiumFooter />
    </div>
  )
}
