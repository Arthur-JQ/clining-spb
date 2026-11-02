import React, { useState } from 'react'
import { Icon, SectionHead } from './ui.jsx'

const TRUST = [
  { icon: 'doc', title: 'Уведомление в Роспотребнадзоре', text: 'Деятельность по дезинфекции заявлена официально. Номер уведомления — в договоре.' },
  { icon: 'leaf', title: 'Сертифицированные средства', text: 'Только средства со свидетельством о госрегистрации или декларацией ЕАЭС. Покажем документы до начала работ.' },
  { icon: 'cert', title: 'Обученные мастера', text: 'Каждый мастер прошёл обучение по дезинфекционному делу и охране труда. Удостоверения — с собой.' },
  { icon: 'shield', title: 'Гарантия и страховка', text: 'Бесплатно переделаем замечания в срок гарантии. Ответственность перед клиентами застрахована.' },
]

export function Trust() {
  return (
    <section className="border-y border-line bg-white" aria-labelledby="trust-title">
      <div className="wrap py-14">
        <h2 id="trust-title" className="sr-only">Почему нам можно доверять</h2>
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map((t) => (
            <li key={t.title} className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-leaf-50 text-leaf-700"><Icon name={t.icon} size={24} /></span>
              <div>
                <h3 className="font-sans text-[1.05rem] font-semibold">{t.title}</h3>
                <p className="mt-1 text-[0.95rem] text-ink-soft">{t.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

const STEPS = [
  { who: 'Вы', title: 'Заявка или звонок', text: 'Оставляете заявку на сайте за минуту или звоните. Перезвоним в течение 15 минут в рабочее время.', time: '1 минута' },
  { who: 'Оценщик', title: 'Выезд в удобное время', text: 'Выбираете слот. Оценщик приезжает в двухчасовое окно и заранее пишет, когда будет на месте.', time: 'от 1,5 часа' },
  { who: 'Оценщик', title: 'Оценка и счёт', text: 'Осматривает помещение, при необходимости делает АТФ-замеры, оценивает степень загрязнения и выставляет счёт.', time: '20–40 минут' },
  { who: 'Вы', title: 'Согласование', text: 'Вы решаете, что из сметы нужно. Объём, цена и время фиксируются в договоре. Можно отказаться — выезд бесплатный.', time: 'без спешки' },
  { who: 'Мастера', title: 'Работа', text: 'Приезжает бригада с оборудованием и средствами. Бригадир показывает сертификаты и объясняет, сколько проветривать.', time: 'от 3 часов' },
  { who: 'Вы', title: 'Приёмка и отзыв', text: 'Проверяем результат вместе по чек-листу. Оплата — только после приёмки. Отзыв помогает нам и другим клиентам.', time: '15 минут' },
]

const ROLE_STYLE = {
  'Вы': 'bg-mist text-ink-soft',
  'Оценщик': 'bg-brand-50 text-brand-700',
  'Мастера': 'bg-leaf-50 text-leaf-700',
}

export function HowItWorks() {
  const [active, setActive] = useState(1)
  return (
    <section id="kak" className="bg-white" aria-labelledby="kak-title">
      <div className="wrap py-20">
        <SectionHead id="kak-title" eyebrow="Как это работает" title="Сначала смотрим, потом считаем. Никаких сюрпризов в счёте"
          lead="Шесть шагов от заявки до чистого помещения. Платите только в конце, когда приняли работу." />

        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s, i) => {
            const n = i + 1
            const on = active === n
            return (
              <li key={s.title}>
                <button type="button" onClick={() => setActive(n)} aria-pressed={on}
                  className={`card flex h-full w-full flex-col gap-3 p-6 text-left transition-colors ${on ? '!border-brand-500 ring-4 ring-brand-50' : 'hover:border-brand-100'}`}>
                  <span className="flex items-center justify-between">
                    <span className="num text-sm text-ink-mute">Шаг {n} из 6</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ROLE_STYLE[s.who]}`}>{s.who}</span>
                  </span>
                  <span className="font-display text-xl font-semibold">{s.title}</span>
                  <span className="text-ink-soft">{s.text}</span>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm text-ink-mute"><Icon name="clock" size={16} />{s.time}</span>
                </button>
              </li>
            )
          })}
        </ol>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ['Оценщик — специалист, не продавец', 'Получает фиксированную оплату за выезд, а не процент от заказа. Его задача — точно описать объём работ.'],
            ['Мастера проверены', 'Работают в штате, прошли обучение и проверку. Имя бригадира пришлём до приезда.'],
            ['Цена — после оценки', 'Сумма из сметы попадает в договор. Доплаты возможны только с вашего письменного согласия.'],
          ].map(([t, d]) => (
            <div key={t} className="flex gap-3 rounded-2xl bg-mist p-5">
              <Icon name="check" size={22} strokeWidth={2.4} className="mt-0.5 shrink-0 text-leaf-700" />
              <div><p className="font-semibold">{t}</p><p className="mt-1 text-[0.95rem] text-ink-soft">{d}</p></div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a href="#zayavka" className="btn btn-cta">Вызвать оценщика</a>
        </div>
      </div>
    </section>
  )
}
