import React, { useEffect, useState } from 'react'
import { TEAM, FAQ, COMPANY } from '../data/mock.js'
import { Icon, SectionHead, Avatar, Demo } from './ui.jsx'
import { Logo } from './Header.jsx'
import LeadForm from './LeadForm.jsx'

export function Team() {
  return (
    <section id="komanda" className="bg-white" aria-labelledby="team-title">
      <div className="wrap py-20">
        <SectionHead id="team-title" eyebrow="Команда" title="Люди, которые приедут к вам"
          lead="Все в штате, не подрядчики. Имя оценщика и бригадира присылаем заранее — вы знаете, кого ждать."
          aside={<Demo>фото заменить на реальные</Demo>} />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {TEAM.map((p) => (
            <li key={p.name} className="card flex flex-col p-5">
              <Avatar name={p.name} tone={p.tone} size={64} />
              <h3 className="mt-4 font-sans text-[1.05rem] font-semibold">{p.name}</h3>
              <p className="text-sm font-medium text-brand-700">{p.role}</p>
              <p className="num mt-1 text-sm text-ink-mute">стаж {p.years} лет</p>
              <p className="mt-3 text-[0.95rem] text-ink-soft">{p.note}</p>
              <ul className="mt-auto flex flex-wrap gap-1.5 pt-4">
                {p.certs.map((c) => (
                  <li key={c} className="inline-flex items-center gap-1 rounded-full bg-leaf-50 px-2 py-0.5 text-xs font-medium text-leaf-700">
                    <Icon name="cert" size={13} />{c}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="bg-mist" aria-labelledby="faq-title">
      <div className="wrap grid gap-10 py-20 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="eyebrow mb-3">Частые вопросы</p>
          <h2 id="faq-title" className="text-[1.75rem] font-semibold leading-tight md:text-[2.375rem]">Отвечаем на то, что обычно волнует</h2>
          <p className="mt-4 text-lg text-ink-soft">Не нашли свой вопрос? Позвоните — ответит специалист, а не колл-центр.</p>
          <a href={COMPANY.phoneHref} className="num mt-4 block text-xl font-semibold">{COMPANY.phone}</a>
          <a href={COMPANY.telegramHref} target="_blank" rel="noopener" className="mt-1 block font-semibold text-brand-700">Telegram {COMPANY.telegram}</a>
          <p className="text-sm text-ink-mute">{COMPANY.hours}</p>
        </div>
        <ul className="flex flex-col gap-3">
          {FAQ.map((item, i) => {
            const on = open === i
            return (
              <li key={item.q} className="card overflow-hidden">
                <h3 className="font-sans text-base">
                  <button type="button" className="flex w-full items-center justify-between gap-4 p-5 text-left text-[1.05rem] font-semibold"
                    aria-expanded={on} aria-controls={`faq-${i}`} id={`faq-q-${i}`} onClick={() => setOpen(on ? -1 : i)}>
                    {item.q}
                    <Icon name="chevron" className={`shrink-0 text-brand-700 transition-transform ${on ? 'rotate-180' : ''}`} />
                  </button>
                </h3>
                <div id={`faq-${i}`} role="region" aria-labelledby={`faq-q-${i}`} hidden={!on} className="px-5 pb-5 text-ink-soft">
                  {item.a}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export function FinalCta() {
  return (
    <section id="zayavka" className="bg-gradient-to-b from-brand-900 to-brand-700" aria-labelledby="cta-title">
      <div className="wrap grid gap-10 py-20 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="text-white">
          <p className="eyebrow mb-3 !text-leaf-100">Заявка на выезд оценщика</p>
          <h2 id="cta-title" className="text-[1.9rem] font-semibold leading-tight md:text-[2.6rem]">Узнайте точную цену, не рискуя ни рублём</h2>
          <p className="mt-5 text-lg text-brand-100">Три коротких шага. Если что-то уже выбрали в калькуляторе или на карте — мы подставили это за вас.</p>
          <ul className="mt-8 flex flex-col gap-4">
            {[
              ['Выезд в пределах КАД — бесплатно', 'Если смета не подойдёт, ничего не платите.'],
              ['Цена фиксируется после оценки', 'Сумма из сметы попадает в договор.'],
              ['Оплата после приёмки', 'Предоплата не нужна.'],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-amber-cta"><Icon name="check" size={18} strokeWidth={2.6} /></span>
                <span><span className="block font-semibold">{t}</span><span className="text-brand-100">{d}</span></span>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-brand-100">Удобнее голосом? <a href={COMPANY.phoneHref} className="num font-semibold text-white">{COMPANY.phone}</a></p>
          <p className="mt-2 text-brand-100">Или напишите в Telegram: <a href={COMPANY.telegramHref} target="_blank" rel="noopener" className="font-semibold text-white underline">{COMPANY.telegram}</a></p>
        </div>
        <LeadForm />
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="bg-ink pb-20 text-brand-100 md:pb-0" aria-label="Подвал сайта">
      <div className="wrap grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo light />
          <p className="mt-4 text-sm">Дезинфекция и клининг в Санкт-Петербурге с {COMPANY.since} года.</p>
        </div>
        <div>
          <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-white">Контакты</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            <li><a href={COMPANY.phoneHref} className="num text-white">{COMPANY.phone}</a></li>
            <li><a href={COMPANY.telegramHref} target="_blank" rel="noopener" className="hover:text-white">Telegram: {COMPANY.telegram}</a></li>
            <li><a href={`mailto:${COMPANY.email}`} className="hover:text-white">{COMPANY.email}</a></li>
            <li>{COMPANY.address}</li>
          </ul>
        </div>
        <div>
          <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-white">Режим работы</h2>
          <p className="mt-3 text-sm">{COMPANY.hours}<br />Выезд бригад — круглосуточно по договорённости</p>
        </div>
        <div>
          <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-white">Написать нам</h2>
          <ul className="mt-3 flex gap-2 text-sm">
            {[['Telegram', COMPANY.telegramHref], ['WhatsApp', COMPANY.whatsappHref]].map(([s, href]) => (
              <li key={s}><a href={href} target="_blank" rel="noopener" className="inline-flex min-h-[40px] items-center rounded-full border border-white/20 px-3 hover:border-white/50 hover:text-white">{s}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="wrap flex flex-col gap-2 py-5 text-xs text-brand-300 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} {COMPANY.name}. ООО «Пример», ИНН 0000000000 (заменить на реальные реквизиты).</p>
          <p id="privacy"><a href="#privacy" className="underline">Политика конфиденциальности</a> · <a href="#privacy" className="underline">Договор-оферта</a></p>
        </div>
      </div>
    </footer>
  )
}

// Нижняя закреплённая кнопка на мобильных: появляется после первого экрана, прячется у формы
export function StickyCta() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const form = document.getElementById('zayavka')
    let formVisible = false
    const update = () => setShow(window.scrollY > 520 && !formVisible)
    const io = form && 'IntersectionObserver' in window
      ? new IntersectionObserver(([e]) => { formVisible = e.isIntersecting; update() }, { threshold: 0.05 })
      : null
    io?.observe(form)
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => { window.removeEventListener('scroll', update); io?.disconnect() }
  }, [])
  return (
    <div className={`fixed inset-x-0 bottom-0 z-[1100] border-t border-line bg-white/95 backdrop-blur transition-transform md:hidden ${show ? 'translate-y-0' : 'translate-y-full'}`}
      style={{ paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))', paddingTop: 10, paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }}
      aria-hidden={!show}>
      <div className="flex gap-2">
        <a href={COMPANY.phoneHref} className="btn btn-ghost !px-4" aria-label="Позвонить" tabIndex={show ? 0 : -1}><Icon name="phone" /></a>
        <a href="#zayavka" className="btn btn-cta min-w-0 flex-1" tabIndex={show ? 0 : -1}>Вызвать оценщика</a>
      </div>
    </div>
  )
}
