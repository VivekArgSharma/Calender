import { useState, useEffect } from 'react'

const STORAGE_KEY = 'calendar-named-selections'

export function useNamedSelections() {
  const [selections, setSelections] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [tempSelection, setTempSelection] = useState([])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selections))
  }, [selections])

  const addSelection = (name, dates) => {
    if (!name.trim() || dates.length === 0) return false
    setSelections(prev => [...prev, { id: Date.now(), name: name.trim(), dates }])
    setTempSelection([])
    return true
  }

  const removeSelection = (id) => {
    setSelections(prev => prev.filter(s => s.id !== id))
  }

  const toggleDateInTemp = (date) => {
    setTempSelection(prev => {
      const key = date.toISOString().split('T')[0]
      if (prev.some(d => d.toISOString().split('T')[0] === key)) {
        return prev.filter(d => d.toISOString().split('T')[0] !== key)
      }
      return [...prev, date]
    })
  }

  const clearTempSelection = () => {
    setTempSelection([])
    setIsSelectionMode(false)
  }

  const isDateSelected = (date) => {
    const key = date.toISOString().split('T')[0]
    return tempSelection.some(d => d.toISOString().split('T')[0] === key)
  }

  return {
    selections,
    isSelectionMode,
    tempSelection,
    setIsSelectionMode,
    addSelection,
    removeSelection,
    toggleDateInTemp,
    clearTempSelection,
    isDateSelected,
  }
}
