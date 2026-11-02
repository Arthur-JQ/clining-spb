import React from 'react'
import { PACKAGES, TIERS, TIER_ROWS } from '../data/mock.js'
import { rub } from '../lib/utils.js'
import { Icon, SectionHead } from './ui.jsx'

const ICONS = { flat: 'home', house: 'house', office: 'office', commercial: 'store' }

export default function Services() {
  return (
    <section id="uslugi" className="bg-mist" aria-labelledby="uslugi-title">
      <div className="wrap py-20">
        <SectionHead id="uslugi-title" eyebrow="Услуги и ориентиры цен" title="Для квартиры, дома, офиса и бизнеса"
          lead="Цены ниже — ориентир, чтобы вы понимали порядок сумм. Точную стоимость оценщик назовёт на месте и зафиксирует в договоре." />

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PACKAGES.map((p) => (
            <li key={p.id} className="card flex flex-col p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700"><Icon name={ICONS[p.id]} size={26} /></span>
              <h3 className="mt-5 text-xl font-semibold">{p.title}</h3>
              <p className="mt-1"><span className="text-ink-mute">от </span><span className="num text-2xl font-semibold">{rub(p.from)}</span></p>
              <p className="num text-sm text-ink-mute">{p.unit}</p>
              <ul className="mt-5 flex flex-col gap-2.5 text-[0.95rem] text-ink-soft">
                {p.items.map((it) => (
                  <li key={it} className="flex gap-2"><Icon name="check" size={18} strokeWidth={2.4} className="mt-0.5 shrink-0 text-leaf-500" />{it}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <h3 className="mt-16 text-2xl font-semibold">Сравните уровни обработки</h3>
        <p className="mt-2 text-ink-soft">Оценщик подскажет, какой уровень нужен именно вам. Часто хватает базового — так и скажем.</p>
        <div className="mt-6 overflow-x-auto rounded-[var(--radius-card)] border border-line bg-white">
          <table className="w-full min-w-[640px] border-collapse text-left text-[0.95rem]">
            <caption className="sr-only">Сравнение пакетов услуг</caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="p-4 font-medium text-ink-mute">Что входит</th>
                {TIERS.map((t) => (
                  <th key={t.id} scope="col" className={`p-4 align-bottom ${t.recommended ? 'bg-brand-50' : ''}`}>
                    {t.recommended && <span className="mb-2 inline-block rounded-full bg-brand-700 px-2.5 py-0.5 text-xs font-semibold text-white">Подходит большинству квартир</span>}
                    <span className="block font-display text-base font-semibold">{t.title}</span>
                    <span className="num block text-sm font-normal text-ink-mute">{t.price}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIER_ROWS.map((r) => (
                <tr key={r.key} className="border-b border-line last:border-0">
                  <th scope="row" className="p-4 font-normal text-ink-soft">{r.label}</th>
                  {TIERS.map((t) => {
                    const v = t.features[r.key]
                    return (
                      <td key={t.id} className={`p-4 ${t.recommended ? 'bg-brand-50' : ''}`}>
                        {typeof v === 'string' ? <span className="num">{v}</span>
                          : v ? <Icon name="check" size={20} strokeWidth={2.6} className="text-leaf-700" title="Входит" />
                            : <span className="text-ink-mute" aria-label="Не входит">—</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
