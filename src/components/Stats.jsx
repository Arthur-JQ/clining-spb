import React, { useState } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Legend,
  ComposedChart, Line, Cell,
} from 'recharts'
import { ATP_DATA, ATP_THRESHOLD, MONTHLY, RATING_COUNTS } from '../data/mock.js'
import { fmtNum } from '../lib/utils.js'
import { useLead } from '../lib/store.js'
import { SectionHead, Demo, Icon } from './ui.jsx'

const AXIS = { fill: '#5E7780', fontSize: 12 }

function Tip({ active, payload, label, unit = '', names = {} }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 text-sm shadow-[var(--shadow-soft)]">
      <p className="mb-1 font-semibold">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
          {names[p.dataKey] || p.name}: <b className="num">{fmtNum(p.value, p.dataKey === 'rating' ? 2 : 0)}{p.dataKey === 'repeat' ? '%' : unit}</b>
        </p>
      ))}
    </div>
  )
}

function AtpChart() {
  const [obj, setObj] = useState('flat')
  const tabs = [['flat', 'Квартиры'], ['office', 'Офисы'], ['commercial', 'Кафе и детские центры']]
  const data = ATP_DATA[obj]
  const avgDrop = Math.round(data.reduce((a, d) => a + (1 - d.after / d.before), 0) / data.length * 100)
  return (
    <figure className="card flex flex-col p-5 md:p-6 lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-sans text-lg font-semibold">Контроль качества: АТФ-замеры до и после</h3>
          <p className="mt-1 max-w-xl text-sm text-ink-mute">Люминометр показывает остаточное органическое загрязнение поверхности в RLU. Чем ниже — тем чище. Пунктир — ориентир «чисто» ({ATP_THRESHOLD} RLU).</p>
        </div>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Тип объекта">
          {tabs.map(([id, l]) => <button key={id} type="button" role="radio" aria-checked={obj === id} className="chip !min-h-[36px] !text-sm" onClick={() => setObj(id)}>{l}</button>)}
        </div>
      </div>
      <div className="mt-4 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }} barGap={4}>
            <CartesianGrid stroke="#DCE7EA" strokeDasharray="3 4" vertical={false} />
            <XAxis dataKey="surface" tick={AXIS} tickLine={false} axisLine={{ stroke: '#DCE7EA' }} interval={0} />
            <YAxis tick={AXIS} tickLine={false} axisLine={false} width={48} />
            <Tooltip content={<Tip unit=" RLU" names={{ before: 'До', after: 'После' }} />} cursor={{ fill: '#F2F7F8' }} />
            <Legend formatter={(v) => (v === 'before' ? 'До обработки' : 'После обработки')} iconType="circle" wrapperStyle={{ fontSize: 13 }} />
            <ReferenceLine y={ATP_THRESHOLD} stroke="#0B7457" strokeDasharray="5 4" />
            <Bar dataKey="before" fill="#B9C9CF" radius={[6, 6, 0, 0]} maxBarSize={44} />
            <Bar dataKey="after" fill="#12A37A" radius={[6, 6, 0, 0]} maxBarSize={44} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="mt-3 flex flex-wrap items-center gap-3 text-sm text-ink-soft">
        <span>В среднем загрязнение снижается на <b className="num">{avgDrop}%</b>.</span>
        <span className="text-ink-mute">Это показатель чистоты поверхности, а не медицинская гарантия.</span>
      </figcaption>
    </figure>
  )
}

