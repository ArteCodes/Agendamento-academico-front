/**
 * Utilitários de data compartilhados.
 *
 * As datas do backend chegam como 'YYYY-MM-DD'. Para evitar deslocamento de
 * fuso, sempre construímos a Date com ano/mês/dia locais.
 */

export function parseDateLocal(dateStr) {
  if (!dateStr) return null
  const partes = String(dateStr).split('-')
  if (partes.length !== 3) return null
  const [ano, mes, dia] = partes.map(Number)
  if (!ano || !mes || !dia) return null
  return new Date(ano, mes - 1, dia)
}

export function hojeLocal() {
  const agora = new Date()
  return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
}

export function isDateBeforeToday(dateStr) {
  const data = parseDateLocal(dateStr)
  if (!data) return false
  return data.getTime() < hojeLocal().getTime()
}

export function isDateTodayOrFuture(dateStr) {
  return !isDateBeforeToday(dateStr)
}

export function filtrarAgendamentosFuturosOuHoje(agendamentos) {
  if (!Array.isArray(agendamentos)) return []
  return agendamentos.filter((a) => isDateTodayOrFuture(a.data))
}
