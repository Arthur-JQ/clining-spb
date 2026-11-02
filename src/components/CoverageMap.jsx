import React, { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import { ZONES, MAP_CENTER, COMPANY } from '../data/mock.js'
import { zoneAt, geocodeMock, slotsFor, plural, firstFreeDay, bestZoneToday } from '../lib/utils.js'
import { useLead } from '../lib/store.js'
import { CITY_KAD_AREA } from '../data/region.js'
import { Icon, SectionHead, Demo, Spinner } from './ui.jsx'

export default function CoverageMap() {
  const { updateLead, goToForm } = useLead()
  const elRef = useRef(null)
  const mapRef = useRef(null)
  const layersRef = useRef({})
  const pinRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [noTiles, setNoTiles] = useState(false)
  const [selected, setSelected] = useState(bestZoneToday)
  const [query, setQuery] = useState('')
  const [checking, setChecking] = useState(false)
  const [check, setCheck] = useState(null) // {ok, zone, label} | {error}
  const [day, setDay] = useState(() => firstFreeDay(slotsFor(bestZoneToday())))
  const [slot, setSlot] = useState(null)

  // Инициализация карты
  useEffect(() => {
    if (mapRef.current || !elRef.current) return
    const map = L.map(elRef.current, { center: MAP_CENTER, zoom: 7, scrollWheelZoom: false, attributionControl: false })
    mapRef.current = map
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    })
    let errors = 0
    tiles.on('tileerror', () => { errors++; if (errors > 3) { setNoTiles(true); elRef.current?.classList.add('map-no-tiles') } })
    tiles.addTo(map)

    // Зона выезда на карте: Санкт-Петербург в пределах КАД (только суша), зелёная заливка
    const area = L.polygon(CITY_KAD_AREA.map((r) => [r]), { color: '#0A8F4E', weight: 2.5, fillColor: '#22C55E', fillOpacity: 0.35, fillRule: 'nonzero', interactive: false }).addTo(map)
    map.fitBounds(area.getBounds(), { padding: [20, 20] })

    map.on('click', (e) => {
      const z = zoneAt([e.latlng.lat, e.latlng.lng])
      placePin([e.latlng.lat, e.latlng.lng])
      if (z) { setSelected(z.id); setDay(firstFreeDay(slotsFor(z.id))); setCheck({ ok: true, zone: z, label: 'точка на карте' }) }
      else setCheck({ error: 'Эта точка вне зоны выезда. Позвоните нам — иногда выезжаем дальше по договорённости.' })
      setSlot(null)
    })
    setReady(true)
    return () => { map.remove(); mapRef.current = null; layersRef.current = {} }
  }, [])

  function placePin(at) {
    const map = mapRef.current
    if (!map) return
    if (pinRef.current) pinRef.current.setLatLng(at)
    else pinRef.current = L.marker(at, { icon: L.divIcon({ className: '', html: '<div class="map-pin"></div>', iconSize: [22, 22], iconAnchor: [11, 11] }), keyboard: false }).addTo(map)
  }

  const onCheck = (e) => {
    e.preventDefault()
    setCheck(null)
    const r = geocodeMock(query)
    if (r.error) { setCheck({ error: r.error }); return }
    setChecking(true)
    // Имитация запроса к геокодеру
    setTimeout(() => {
      const z = zoneAt(r.at)
      placePin(r.at)
      mapRef.current?.flyTo(r.at, 10, { duration: 0.6 })
      setChecking(false)
      if (!z) { setCheck({ error: 'Адрес вне зоны выезда. Позвоните — обсудим индивидуально.' }); return }
      setSelected(z.id); setDay(firstFreeDay(slotsFor(z.id))); setSlot(null)
      setCheck({ ok: true, zone: z, label: r.label })
    }, 600)
  }

  const zone = ZONES.find((z) => z.id === selected)
  const days = useMemo(() => slotsFor(selected), [selected])
  const freeCount = days[day].slots.filter((s) => s.free).length

  const book = () => {
    updateLead({ zone: zone.id, date: days[day].date, dateLabel: days[day].label, slot })
    goToForm()
  }

  return (
    <section id="karta" className="bg-mist" aria-labelledby="map-title">
      <div className="wrap py-20">
        <SectionHead id="map-title" eyebrow="Зоны выезда и свободное время" title="Проверьте адрес и выберите время оценщика"
          lead={`Зелёным отмечен Санкт-Петербург в пределах КАД. Нажмите в любую точку карты или введите адрес. Оценщики выезжают максимум на ${COMPANY.assessorsPerDay} объектов в день — поэтому показываем только реально свободные окна.`}
          aside={<Demo>слоты демонстрационные</Demo>} />

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="relative self-start overflow-hidden rounded-2xl border border-line bg-white">
            {!ready && (
              <div className="absolute inset-0 z-[500] flex items-center justify-center gap-2 bg-mist text-ink-mute"><Spinner />Загружаем карту…</div>
            )}
            <div ref={elRef} className="h-[380px] w-full md:h-[520px]" role="application"
              aria-label="Карта зоны выезда: Санкт-Петербург. Выбор района доступен также в списке справа." />
            <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-line px-4 py-3 text-sm text-ink-soft">
              <span className="flex items-center gap-2"><i className="h-3 w-3 rounded-sm bg-[#22C55E]/50 ring-1 ring-[#0A8F4E]" />Санкт-Петербург в пределах КАД</span>
              <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener" className="ml-auto text-xs text-ink-mute hover:underline">карта © OpenStreetMap</a>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <form onSubmit={onCheck} className="card p-5" noValidate>
              <label htmlFor="addr" className="font-semibold">Проверить адрес</label>
              <div className="mt-2 flex gap-2">
                <input id="addr" className="field" placeholder="Улица, метро или город" value={query} autoComplete="street-address"
                  onChange={(e) => setQuery(e.target.value)} aria-invalid={check?.error ? 'true' : 'false'} aria-describedby="addr-msg" />
                <button className="btn btn-dark !px-4" type="submit" disabled={checking} aria-label="Проверить адрес">
                  {checking ? <Spinner /> : <Icon name="search" />}
                </button>
              </div>
              <div id="addr-msg" aria-live="polite" className="mt-3 text-sm">
                {check?.error && <p className="flex gap-2 text-danger"><Icon name="alert" size={18} className="shrink-0" />{check.error}</p>}
                {check?.ok && (
                  <p className="flex gap-2 text-leaf-700"><Icon name="check" size={18} strokeWidth={2.4} className="shrink-0" />
                    <span>Выезжаем! {check.zone.full} ({check.label}). Оценщик приедет {/^\d/.test(check.zone.eta) ? `за ${check.zone.eta}` : check.zone.eta}.</span></p>
                )}
                {!check && <p className="text-ink-mute">Например: «Купчино», «Озерки», «Пушкин», «Кронштадт».</p>}
              </div>
            </form>

            <div className="card p-5">
              <label htmlFor="zone-select" className="text-sm text-ink-mute">Район</label>
              <select id="zone-select" className="field mt-1 !min-h-[46px] font-semibold" value={selected}
                onChange={(e) => { setSelected(e.target.value); setDay(firstFreeDay(slotsFor(e.target.value))); setSlot(null) }}>
                {ZONES.map((z) => <option key={z.id} value={z.id}>{z.name} — {z.full}</option>)}
              </select>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-mist p-3"><dt className="text-ink-mute">Приезд оценщика</dt><dd className="mt-0.5 font-semibold">{zone.eta}</dd></div>
                <div className="rounded-xl bg-mist p-3"><dt className="text-ink-mute">Стоимость выезда</dt><dd className="mt-0.5 font-semibold">{zone.free ? 'Бесплатно' : `${zone.visitPrice} ₽, в счёт заказа`}</dd></div>
              </dl>

              <div className="mt-5" role="tablist" aria-label="День выезда">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {days.map((d, i) => (
                    <button key={d.date} type="button" role="tab" aria-selected={day === i} className="chip shrink-0" aria-pressed={day === i}
                      onClick={() => { setDay(i); setSlot(null) }}>
                      {d.label}<span className="num text-xs opacity-75">{d.slots.filter((s) => s.free).length}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div role="tabpanel" className="mt-3">
                {freeCount === 0 ? (
                  <p className="rounded-xl bg-warn-50 p-3 text-sm text-warn">На {days[day].label.toLowerCase()} свободных окон нет. Выберите другой день — или оставьте заявку, мы позвоним, если окно освободится.</p>
                ) : (
                  <>
                    <p className="mb-2 text-sm text-ink-soft">Свободно {freeCount} {plural(freeCount, 'окно', 'окна', 'окон')}:</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                      {days[day].slots.map((s) => (
                        <button key={s.time} type="button" disabled={!s.free} aria-pressed={slot === s.time}
                          onClick={() => setSlot(s.time)}
                          className={`num min-h-[44px] rounded-xl border-[1.5px] px-2 text-sm transition-colors ${!s.free ? 'cursor-not-allowed border-line bg-mist text-ink-mute line-through' : slot === s.time ? 'border-brand-700 bg-brand-700 text-white' : 'border-line bg-white hover:border-brand-300'}`}>
                          {s.time}<span className="sr-only">{s.free ? '' : ' — занято'}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <button type="button" className="btn btn-cta mt-5 w-full" disabled={!slot} onClick={book}>
                {slot ? `Записать оценщика на ${slot}` : 'Выберите время'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
