import React, { useEffect, useRef, useState } from 'react'
import { OBJECT_TYPES, SERVICE_TYPES, ZONES, COMPANY } from '../data/mock.js'
import { formatPhone, phoneValid, slotsFor } from '../lib/utils.js'
import { useLead } from '../lib/store.js'
import { sendLead, leadRows } from '../lib/sendLead.js'
import { Icon, Spinner } from './ui.jsx'

const STEPS = ['Что нужно', 'Где и когда', 'Контакты']

const EMPTY = {
  object: 'flat', service: 'complex', area: '', comment: '',
  address: '', zone: '', date: '', slot: '', callback: false,
  name: '', phone: '', consent: false, website: '',
}

function Err({ id, msg }) {
  if (!msg) return null
  return <p id={id} className="mt-1.5 flex items-center gap-1.5 text-sm text-danger"><Icon name="alert" size={16} />{msg}</p>
}

export default function LeadForm() {
  const { lead } = useLead()
  const [step, setStep] = useState(0)
  const [f, setF] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [startedAt] = useState(() => Date.now())
  const headRef = useRef(null)

  // Подставляем то, что пользователь уже выбрал в калькуляторе или на карте
  useEffect(() => {
    if (!lead || !Object.keys(lead).length) return
    setF((p) => ({ ...p, ...lead, area: lead.area ? String(lead.area) : p.area, callback: lead.slot ? false : p.callback }))
  }, [lead])

  const set = (k, v) => { setF((p) => ({ ...p, [k]: v })); setErrors((e) => ({ ...e, [k]: undefined })) }

  const validate = (s) => {
    const e = {}
    if (s === 0) {
      if (f.area && (Number(f.area) < 5 || Number(f.area) > 5000)) e.area = 'Укажите площадь от 5 до 5000 м² или оставьте поле пустым.'
    }
    if (s === 1) {
      if (f.address.trim().length < 5) e.address = 'Напишите адрес: улица и дом, чтобы оценщик нашёл объект.'
      if (!f.zone) e.zone = 'Выберите район.'
      if (!f.callback && !f.slot) e.slot = 'Выберите время или отметьте «Перезвоните, согласуем время».'
    }
    if (s === 2) {
      if (f.name.trim().length < 2) e.name = 'Как к вам обращаться? Достаточно имени.'
      if (!phoneValid(f.phone)) e.phone = 'Номер неполный. Нужно 10 цифр после +7.'
      if (!f.consent) e.consent = 'Без согласия мы не сможем перезвонить вам.'
    }
    setErrors(e)
    if (Object.keys(e).length) {
      const first = document.getElementById(`lf-${Object.keys(e)[0]}`)
      first?.focus()
    }
    return !Object.keys(e).length
  }

  const next = () => { if (validate(step)) { setStep(step + 1); headRef.current?.focus() } }
  const back = () => { setStep(step - 1); headRef.current?.focus() }

  const submit = async (e) => {
    e.preventDefault()
    if (step < 2) { next(); return }
    if (!validate(2)) return
    // Антиспам-заглушка: скрытое поле и слишком быстрая отправка
    if (f.website || Date.now() - startedAt < 2500) { setStatus('success'); return }
    setStatus('sending')
    const label = (list, id) => list.find((x) => x.id === id)?.label || id
    const z = ZONES.find((x) => x.id === f.zone)
    const rows = leadRows([
      ['Имя', f.name.trim()],
      ['Телефон', f.phone],
      ['Объект', label(OBJECT_TYPES, f.object)],
      ['Услуга', f.service === 'unknown' ? 'Нужна консультация' : label(SERVICE_TYPES, f.service)],
      ['Площадь, м²', f.area],
      ['Что беспокоит', f.comment],
      ['Адрес', f.address.trim()],
      ['Район', z ? `${z.name} — ${z.full}` : f.zone],
      ['Выезд оценщика', f.callback ? 'Перезвонить и согласовать время' : `${f.dateLabel || f.date}, ${f.slot}`],
      ['Ориентир из калькулятора', lead?.estimate],
      ['Отправлено', new Date().toLocaleString('ru-RU')],
    ])
    try {
      await sendLead(rows, `Заявка: ${f.name.trim()}, ${f.phone}`)
    } catch (err) {
      console.error(err)
      setStatus('error')
      return
    }
    setStatus('success')
    headRef.current?.focus()
  }

  const days = f.zone ? slotsFor(f.zone) : []
  const zone = ZONES.find((z) => z.id === f.zone)

  if (status === 'success') {
    return (
      <div className="card p-6 md:p-10" role="status">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-leaf-50 text-leaf-700"><Icon name="check" size={30} strokeWidth={2.6} /></span>
        <h3 ref={headRef} tabIndex={-1} className="mt-5 text-2xl font-semibold">Заявка принята, {f.name.trim() || 'спасибо'}!</h3>
        <p className="mt-2 text-ink-soft">Перезвоним на <span className="num">{f.phone}</span> в течение 15 минут ({COMPANY.hours.toLowerCase()}).</p>
        <ol className="mt-6 flex flex-col gap-3">
          {[
            f.slot ? `Подтвердим выезд оценщика: ${f.dateLabel || f.date}, ${f.slot}.` : 'Согласуем удобное время выезда оценщика.',
            'За час до приезда оценщик напишет, что выехал.',
            'На месте — осмотр 20–40 минут и смета. Решение за вами, выезд ни к чему не обязывает.',
          ].map((t, i) => (
            <li key={i} className="flex gap-3"><span className="num flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm text-brand-700">{i + 1}</span><span className="pt-0.5">{t}</span></li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-ink-soft">Срочно? Позвоните <a href={COMPANY.phoneHref} className="num font-semibold text-brand-700">{COMPANY.phone}</a> или напишите в <a href={COMPANY.telegramHref} target="_blank" rel="noopener" className="font-semibold text-brand-700">Telegram {COMPANY.telegram}</a>.</p>
        <button type="button" className="btn btn-ghost mt-6" onClick={() => { setF(EMPTY); setStep(0); setStatus('idle') }}>Оставить ещё одну заявку</button>
      </div>
    )
  }

  return (
    <form className="card relative p-6 md:p-8" onSubmit={submit} noValidate aria-labelledby="lf-title">
      <div className="flex items-center justify-between gap-3">
        <h3 id="lf-title" ref={headRef} tabIndex={-1} className="font-sans text-lg font-semibold">Шаг {step + 1} из 3: {STEPS[step]}</h3>
        <span className="num text-sm text-ink-mute">{Math.round(((step + 1) / 3) * 100)}%</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5" aria-hidden="true">
        {STEPS.map((s, i) => <span key={s} className={`h-1.5 rounded-full ${i <= step ? 'bg-brand-700' : 'bg-line'}`} />)}
      </div>

      {/* Антиспам: скрытое поле для ботов */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="lf-website">Сайт</label>
        <input id="lf-website" tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set('website', e.target.value)} />
      </div>

      <div className="mt-7 flex flex-col gap-6">
        {step === 0 && (
          <>
            <fieldset>
              <legend className="mb-2.5 font-semibold">Объект</legend>
              <div className="flex flex-wrap gap-2">
                {OBJECT_TYPES.map((o) => <button key={o.id} type="button" className="chip" aria-pressed={f.object === o.id} onClick={() => set('object', o.id)}>{o.label}</button>)}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-2.5 font-semibold">Услуга</legend>
              <div className="flex flex-wrap gap-2">
                {SERVICE_TYPES.map((o) => <button key={o.id} type="button" className="chip" aria-pressed={f.service === o.id} onClick={() => set('service', o.id)}>{o.label}</button>)}
                <button type="button" className="chip" aria-pressed={f.service === 'unknown'} onClick={() => set('service', 'unknown')}>Не знаю, нужна консультация</button>
              </div>
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
              <div>
                <label htmlFor="lf-area" className="mb-1.5 block font-semibold">Площадь, м²</label>
                <input id="lf-area" className="field num" inputMode="numeric" value={f.area} placeholder="Если знаете"
                  onChange={(e) => set('area', e.target.value.replace(/\D/g, '').slice(0, 4))} aria-invalid={!!errors.area} aria-describedby="lf-area-err" />
                <Err id="lf-area-err" msg={errors.area} />
              </div>
              <div>
                <label htmlFor="lf-comment" className="mb-1.5 block font-semibold">Что беспокоит <span className="font-normal text-ink-mute">(необязательно)</span></label>
                <input id="lf-comment" className="field" value={f.comment} placeholder="Например: плесень в ванной, после болезни" onChange={(e) => set('comment', e.target.value)} maxLength={300} />
              </div>
            </div>
            {lead?.estimate && <p className="rounded-xl bg-brand-50 p-3 text-sm text-brand-700">Из калькулятора: ориентир {lead.estimate}. Оценщик уточнит цену на месте.</p>}
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <label htmlFor="lf-address" className="mb-1.5 block font-semibold">Адрес объекта</label>
              <input id="lf-address" className="field" autoComplete="street-address" value={f.address} placeholder="Невский пр., 28"
                onChange={(e) => set('address', e.target.value)} aria-invalid={!!errors.address} aria-describedby="lf-address-err" />
              <Err id="lf-address-err" msg={errors.address} />
            </div>
            <div>
              <label htmlFor="lf-zone" className="mb-1.5 block font-semibold">Район</label>
              <select id="lf-zone" className="field" value={f.zone} onChange={(e) => { set('zone', e.target.value); set('slot', ''); set('date', '') }}
                aria-invalid={!!errors.zone} aria-describedby="lf-zone-err">
                <option value="">Выберите район</option>
                {ZONES.map((z) => <option key={z.id} value={z.id}>{z.name} — {z.full}</option>)}
              </select>
              <Err id="lf-zone-err" msg={errors.zone} />
              {zone && <p className="mt-1.5 text-sm text-ink-mute">Оценщик приедет: {zone.eta}. Выезд {zone.free ? 'бесплатный' : `${zone.visitPrice} ₽, засчитывается в заказ`}.</p>}
            </div>
            {f.zone && !f.callback && (
              <fieldset>
                <legend className="mb-2.5 font-semibold">Время выезда оценщика</legend>
                <div className="flex flex-col gap-3">
                  {days.slice(0, 3).map((d) => (
                    <div key={d.date} className="flex flex-wrap items-center gap-2">
                      <span className="w-full text-sm text-ink-mute sm:w-28">{d.label}</span>
                      {d.slots.filter((s) => s.free).length === 0 && <span className="text-sm text-ink-mute">мест нет</span>}
                      {d.slots.filter((s) => s.free).map((s) => {
                        const on = f.date === d.date && f.slot === s.time
                        return <button key={s.time} type="button" className="chip num !min-h-[38px] !text-sm" aria-pressed={on}
                          onClick={() => { set('date', d.date); set('dateLabel', d.label); set('slot', s.time) }}>{s.time}</button>
                      })}
                    </div>
                  ))}
                </div>
              </fieldset>
            )}
            <label className="flex cursor-pointer items-start gap-3">
              <input id="lf-callback" type="checkbox" className="mt-1 h-5 w-5 accent-brand-700" checked={f.callback}
                onChange={(e) => { set('callback', e.target.checked); if (e.target.checked) { set('slot', ''); set('date', '') } }} />
              <span>Перезвоните, согласуем время по телефону</span>
            </label>
            <Err id="lf-slot-err" msg={errors.slot} />
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="lf-name" className="mb-1.5 block font-semibold">Имя</label>
                <input id="lf-name" className="field" autoComplete="given-name" value={f.name} placeholder="Анна"
                  onChange={(e) => set('name', e.target.value)} aria-invalid={!!errors.name} aria-describedby="lf-name-err" />
                <Err id="lf-name-err" msg={errors.name} />
              </div>
              <div>
                <label htmlFor="lf-phone" className="mb-1.5 block font-semibold">Телефон</label>
                <input id="lf-phone" className="field num" type="tel" inputMode="tel" autoComplete="tel" value={f.phone} placeholder="+7 (___) ___-__-__"
                  onFocus={() => !f.phone && set('phone', '+7')} onChange={(e) => set('phone', formatPhone(e.target.value))}
                  aria-invalid={!!errors.phone} aria-describedby="lf-phone-err" />
                <Err id="lf-phone-err" msg={errors.phone} />
              </div>
            </div>
            <div>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-ink-soft">
                <input id="lf-consent" type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-brand-700" checked={f.consent}
                  onChange={(e) => set('consent', e.target.checked)} aria-invalid={!!errors.consent} aria-describedby="lf-consent-err" />
                <span>Согласен на обработку персональных данных в соответствии с <a href="#privacy" className="text-brand-700 underline">политикой конфиденциальности</a>. Используем телефон только для связи по заявке.</span>
              </label>
              <Err id="lf-consent-err" msg={errors.consent} />
            </div>
            {status === 'error' && (
              <div role="alert" className="flex gap-3 rounded-xl bg-danger-50 p-4 text-sm text-danger">
                <Icon name="alert" size={20} className="shrink-0" />
                <span>Не получилось отправить заявку. Попробуйте ещё раз, позвоните <a href={COMPANY.phoneHref} className="num font-bold underline">{COMPANY.phone}</a> или напишите в Telegram <a href={COMPANY.telegramHref} target="_blank" rel="noopener" className="font-bold underline">{COMPANY.telegram}</a>.</span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        {step > 0 ? <button type="button" className="btn btn-ghost" onClick={back}>Назад</button> : <span />}
        {step < 2
          ? <button type="submit" className="btn btn-dark">Дальше<Icon name="arrow" size={18} /></button>
          : <button type="submit" className="btn btn-cta text-lg" disabled={status === 'sending'}>
            {status === 'sending' ? <><Spinner />Отправляем…</> : 'Вызвать оценщика'}
          </button>}
      </div>
      <p className="mt-4 text-center text-sm text-ink-mute sm:text-right">Выезд ни к чему не обязывает. Оценщик не навязывает услуги.</p>
    </form>
  )
}
