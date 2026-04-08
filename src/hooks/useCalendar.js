import { useState } from 'react'
import {
  startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isSameDay,
  addMonths, subMonths, format
} from 'date-fns'

export function useCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Full 6-week grid including leading/trailing days from adjacent months
  const getMonthGrid = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday start
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    return eachDayOfInterval({ start: gridStart, end: gridEnd }).map(date => ({
      date,
      isCurrentMonth: isSameMonth(date, currentDate),
      isToday: isSameDay(date, new Date()),
      key: format(date, 'yyyy-MM-dd')
    }))
  }

  const goNext = () => setCurrentDate(prev => addMonths(prev, 1))
  const goPrev = () => setCurrentDate(prev => subMonths(prev, 1))

  return {
    currentDate,
    monthGrid: getMonthGrid(),
    monthLabel: format(currentDate, 'MMMM yyyy'),
    goNext,
    goPrev
  }
}
