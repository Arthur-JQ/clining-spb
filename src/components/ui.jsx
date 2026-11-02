import React from 'react'

const PATHS = {
  shield: 'M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z M9 12l2 2 4-4',
  leaf: 'M5 19c0-8 5-13 14-14 0 9-5 14-13 14 M5 19l6-6',
  cert: 'M7 3h10v12H7z M9 7h6 M9 10h6 M10 15l-1.5 6L12 19l3.5 2L14 15',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2',
  check: 'M5 12.5l4.5 4.5L19 7',
  clock: 'M12 21a9 9 0 100-18 9 9 0 000 18z M12 7v5l3 2',
  pin: 'M12 21s-7-6.2-7-11.5A7 7 0 0119 9.5C19 14.8 12 21 12 21z M12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  arrow: 'M5 12h14 M13 6l6 6-6 6',
  menu: 'M4 7h16 M4 12h16 M4 17h16',
  x: 'M6 6l12 12 M18 6L6 18',
  home: 'M4 11l8-7 8 7 M6 9.5V20h12V9.5 M10 20v-5h4v5',
  house: 'M3 12l9-8 9 8 M5 10.5V20h14v-9.5 M9 20v-6h6v6 M16 6V3h2v4.5',
  office: 'M5 21V5a1 1 0 011-1h8a1 1 0 011 1v16 M15 9h3a1 1 0 011 1v11 M8 8h3 M8 12h3 M8 16h3 M3 21h18',
  store: 'M4 9l1.5-5h13L20 9 M4 9h16v2a2.7 2.7 0 01-5.3 0 2.7 2.7 0 01-5.4 0A2.7 2.7 0 014 11z M5 13v8h14v-8 M10 21v-5h4v5',
  drop: 'M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z M19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8z',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8z M4 21a8 8 0 0116 0',
  chevron: 'M6 9l6 6 6-6',
  camera: 'M4 8h3l2-3h6l2 3h3v11H4z M12 17a3.5 3.5 0 100-7 3.5 3.5 0 000 7z',
  doc: 'M6 3h9l4 4v14H6z M14 3v5h5 M9 13h7 M9 17h5',
  wallet: 'M4 7h15a1 1 0 011 1v11H5a1 1 0 01-1-1z M4 7l11-3v3 M16 13h2',
  info: 'M12 21a9 9 0 100-18 9 9 0 000 18z M12 11v6 M12 7.5v.5',
  alert: 'M12 4l9 16H3z M12 10v4 M12 17v.5',
  calendar: 'M4 6h16v15H4z M4 10h16 M8 3v5 M16 3v5',
  search: 'M11 18a7 7 0 100-14 7 7 0 000 14z M20 20l-4-4',
  thumb: 'M7 11v9H4v-9z M7 11l4-7a2 2 0 012 2v4h5.5a2 2 0 012 2.3l-1.2 6A2 2 0 0117.3 20H7',
}

export function Icon({ name, size = 22, className = '', strokeWidth = 1.8, title }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden={title ? undefined : true} role={title ? 'img' : undefined}>
      {title && <title>{title}</title>}
      <path d={PATHS[name]} />
    </svg>
  )
}

export function Stars({ value, size = 16, label = true }) {
  const full = Math.round(value * 2) / 2
  return (
    <span className="inline-flex items-center gap-0.5" role={label ? 'img' : undefined} aria-label={label ? `Оценка ${String(value).replace('.', ',')} из 5` : undefined}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = full >= i ? 1 : full >= i - 0.5 ? 0.5 : 0
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
            <defs>
              <linearGradient id={`sg-${i}-${fill}`}>
                <stop offset={`${fill * 100}%`} stopColor="#F4A12A" />
                <stop offset={`${fill * 100}%`} stopColor="#DCE7EA" />
              </linearGradient>
            </defs>
            <path fill={`url(#sg-${i}-${fill})`} d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z" />
          </svg>
        )
      })}
    </span>
  )
}

export function SectionHead({ eyebrow, title, lead, id, align = 'left', aside }) {
  return (
    <div className={`mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between ${align === 'center' ? 'text-center md:flex-col md:items-center' : ''}`}>
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 id={id} className="text-[1.75rem] leading-tight font-semibold md:text-[2.375rem]">{title}</h2>
        {lead && <p className="mt-4 text-ink-soft text-lg">{lead}</p>}
      </div>
      {aside}
    </div>
  )
}

export function Demo({ children = 'демо-данные' }) {
  return <span className="demo-tag" title="Демонстрационные данные прототипа — замените на реальные">{children}</span>
}

export function Spinner({ className = '' }) {
  return (
    <svg className={`animate-spin ${className}`} width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" fill="none" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export function Avatar({ name, tone = 'brand', size = 56 }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('')
  const bg = tone === 'leaf' ? 'bg-leaf-100 text-leaf-700' : 'bg-brand-100 text-brand-700'
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full font-display font-semibold ${bg}`}
      style={{ width: size, height: size, fontSize: size * 0.34 }} aria-hidden="true">
      {initials}
    </span>
  )
}

// Иллюстрация-заглушка вместо фото «до/после» (заменить на реальные фото клиентов с их согласия)
export function BeforeAfterThumb({ kind, seed = 1 }) {
  const before = kind === 'before'
  const spots = [[18, 22, 7], [44, 40, 9], [62, 18, 5], [30, 52, 6], [70, 50, 8]]
  return (
    <svg viewBox="0 0 90 68" className="h-full w-full" role="img" aria-label={before ? 'Фото до работ (заглушка)' : 'Фото после работ (заглушка)'}>
      <rect width="90" height="68" fill={before ? '#D9D2C3' : '#EAF3F8'} />
      <rect x="0" y="44" width="90" height="24" fill={before ? '#BDB29C' : '#CFE3EE'} />
      <rect x="10" y="14" width="26" height="30" rx="2" fill={before ? '#C8BDA6' : '#FFFFFF'} />
      <rect x="52" y="22" width="28" height="22" rx="2" fill={before ? '#C2B7A0' : '#FFFFFF'} />
      {before && spots.map(([x, y, r], i) => <ellipse key={i} cx={(x + seed * 7) % 86} cy={y} rx={r} ry={r * 0.7} fill="#8F8169" opacity=".45" />)}
      {!before && <path d="M64 10l1.5 4 4 1.5-4 1.5L64 21l-1.5-4-4-1.5 4-1.5z" fill="#12A37A" />}
      <text x="6" y="62" fontSize="8" fontFamily="JetBrains Mono, monospace" fill={before ? '#5E5241' : '#0B4A6F'}>{before ? 'ДО' : 'ПОСЛЕ'}</text>
    </svg>
  )
}
