import { useState, useEffect } from 'react'

export function useNotes() {
  // Load from localStorage on mount
  const [markedDays, setMarkedDays] = useState(() => {
    const saved = localStorage.getItem('calendar-marked')
    return saved ? JSON.parse(saved) : {}
  })

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('calendar-notes')
    return saved ? JSON.parse(saved) : {}
  })

  // Persist on every change
  useEffect(() => {
    localStorage.setItem('calendar-marked', JSON.stringify(markedDays))
  }, [markedDays])

  useEffect(() => {
    localStorage.setItem('calendar-notes', JSON.stringify(notes))
  }, [notes])

  const toggleMark = (dateKey, type = 'important') => {
    setMarkedDays(prev =>
      prev[dateKey] ? { ...prev, [dateKey]: undefined } : { ...prev, [dateKey]: type }
    )
  }

  const setNote = (dateKey, text) => {
    setNotes(prev => ({ ...prev, [dateKey]: text }))
  }

  const deleteNote = (dateKey) => {
    setNotes(prev => { const n = { ...prev }; delete n[dateKey]; return n })
  }

  return { markedDays, notes, toggleMark, setNote, deleteNote }
}
