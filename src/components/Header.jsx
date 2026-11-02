import React, { useEffect, useState } from 'react'
import { COMPANY } from '../data/mock.js'
import { Icon } from './ui.jsx'

const NAV = [
  ['#kak', 'Как работаем'],
  ['#uslugi', 'Услуги и цены'],
  ['#kalkulyator', 'Калькулятор'],
  ['#karta', 'Зоны выезда'],
  ['#otzyvy', 'Отзывы'],
  ['#faq', 'Вопросы'],
]

export function Logo({ light = false }) {
  return (
    <a href="#top" className="flex items-center gap-2.5 no-underline" aria-label={`${COMPANY.name} — на главную`}>
      <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill={light ? '#FFFFFF' : '#0B4A6F'} />
        <rect x="8" y="8" width="16" height="16" rx="2" fill="none" stroke="#FFB547" strokeWidth="3" />
        <path d="M12 16.5l3 3 5.5-6.5" fill="none" stroke={light ? '#0B4A6F' : '#fff'} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className={`whitespace-nowrap font-display text-[1.05rem] font-semibold leading-none ${light ? 'text-white' : 'text-ink'}`}>
        Чистый метр
        <span className={`mt-1 block font-sans text-[0.72rem] font-medium ${light ? 'text-brand-100' : 'text-ink-mute'}`}>дезинфекция и клининг</span>
      </span>
    </a>
  )
}

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className={`sticky z-[1000] border-b bg-white/95 backdrop-blur transition-shadow ${scrolled ? 'border-line shadow-[0_6px_20px_-16px_rgba(14,39,48,.5)]' : 'border-transparent'}`}
      style={{ top: 'env(safe-area-inset-top, 0px)' }}>
      <div className="wrap flex h-[72px] items-center justify-between gap-4">
        <Logo />
        <p className="hidden text-sm text-ink-soft 2xl:block">Цена — после оценки на месте. Без скрытых доплат.</p>
        <nav aria-label="Основная навигация" className="hidden xl:block">
          <ul className="flex items-center gap-5 whitespace-nowrap text-[0.95rem] font-medium text-ink-soft">
            {NAV.slice(0, 5).map(([href, label]) => (
              <li key={href}><a className="hover:text-brand-700" href={href}>{label}</a></li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3">
          <a href={COMPANY.phoneHref} className="num hidden items-center gap-2 whitespace-nowrap text-[0.95rem] font-semibold text-ink no-underline md:flex">
            <Icon name="phone" size={18} className="text-leaf-700" />{COMPANY.phone}
          </a>
          <a href="#zayavka" className="btn btn-cta hidden sm:inline-flex">Вызвать оценщика</a>
          <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line xl:hidden"
            aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? 'Закрыть меню' : 'Открыть меню'} onClick={() => setOpen(!open)}>
            <Icon name={open ? 'x' : 'menu'} />
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Мобильная навигация" className="border-t border-line bg-white xl:hidden">
          <ul className="wrap flex flex-col py-3">
            {NAV.map(([href, label]) => (
              <li key={href}><a onClick={() => setOpen(false)} className="block py-3 text-lg font-medium text-ink" href={href}>{label}</a></li>
            ))}
            <li className="py-3"><a href={COMPANY.phoneHref} className="num font-semibold text-brand-700">{COMPANY.phone}</a></li>
          </ul>
        </nav>
      )}
    </header>
  )
}
