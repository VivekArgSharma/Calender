import { useState } from 'react'
import { isWithinInterval, isBefore, isSameDay } from 'date-fns'

export function useRangeSelect() {
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [hoverDate, setHoverDate] = useState(null)

  const handleDateClick = (date) => {
    if (!startDate || (startDate && endDate)) {
      // Start fresh selection
      setStartDate(date)
      setEndDate(null)
    } else {
      // Second click — set end, ensure order
      if (isBefore(date, startDate)) {
        setEndDate(startDate)
        setStartDate(date)
      } else {
        setEndDate(date)
      }
    }
  }

  const isInRange = (date) => {
    const end = endDate || hoverDate
    if (!startDate || !end) return false
    const [from, to] = isBefore(startDate, end)
      ? [startDate, end]
      : [end, startDate]
    return isWithinInterval(date, { start: from, end: to })
  }

  const isStart = (date) => startDate && isSameDay(date, startDate)
  const isEnd = (date) => endDate && isSameDay(date, endDate)

  return {
    startDate, endDate,
    handleDateClick,
    handleDateHover: setHoverDate,
    isInRange, isStart, isEnd
  }
}
