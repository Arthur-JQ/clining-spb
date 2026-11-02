import React, { useMemo, useState, useEffect } from 'react'
import { REVIEWS, RATING_COUNTS, SERVICE_TYPES, OBJECT_TYPES } from '../data/mock.js'
import { fmtDate, fmtNum, plural } from '../lib/utils.js'
import { useLead } from '../lib/store.js'
import { ratingSummary } from './Hero.jsx'
import { Icon, Stars, SectionHead, Demo, BeforeAfterThumb } from './ui.jsx'

const PAGE = 4
const svc = (id) => SERVICE_TYPES.find((s) => s.id === id)?.label
const obj = (id) => OBJECT_TYPES.find((o) => o.id === id)?.label

function ReviewCard({ r }) {
  return (
    <article className="card flex flex-col gap-4 p-5 md:p-6" aria-label={`Отзыв: ${r.name}, оценка ${r.rating}`}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{r.name} <span className="font-normal text-ink-mute">· {r.district}</span></p>
          <p className="text-sm text-ink-mute"><time dateTime={r.date}>{fmtDate(r.date)}</time></p>
        </div>
        <Stars value={r.rating} />
      </header>
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-brand-700">{svc(r.service)}</span>
        <span className="rounded-full bg-mist px-2.5 py-1 text-ink-soft">{obj(r.object)}</span>
        {r.verified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-leaf-50 px-2.5 py-1 text-leaf-700" title="Отзыв оставлен по ссылке из акта выполненных работ">
            <Icon name="shield" size={14} strokeWidth={2.2} />Проверенный клиент
          </span>
        )}
      </div>
      <p className="text-[0.98rem] text-ink-soft">{r.text}</p>
      {r.photos && (
        <div className="grid max-w-[260px] grid-cols-2 gap-2">
          <div className="aspect-[4/3] overflow-hidden rounded-lg"><BeforeAfterThumb kind="before" seed={r.id} /></div>
          <div className="aspect-[4/3] overflow-hidden rounded-lg"><BeforeAfterThumb kind="after" seed={r.id} /></div>
        </div>
      )}
      {r.reply && (
        <div className="rounded-xl border-l-[3px] border-brand-300 bg-mist px-4 py-3 text-sm">
          <p className="font-semibold text-brand-700">Ответ компании</p>
          <p className="mt-1 text-ink-soft">{r.reply}</p>
        </div>
      )}
    </article>
  )
}

export default function Reviews() {
  const { ratingFilter, setRatingFilter } = useLead()
  const [service, setService] = useState('all')
  const [sort, setSort] = useState('new')
  const [withPhotos, setWithPhotos] = useState(false)
  const [shown, setShown] = useState(PAGE)
  const { total, avg } = ratingSummary()

  useEffect(() => setShown(PAGE), [service, sort, withPhotos, ratingFilter])

  const list = useMemo(() => {
    let l = REVIEWS.filter((r) => (service === 'all' || r.service === service) && (!ratingFilter || r.rating === ratingFilter) && (!withPhotos || r.photos))
    l = [...l].sort((a, b) => sort === 'new' ? b.date.localeCompare(a.date) : sort === 'high' ? b.rating - a.rating || b.date.localeCompare(a.date) : a.rating - b.rating || b.date.localeCompare(a.date))
    return l
  }, [service, sort, withPhotos, ratingFilter])

  const reset = () => { setService('all'); setRatingFilter(0); setWithPhotos(false); setSort('new') }

  return (
    <section id="otzyvy" className="bg-mist" aria-labelledby="reviews-title">
      <div className="wrap py-20">
        <SectionHead id="reviews-title" eyebrow="Отзывы и оценки" title="Что говорят клиенты, включая критику"
          lead="Публикуем все отзывы, в том числе низкие оценки, и отвечаем на каждый. Отзыв можно оставить только по ссылке из акта выполненных работ."
          aside={<Demo>отзывы-примеры</Demo>} />

        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start" aria-label="Сводка и фильтры">
            <div className="card p-5">
              <p className="num text-5xl font-semibold">{fmtNum(avg, 1)}</p>
              <Stars value={avg} size={20} />
              <p className="mt-1 text-sm text-ink-mute">на основе {fmtNum(total)} {plural(total, 'оценки', 'оценок', 'оценок')}</p>
              <ul className="mt-4 flex flex-col gap-1.5">
                {[5, 4, 3, 2, 1].map((s) => {
                  const pct = (RATING_COUNTS[s] / total) * 100
                  return (
                    <li key={s}>
                      <button type="button" onClick={() => setRatingFilter(ratingFilter === s ? 0 : s)} aria-pressed={ratingFilter === s}
                        className={`flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-sm ${ratingFilter === s ? 'bg-brand-50' : 'hover:bg-mist'}`}>
                        <span className="num w-6 text-ink-soft">{s}★</span>
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-line"><span className="block h-full rounded-full bg-amber-cta-hover" style={{ width: `${pct}%` }} /></span>
                        <span className="num w-9 text-right text-ink-mute">{RATING_COUNTS[s]}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="card flex flex-col gap-4 p-5">
              <fieldset>
                <legend className="mb-2 text-sm font-semibold">Услуга</legend>
                <div className="flex flex-wrap gap-2">
                  {[{ id: 'all', label: 'Все' }, ...SERVICE_TYPES].map((s) => (
                    <button key={s.id} type="button" className="chip !min-h-[36px] !text-sm" aria-pressed={service === s.id} onClick={() => setService(s.id)}>{s.label}</button>
                  ))}
                </div>
              </fieldset>
              <div>
                <label htmlFor="sort" className="mb-2 block text-sm font-semibold">Сортировка</label>
                <select id="sort" className="field !min-h-[44px]" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="new">Сначала новые</option>
                  <option value="high">Сначала высокие оценки</option>
                  <option value="low">Сначала низкие оценки</option>
                </select>
              </div>
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input id="with-photos" type="checkbox" className="h-5 w-5 accent-brand-700" checked={withPhotos} onChange={(e) => setWithPhotos(e.target.checked)} />
                Только с фото до/после
              </label>
            </div>
          </aside>

          <div>
            <p className="mb-4 text-sm text-ink-mute" aria-live="polite">
              Найдено {list.length} {plural(list.length, 'отзыв', 'отзыва', 'отзывов')}{ratingFilter ? ` с оценкой ${ratingFilter}★` : ''}
              {(ratingFilter || service !== 'all' || withPhotos) ? <> · <button type="button" className="font-semibold text-brand-700 underline-offset-2 hover:underline" onClick={reset}>сбросить фильтры</button></> : null}
            </p>
            {list.length === 0 ? (
              <div className="card flex flex-col items-center gap-3 p-10 text-center">
                <Icon name="search" size={32} className="text-ink-mute" />
                <p className="font-semibold">По этим фильтрам отзывов пока нет</p>
                <p className="max-w-sm text-sm text-ink-mute">Попробуйте выбрать другую услугу или оценку.</p>
                <button type="button" className="btn btn-ghost" onClick={reset}>Показать все отзывы</button>
              </div>
            ) : (
              <>
                <div className="grid gap-4 xl:grid-cols-2">
                  {list.slice(0, shown).map((r) => <ReviewCard key={r.id} r={r} />)}
                </div>
                {shown < list.length && (
                  <div className="mt-6 text-center">
                    <button type="button" className="btn btn-ghost" onClick={() => setShown(shown + PAGE)}>
                      Показать ещё {Math.min(PAGE, list.length - shown)} из {list.length - shown}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
