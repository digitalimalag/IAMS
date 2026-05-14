import { format, isValid } from 'date-fns'

export function formatDateYMD(value: string | number | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  if (!isValid(date)) return '-'
  return format(date, 'yyyy-MM-dd')
}

export function formatTimeHHmm(value: string | number | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  if (!isValid(date)) return '-'
  return format(date, 'HH:mm')
}
