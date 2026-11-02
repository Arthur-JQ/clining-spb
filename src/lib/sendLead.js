import { LEADS_CONFIG } from '../config.js'

// Собирает заявку в читаемый вид: [['Поле', 'значение'], ...]
export function leadRows(lead) {
  return lead.filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
}

async function sendEmail(rows, subject) {
  const body = { _subject: subject, _template: 'table', _captcha: 'false' }
  rows.forEach(([k, v]) => { body[k] = String(v) })
  const res = await fetch(`https://formsubmit.co/ajax/${LEADS_CONFIG.email}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || String(data.success) !== 'true') throw new Error(data.message || `email ${res.status}`)
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

async function sendTelegram(rows, subject) {
  const { telegramBotToken: token, telegramChatId: chat } = LEADS_CONFIG
  const text = `<b>${esc(subject)}</b>\n\n` + rows.map(([k, v]) => `<b>${esc(k)}:</b> ${esc(v)}`).join('\n')
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chat, text, parse_mode: 'HTML', disable_web_page_preview: true }),
  })
  const data = await res.json().catch(() => ({}))
  if (!data.ok) throw new Error(data.description || `telegram ${res.status}`)
}

// Отправляет заявку во все настроенные каналы. Успех, если дошла хотя бы в один.
export async function sendLead(rows, subject = 'Новая заявка с сайта') {
  const jobs = []
  if (LEADS_CONFIG.telegramBotToken && LEADS_CONFIG.telegramChatId) jobs.push(sendTelegram(rows, subject))
  if (LEADS_CONFIG.email) jobs.push(sendEmail(rows, subject))
  if (!jobs.length) throw new Error('Не настроен ни один канал для заявок (src/config.js)')
  const results = await Promise.allSettled(jobs)
  results.filter((r) => r.status === 'rejected').forEach((r) => console.warn('[заявка]', r.reason))
  if (!results.some((r) => r.status === 'fulfilled')) throw new Error('Заявка не отправлена ни в один канал')
}
