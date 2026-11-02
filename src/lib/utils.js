import { SPB_BORDER, KRONSTADT } from '../data/region.js'
import { RATES, DIRT_LEVELS, URGENCY, MIN_ORDER, SEASON_OFFER, ZONES, MAP_CENTER, PLACES, TIME_SLOTS } from '../data/mock.js'

// ---------- Форматирование ----------
export const rub = (n) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(Math.round(n)) + ' ₽'
export const fmtNum = (n, d = 0) => new Intl.NumberFormat('ru-RU', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n)
export const fmtDate = (iso) => new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })

export function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few
  return many
}

// ---------- Сезонное предложение ----------
export function offerState(now = new Date()) {
  const end = new Date(SEASON_OFFER.endsAt)
  const ms = end - now
  if (ms <= 0) return { active: false }
  return { active: true, daysLeft: Math.ceil(ms / 86400000), end }
}

// ---------- Калькулятор ----------
// Ступенчатая скидка за объём: первые 100 м² — полная ставка, 100–300 м² — 85%, свыше — 75%.
function effectiveArea(area) {
  const a1 = Math.min(area, 100)
  const a2 = Math.min(Math.max(area - 100, 0), 200)
  const a3 = Math.max(area - 300, 0)
  return a1 + a2 * 0.85 + a3 * 0.75
}

export function estimate({ object, service, area, dirt, urgency, applyOffer = true }) {
  const rate = RATES[object][service]
  const dk = DIRT_LEVELS.find((d) => d.id === dirt).k
  const uk = URGENCY.find((u) => u.id === urgency).k
  let total = effectiveArea(area) * rate * dk * uk
  let discount = 0
  const offer = offerState()
  if (applyOffer && offer.active && SEASON_OFFER.appliesTo.includes(service)) {
    discount = total * SEASON_OFFER.discount
    total -= discount
  }
  total = Math.max(MIN_ORDER, total)
  return {
    total,
    low: Math.max(MIN_ORDER, Math.round((total * 0.88) / 100) * 100),
    high: Math.round((total * 1.12) / 100) * 100,
    perM2: total / area,
    discount,
    minApplied: total === MIN_ORDER,
  }
}

export function priceCurve(params, maxArea = 500, step = 20) {
  const pts = []
  for (let a = 20; a <= maxArea; a += step) {
    const row = { area: a }
    for (const d of DIRT_LEVELS) row[d.id] = Math.round(estimate({ ...params, area: a, dirt: d.id }).total)
    pts.push(row)
  }
  return pts
}

// ---------- Телефон: маска +7 (XXX) XXX-XX-XX ----------
export function formatPhone(raw) {
  let d = raw.replace(/\D/g, '')
  if (d.startsWith('8')) d = '7' + d.slice(1)
  if (!d.startsWith('7')) d = '7' + d
  d = d.slice(0, 11)
  const p = d.slice(1)
  let out = '+7'
  if (p.length > 0) out += ' (' + p.slice(0, 3)
  if (p.length >= 3) out += ')'
  if (p.length > 3) out += ' ' + p.slice(3, 6)
  if (p.length > 6) out += '-' + p.slice(6, 8)
  if (p.length > 8) out += '-' + p.slice(8, 10)
  return out
}
export const phoneValid = (v) => v.replace(/\D/g, '').length === 11

// ---------- Гео: зона по координатам ----------
const R = 6371
const toRad = (x) => (x * Math.PI) / 180
const toDeg = (x) => (x * 180) / Math.PI

export function distanceKm([lat1, lon1], [lat2, lon2]) {
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}
export function bearingDeg([lat1, lon1], [lat2, lon2]) {
  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2))
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1))
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}
function inBearing(b, [from, to]) {
  if (from === 0 && to === 360) return true
  return from < to ? b >= from && b < to : b >= from || b < to
}
// Точка внутри многоугольника [[lat, lng], ...] (метод луча)
export function pointInPolygon([lat, lng], poly) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [yi, xi] = poly[i], [yj, xj] = poly[j]
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

// Входит ли точка в зону выезда: Санкт-Петербург (включая Кронштадт)
export const inServiceArea = (latlng) => pointInPolygon(latlng, SPB_BORDER) || distanceKm(KRONSTADT.at, latlng) < KRONSTADT.radiusKm

