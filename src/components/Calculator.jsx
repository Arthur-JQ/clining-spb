import React, { useMemo, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceDot, Legend } from 'recharts'
import { OBJECT_TYPES, SERVICE_TYPES, DIRT_LEVELS, URGENCY, SEASON_OFFER, MIN_ORDER } from '../data/mock.js'
import { estimate, priceCurve, rub, fmtNum, offerState } from '../lib/utils.js'
import { useLead } from '../lib/store.js'
import { Icon, SectionHead } from './ui.jsx'

const DIRT_COLORS = { light: '#12A37A', medium: '#1D6E9C', heavy: '#8A5A00' }

function Segmented({ label, options, value, onChange, name, describe }) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-[0.95rem] font-semibold">{label}</legend>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={value === o.id} className="chip" name={name}
            onClick={() => onChange(o.id)}>{o.label}</button>
        ))}
      </div>
      {describe && <p className="mt-2 text-sm text-ink-mute">{describe}</p>}
    </fieldset>
  )
}

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 text-sm shadow-[var(--shadow-soft)]">
      <p className="num mb-1 text-ink-mute">{label} м²</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          {DIRT_LEVELS.find((d) => d.id === p.dataKey)?.label}: <b className="num">{rub(p.value)}</b>
        </p>
      ))}
    </div>
  )
}

export default function Calculator() {
  const { updateLead, goToForm } = useLead()
  const [object, setObject] = useState('flat')
  const [service, setService] = useState('complex')
  const [area, setArea] = useState(64)
  const [dirt, setDirt] = useState('medium')
  const [urgency, setUrgency] = useState('plan')
  const params = { object, service, area, dirt, urgency }
  const est = estimate(params)
  const curve = useMemo(() => priceCurve({ object, service, urgency }), [object, service, urgency])
  const offer = offerState()
  const offerApplies = offer.active && SEASON_OFFER.appliesTo.includes(service)

  const setAreaSafe = (v) => {
    const n = Math.round(Number(v))
    if (Number.isNaN(n)) return
    setArea(Math.min(1000, Math.max(10, n)))
  }

  const sendToAssessor = () => {
    updateLead({ object, service, area, dirt, estimate: `${rub(est.low)} – ${rub(est.high)}` })
    goToForm()
  }

  return (
    <section id="kalkulyator" className="bg-white" aria-labelledby="calc-title">
      <div className="wrap py-20">
        <SectionHead id="calc-title" eyebrow="Калькулятор" title="Прикиньте бюджет за 30 секунд"
          lead="Двигайте параметры — цена и график пересчитываются сразу. Это ориентир: точную сумму назовёт оценщик после осмотра." />

        <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr]">
          <div className="card flex flex-col gap-7 p-6 md:p-8">
            <Segmented label="Тип объекта" options={OBJECT_TYPES} value={object} onChange={setObject}
              describe={OBJECT_TYPES.find((o) => o.id === object).hint} />
            <Segmented label="Что нужно" options={SERVICE_TYPES} value={service} onChange={setService} />

            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label htmlFor="area-num" className="text-[0.95rem] font-semibold">Площадь</label>
                <div className="flex items-center gap-2">
                  <input id="area-num" type="number" inputMode="numeric" min="10" max="1000" value={area}
                    onChange={(e) => setAreaSafe(e.target.value)} className="field num !min-h-[44px] w-24 !py-2 text-right" />
                  <span className="text-ink-mute">м²</span>
                </div>
              </div>
              <input type="range" className="range" min="10" max="500" step="1" value={Math.min(area, 500)}
                onChange={(e) => setAreaSafe(e.target.value)} aria-label="Площадь, квадратных метров" aria-valuetext={`${area} квадратных метров`} />
              <div className="num flex justify-between text-xs text-ink-mute"><span>10</span><span>250</span><span>500+</span></div>
            </div>

            <Segmented label="Степень загрязнения" options={DIRT_LEVELS} value={dirt} onChange={setDirt}
              describe={DIRT_LEVELS.find((d) => d.id === dirt).hint} />
            <Segmented label="Когда нужно" options={URGENCY} value={urgency} onChange={setUrgency}
              describe={urgency === 'plan' ? 'Самый выгодный вариант: без наценки за срочность.' : `Наценка за срочность ${urgency === 'today' ? '25' : '10'}% — нужно перестроить график бригады.`} />
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <div className="rounded-[var(--radius-card)] bg-brand-900 p-6 text-white md:p-8" aria-live="polite">
              <p className="text-brand-100">Ориентировочная стоимость</p>
              <p className="num mt-1 text-[2.1rem] font-semibold leading-tight md:text-[2.6rem]">
                {rub(est.low)} <span className="text-brand-300">–</span> {rub(est.high)}
              </p>
              <p className="num mt-2 text-sm text-brand-100">≈ {fmtNum(est.perM2)} ₽ за м² · {area} м²</p>
              {offerApplies && (
                <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm">
                  <Icon name="sparkle" size={16} className="text-amber-cta" />Учтена скидка 10% до 30 ноября: −{rub(est.discount)}
                </p>
              )}
              {est.minApplied && <p className="mt-3 text-sm text-brand-100">Применён минимальный заказ — {rub(MIN_ORDER)}.</p>}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button type="button" className="btn btn-cta" onClick={sendToAssessor}>Вызвать оценщика с этими параметрами</button>
              </div>
              <p className="mt-4 flex items-start gap-2 text-sm text-brand-100">
                <Icon name="info" size={18} className="mt-0.5 shrink-0" />
                Точная цена — после оценки оценщиком. Она фиксируется в договоре и не меняется без вашего согласия.
              </p>
            </div>

            <div className="card p-4 md:p-6">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-sans text-base font-semibold">Как цена зависит от площади</h3>
                <p className="text-sm text-ink-mute">После 100 м² каждый метр дешевле</p>
              </div>
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={curve} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#DCE7EA" strokeDasharray="3 4" vertical={false} />
                    <XAxis dataKey="area" type="number" domain={[20, 500]} ticks={[20, 100, 200, 300, 400, 500]} tick={{ fill: '#5E7780', fontSize: 12 }}
                      tickLine={false} axisLine={{ stroke: '#DCE7EA' }} unit=" м²" />
                    <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}к`} tick={{ fill: '#5E7780', fontSize: 12 }} tickLine={false} axisLine={false} width={44} />
                    <Tooltip content={<ChartTip />} />
                    <Legend formatter={(v) => DIRT_LEVELS.find((d) => d.id === v)?.label} iconType="circle" wrapperStyle={{ fontSize: 13 }} />
                    {DIRT_LEVELS.map((d) => (
                      <Line key={d.id} type="monotone" dataKey={d.id} stroke={DIRT_COLORS[d.id]} dot={false}
                        strokeWidth={dirt === d.id ? 3 : 1.5} strokeOpacity={dirt === d.id ? 1 : 0.45} isAnimationActive={false} />
                    ))}
                    {area <= 500 && <ReferenceDot x={Math.max(20, area)} y={Math.round(estimate({ ...params, area: Math.max(20, area) }).total)} r={7} fill="#FFB547" stroke="#0E2730" strokeWidth={2} />}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-xs text-ink-mute">Жёлтая точка — ваш вариант. Линии — три степени загрязнения при тех же условиях.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