function TrendChart() {
  const [period, setPeriod] = useState(6)
  const data = MONTHLY.slice(-period)
  return (
    <figure className="card flex flex-col p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-sans text-lg font-semibold">Рейтинг и повторные заказы</h3>
          <p className="mt-1 text-sm text-ink-mute">Средняя оценка за месяц и доля клиентов, вернувшихся снова.</p>
        </div>
        <div className="flex gap-2" role="radiogroup" aria-label="Период">
          {[6, 11].map((p) => <button key={p} type="button" role="radio" aria-checked={period === p} className="chip !min-h-[36px] !text-sm" onClick={() => setPeriod(p)}>{p === 6 ? '6 мес' : 'Год'}</button>)}
        </div>
      </div>
      <div className="mt-4 h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#DCE7EA" strokeDasharray="3 4" vertical={false} />
            <XAxis dataKey="m" tick={AXIS} tickLine={false} axisLine={{ stroke: '#DCE7EA' }} />
            <YAxis yAxisId="r" domain={[4.5, 5]} ticks={[4.5, 4.6, 4.7, 4.8, 4.9, 5]} tick={AXIS} tickLine={false} axisLine={false} width={36}
              tickFormatter={(v) => String(v).replace('.', ',')} />
            <YAxis yAxisId="p" orientation="right" domain={[0, 60]} tick={AXIS} tickLine={false} axisLine={false} width={36} unit="%" />
            <Tooltip content={<Tip names={{ rating: 'Рейтинг', repeat: 'Повторные' }} />} />
            <Legend formatter={(v) => (v === 'rating' ? 'Средняя оценка' : 'Повторные заказы')} iconType="circle" wrapperStyle={{ fontSize: 13 }} />
            <Bar yAxisId="p" dataKey="repeat" fill="#CFE3EE" radius={[5, 5, 0, 0]} maxBarSize={26} />
            <Line yAxisId="r" type="monotone" dataKey="rating" stroke="#0B4A6F" strokeWidth={2.5} dot={{ r: 3, fill: '#0B4A6F' }} activeDot={{ r: 6 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </figure>
  )
}

function DistributionChart() {
  const { ratingFilter, setRatingFilter } = useLead()
  const total = Object.values(RATING_COUNTS).reduce((a, b) => a + b, 0)
  const data = [5, 4, 3, 2, 1].map((s) => ({ star: `${s} ★`, s, count: RATING_COUNTS[s], pct: (RATING_COUNTS[s] / total) * 100 }))
  const pick = (s) => {
    setRatingFilter(ratingFilter === s ? 0 : s)
    document.getElementById('otzyvy')?.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <figure className="card flex flex-col p-5 md:p-6">
      <h3 className="font-sans text-lg font-semibold">Распределение всех оценок</h3>
      <p className="mt-1 text-sm text-ink-mute">Нажмите на строку, чтобы прочитать отзывы с этой оценкой.</p>
      <div className="mt-4 h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
            <XAxis type="number" hide domain={[0, 100]} />
            <YAxis type="category" dataKey="star" tick={{ ...AXIS, fontSize: 13 }} tickLine={false} axisLine={false} width={40} />
            <Tooltip cursor={{ fill: '#F2F7F8' }} content={({ active, payload }) => active && payload?.length ? (
              <div className="rounded-xl border border-line bg-white px-3 py-2 text-sm shadow-[var(--shadow-soft)]">
                <b className="num">{payload[0].payload.count}</b> оценок · <span className="num">{fmtNum(payload[0].payload.pct, 1)}%</span>
              </div>) : null} />
            <Bar dataKey="pct" radius={[0, 6, 6, 0]} background={{ fill: '#F2F7F8', radius: 6 }} onClick={(d) => pick(d.s)} cursor="pointer"
              label={{ position: 'right', fill: '#3E5A64', fontSize: 12, formatter: (v) => `${Math.round(v)}%` }}>
              {data.map((d) => <Cell key={d.s} fill={ratingFilter === d.s ? '#0B4A6F' : d.s >= 4 ? '#F4A12A' : '#B9C9CF'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-2" aria-label="Фильтр отзывов по оценке">
        {data.map((d) => (
          <button key={d.s} type="button" className="chip !min-h-[34px] !px-3 !text-sm" aria-pressed={ratingFilter === d.s} onClick={() => pick(d.s)}>{d.star}</button>
        ))}
      </div>
    </figure>
  )
}

export default function Stats() {
  return (
    <section id="statistika" className="bg-white" aria-labelledby="stats-title">
      <div className="wrap py-20">
        <SectionHead id="stats-title" eyebrow="Цифры и результаты" title="Проверяем результат приборами, а не на глаз"
          lead="Каждый пятый объект мы выборочно контролируем АТФ-тестом. Рейтинг считаем по всем оценкам, включая низкие."
          aside={<Demo />} />
        <div className="grid gap-5 lg:grid-cols-2">
          <AtpChart />
          <TrendChart />
          <DistributionChart />
        </div>
        <p className="mt-6 flex items-start gap-2 text-sm text-ink-mute"><Icon name="info" size={18} className="mt-0.5 shrink-0" />Значения в прототипе демонстрационные. В рабочей версии графики строятся из CRM и журнала замеров.</p>
      </div>
    </section>
  )
}