export function zoneAt(latlng) {
  if (!inServiceArea(latlng)) return null
  const dist = distanceKm(MAP_CENTER, latlng)
  const b = bearingDeg(MAP_CENTER, latlng)
  return ZONES.find((z) => dist >= z.ring[0] && dist < z.ring[1] && inBearing(b, z.bearing)) || ZONES.find((z) => z.id === 'prig')
}

// Точка на расстоянии d км по азимуту b от центра
export function destination([lat, lon], dKm, bDeg) {
  const δ = dKm / R, θ = toRad(bDeg), φ1 = toRad(lat), λ1 = toRad(lon)
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ))
  const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2))
  return [toDeg(φ2), toDeg(λ2)]
}

// Полигон сектора кольца (для отрисовки зоны)
export function sectorPolygon(zone) {
  const [r1, r2] = zone.ring
  let [b1, b2] = zone.bearing
  if (b2 <= b1) b2 += 360
  const pts = []
  for (let b = b1; b <= b2; b += 3) pts.push(destination(MAP_CENTER, r2, b))
  pts.push(destination(MAP_CENTER, r2, b2))
  if (r1 > 0) {
    for (let b = b2; b >= b1; b -= 3) pts.push(destination(MAP_CENTER, r1, b))
    pts.push(destination(MAP_CENTER, r1, b1))
  } else {
    pts.push(MAP_CENTER)
  }
  return pts
}
export function ringPolygon(zone) {
  const outer = [], inner = []
  for (let b = 0; b < 360; b += 4) outer.push(destination(MAP_CENTER, zone.ring[1], b))
  if (zone.ring[0] > 0) for (let b = 360; b > 0; b -= 4) inner.push(destination(MAP_CENTER, zone.ring[0], b))
  return inner.length ? [outer, inner] : outer
}
export function zoneLabelPoint(zone) {
  const [r1, r2] = zone.ring
  if (zone.bearing[0] === 0 && zone.bearing[1] === 360) return r1 === 0 ? MAP_CENTER : destination(MAP_CENTER, (r1 + r2) / 2, 135)
  let [b1, b2] = zone.bearing
  if (b2 <= b1) b2 += 360
  return destination(MAP_CENTER, (r1 + r2) / 2 + 1.5, (b1 + b2) / 2)
}

// Поиск адреса в мини-справочнике (имитация геокодера)
export function geocodeMock(query) {
  const q = query.trim().toLowerCase()
  if (q.length < 3) return { error: 'Введите хотя бы 3 символа: улицу, метро или город.' }
  for (const p of PLACES) {
    if (p.q.some((k) => q.includes(k) || k.includes(q))) return { at: p.at, label: p.name }
  }
  return { error: 'Не нашли такой адрес в демо-справочнике. Попробуйте станцию метро (например, «Купчино») или пригород (например, «Пушкин») или оставьте заявку — уточним по телефону.' }
}

// ---------- Слоты оценщика (детерминированные mock-данные) ----------
function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) }
  return (h >>> 0) / 4294967295
}

export const firstFreeDay = (days) => Math.max(0, days.findIndex((d) => d.slots.some((s) => s.free)))
export const freeTodayTotal = () => ZONES.reduce((a, z) => a + slotsFor(z.id, 1)[0].slots.filter((s) => s.free).length, 0)
export const bestZoneToday = () => ZONES.find((z) => slotsFor(z.id, 1)[0].slots.some((s) => s.free))?.id || 'center'

export function slotsFor(zoneId, days = 4, now = new Date()) {
  const zone = ZONES.find((z) => z.id === zoneId)
  const res = []
  for (let i = 0; i < days; i++) {
    const day = new Date(now)
    day.setHours(0, 0, 0, 0)
    day.setDate(day.getDate() + i)
    const key = day.toISOString().slice(0, 10)
    let slots = TIME_SLOTS.map((t) => {
      const startHour = parseInt(t, 10)
      const past = i === 0 && startHour <= now.getHours() + 1
      const taken = hash(zoneId + key + t) < (i === 0 ? 0.55 : 0.35)
      return { time: t, free: !past && !taken }
    })
    if (zone && i === 0) {
      // На сегодня показываем ровно столько свободных слотов, сколько указано в данных зоны
      let left = zone.slotsToday
      slots = slots.map((s) => {
        if (s.free && left > 0) { left--; return s }
        return { ...s, free: false }
      })
    }
    if (zone && !zone.free && i === 0) slots = slots.map((s) => ({ ...s, free: false }))
    res.push({
      date: key,
      label: i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : day.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' }),
      slots,
    })
  }
  return res
}
