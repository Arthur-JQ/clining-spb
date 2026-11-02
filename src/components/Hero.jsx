import React from 'react'
import { COMPANY, RATING_COUNTS, SEASON_OFFER } from '../data/mock.js'
import { fmtNum, offerState, plural, freeTodayTotal } from '../lib/utils.js'
import { Icon, Stars, Demo } from './ui.jsx'

export function ratingSummary() {
  const total = Object.values(RATING_COUNTS).reduce((a, b) => a + b, 0)
  const sum = Object.entries(RATING_COUNTS).reduce((a, [k, v]) => a + Number(k) * v, 0)
  return { total, avg: sum / total }
}

export function OfferStrip() {
  const s = offerState()
  if (!s.active) return null
  return (
    <div className="bg-brand-900 text-white">
      <div className="wrap flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2 text-center text-sm">
        <span className="font-semibold">{SEASON_OFFER.title}</span>
        <span className="text-brand-100">на дезинфекцию до 30 ноября — осталось {s.daysLeft} {plural(s.daysLeft, 'день', 'дня', 'дней')}</span>
        <a href="#kalkulyator" className="font-semibold text-amber-cta underline-offset-4 hover:underline">Посчитать со скидкой</a>
      </div>
    </div>
  )
}

function EstimateSheet() {
  return (
    <div className="relative mx-auto w-full max-w-[440px]">
      <div className="absolute -right-3 -top-3 hidden h-full w-full rounded-[1.5rem] bg-leaf-50 sm:block" aria-hidden="true" />
      <figure className="card relative overflow-hidden p-0 shadow-[var(--shadow-soft)]" aria-label="Пример сметы оценщика">
        <div className="flex items-center justify-between border-b border-line bg-mist px-5 py-3">
          <span className="eyebrow !text-ink-mute">Смета № 2611-048</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf-50 px-2.5 py-1 text-xs font-semibold text-leaf-700">
            <Icon name="check" size={14} strokeWidth={2.4} />цена зафиксирована
          </span>
        </div>
        <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2.5 px-5 py-4 text-[0.95rem]">
          <dt className="text-ink-mute">Объект</dt><dd className="text-right font-medium">Квартира, 64 м²</dd>
          <dt className="text-ink-mute">Загрязнение</dt><dd className="text-right font-medium">Среднее</dd>
          <dt className="text-ink-mute">Работы</dt><dd className="text-right font-medium">Уборка + дезинфекция</dd>
          <dt className="text-ink-mute">Мастера</dt><dd className="text-right font-medium">2 человека, ~5 ч</dd>
          <dt className="text-ink-mute">Проветривание</dt><dd className="text-right font-medium">3 часа</dd>
        </dl>
        <div className="mx-5 rounded-xl bg-brand-50 px-4 py-3">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-brand-700">АТФ-замер столешницы</span>
            <span className="num text-sm text-brand-900">1 450 → <b className="text-leaf-700">95</b> RLU</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white" aria-hidden="true">
            <div className="h-full w-[7%] rounded-full bg-leaf-500" />
          </div>
        </div>
        <div className="flex items-end justify-between px-5 pb-5 pt-4">
          <div>
            <p className="text-sm text-ink-mute">Итого по договору</p>
            <p className="num text-[1.75rem] font-semibold leading-none">17 300 ₽</p>
          </div>
          <p className="max-w-[9rem] text-right text-xs leading-snug text-ink-mute">Доплаты — только с вашего письменного согласия</p>
        </div>
      </figure>
    </div>
  )
}

export default function Hero() {
  const { total, avg } = ratingSummary()
  const freeToday = freeTodayTotal()
  return (
    <section id="top" className="relative overflow-hidden bg-gradient-to-b from-mist to-white" aria-labelledby="hero-title">
      <div className="wrap grid items-center gap-12 pb-16 pt-10 md:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:pb-24">
        <div>
          <p className="eyebrow mb-5">Клининговая компания · Санкт-Петербург</p>
          <h1 id="hero-title" className="text-[2.1rem] font-semibold leading-[1.12] md:text-[3.1rem]">
            Клининг и дезинфекция в Петербурге <span className="text-brand-700">с ценой, которую вы знаете до начала работ</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink-soft md:text-xl">
            Оценщик бесплатно приедет, посмотрит помещение и зафиксирует стоимость в договоре. Мастера с сертификатами сделают работу в удобное вам время.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#zayavka" className="btn btn-cta text-lg">Вызвать оценщика бесплатно<Icon name="arrow" size={20} /></a>
            <a href="#kalkulyator" className="btn btn-ghost text-lg">Рассчитать стоимость</a>
          </div>
          <p className="mt-4 flex items-start gap-2 text-sm text-ink-mute">
            <Icon name="info" size={18} className="mt-0.5 shrink-0" />
            Выезд в пределах КАД — 0 ₽. Если цена не подошла, вы ничего не платите.
          </p>

          <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4" aria-label="Коротко о нас">
            <li>
              <div className="flex items-center gap-2"><span className="num text-2xl font-semibold">{fmtNum(avg, 1)}</span><Stars value={avg} size={14} /></div>
              <p className="text-sm text-ink-mute">{fmtNum(total)} оценок</p>
            </li>
            <li><p className="num text-2xl font-semibold">{fmtNum(COMPANY.objectsDone)}</p><p className="text-sm text-ink-mute">объектов</p></li>
            <li><p className="num text-2xl font-semibold">с {COMPANY.since}</p><p className="text-sm text-ink-mute">работаем</p></li>
            <li>
              {freeToday > 0 ? <>
                <p className="num text-2xl font-semibold text-leaf-700">{freeToday}</p>
                <p className="text-sm text-ink-mute">{plural(freeToday, 'окно оценщика', 'окна оценщика', 'окон оценщика')} сегодня</p>
              </> : <>
                <p className="text-2xl font-semibold text-leaf-700">завтра</p>
                <p className="text-sm text-ink-mute">ближайшие окна оценщика</p>
              </>}
            </li>
          </ul>
          <p className="mt-3"><Demo>цифры демонстрационные</Demo></p>
        </div>
        <EstimateSheet />
      </div>
    </section>
  )
}
