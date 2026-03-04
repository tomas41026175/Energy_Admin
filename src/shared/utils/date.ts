/**
 * 將 ISO 日期字串格式化為台灣時間（UTC+8）
 * 若只有日期（YYYY-MM-DD），不顯示時分
 */
export const formatDateUTC8 = (dateStr: string): string => {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
  return new Intl.DateTimeFormat('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(isDateOnly ? {} : { hour: '2-digit', minute: '2-digit' }),
  }).format(date)
}
