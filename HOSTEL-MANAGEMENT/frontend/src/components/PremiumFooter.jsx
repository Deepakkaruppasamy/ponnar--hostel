import React from 'react'

export default function PremiumFooter() {
  return (
    <footer className="mt-16 bg-white dark:bg-black border-t border-zinc-200/60 dark:border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">© {new Date().getFullYear()} Smart Hostel. All rights reserved.</div>
        <nav className="flex items-center gap-6 text-sm">
          <a className="hover:opacity-70" href="#features">Features</a>
          <a className="hover:opacity-70" href="#rooms">Rooms</a>
          <a className="hover:opacity-70" href="#">Privacy</a>
          <a className="hover:opacity-70" href="#">Terms</a>
        </nav>
      </div>
    </footer>
  )
}
