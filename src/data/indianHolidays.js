export const indianHolidays2026 = {
  1: [
    { date: 14, name: 'Makar Sankranti', type: 'national' },
    { date: 23, name: 'Parakram Diwas', type: 'national' },
    { date: 26, name: 'Republic Day', type: 'national' },
  ],
  2: [
    { date: 15, name: 'Maha Shivaratri', type: 'festival' },
  ],
  3: [
    { date: 3, name: 'Holi', type: 'festival' },
    { date: 31, name: 'Mahavir Jayanti', type: 'festival' },
  ],
  4: [
    { date: 14, name: 'Baisakhi / Puthandu', type: 'festival' },
    { date: 19, name: 'Akshaya Tritiya', type: 'festival' },
  ],
  5: [
    { date: 1, name: 'Buddha Purnima', type: 'festival' },
  ],
  6: [],
  7: [
    { date: 29, name: 'Guru Purnima', type: 'festival' },
  ],
  8: [
    { date: 15, name: 'Independence Day', type: 'national' },
  ],
  9: [
    { date: 14, name: 'Hindi Diwas', type: 'national' },
  ],
  10: [
    { date: 2, name: 'Gandhi Jayanti', type: 'national' },
    { date: 11, name: 'Navratri', type: 'festival' },
    { date: 20, name: 'Durga Ashtami', type: 'festival' },
    { date: 24, name: 'Dussehra', type: 'festival' },
  ],
  11: [
    { date: 9, name: 'Diwali', type: 'festival' },
    { date: 14, name: "Children's Day", type: 'national' },
    { date: 24, name: 'Guru Nanak Jayanti', type: 'festival' },
  ],
  12: [
    { date: 25, name: 'Christmas', type: 'national' },
  ],
}

export function isSunday(date) {
  return date.getDay() === 0
}

export function isHoliday(date, holidays = indianHolidays2026) {
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  const monthHolidays = holidays[month] || []
  return monthHolidays.find(h => h.date === day)
}

export function getHolidaysForMonth(month, year, holidays = indianHolidays2026) {
  const monthHolidays = holidays[month] || []
  return monthHolidays.map(h => ({
    ...h,
    date: new Date(year, month - 1, h.date),
  }))
}

export function getAllHolidaysText(holidays = indianHolidays2026) {
  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const text = []
  
  for (const [month, monthHolidays] of Object.entries(holidays)) {
    for (const holiday of monthHolidays) {
      text.push(`${monthNames[parseInt(month)]} ${holiday.date}: ${holiday.name}`)
    }
  }
  
  return text
}
