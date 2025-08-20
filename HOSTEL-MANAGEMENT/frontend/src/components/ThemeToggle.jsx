import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)

  // Initialize from saved preference or system setting
  useEffect(() => {
    const saved = localStorage.getItem('theme-dark')
    const preferDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = saved === null ? preferDark : saved === '1'
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme-dark', next ? '1' : '0')
  }

  return (
    <button
      onClick={toggle}
      className="rounded-full px-3 py-1 glass text-sm hover:opacity-90 transition"
      aria-label="Toggle color theme"
      aria-pressed={dark}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? 'Light' : 'Dark'}
    </button>
  )
}


