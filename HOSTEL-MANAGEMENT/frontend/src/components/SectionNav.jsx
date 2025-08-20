import React, { useEffect, useState } from 'react'

export default function SectionNav() {
  const [active, setActive] = useState('top')
  useEffect(() => {
    const ids = ['top','features','rooms']
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 }
    )
    ids.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])
  const items = [
    { id: 'top', label: 'Top' },
    { id: 'features', label: 'Features' },
    { id: 'rooms', label: 'Rooms' },
  ]
  return (
    <div className="fixed right-6 top-1/3 z-40 hidden md:flex flex-col gap-2">
      {items.map(it => (
        <a key={it.id} href={`#${it.id}`}
           className={`w-3 h-3 rounded-full transition-all ${active===it.id? 'bg-emerald-500 scale-125' : 'bg-zinc-400/60 hover:bg-zinc-500'}`}
           title={it.label}
        />
      ))}
    </div>
  )
}
