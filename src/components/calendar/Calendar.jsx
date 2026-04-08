import { useState } from 'react'
import { useCalendar } from '../../hooks/useCalendar'
import { useNotes } from '../../hooks/useNotes'
import { useNamedSelections } from '../../hooks/useNamedSelections'
import { format } from 'date-fns'
import './Calendar.css'

const defaultTokens = {
  calendarBg: 'rgba(26, 33, 44, 0.85)',
  calendarText: '#ebf2fb',
  calendarAccent: '#8ec9ff',
  calendarHighlight: '#527bb4',
  calendarSelected: 'rgba(82, 123, 180, 0.6)',
  calendarRange: 'rgba(142, 201, 255, 0.25)',
  cardBorder: 'rgba(226, 239, 255, 0.18)',
}

export default function Calendar({ tokens }) {
  const mergedTokens = { ...defaultTokens, ...tokens }
  const { currentDate, monthGrid, monthLabel, goNext, goPrev } = useCalendar()
  const { markedDays, notes, toggleMark, setNote, deleteNote } = useNotes()
  const {
    selections,
    isSelectionMode,
    tempSelection,
    setIsSelectionMode,
    addSelection,
    removeSelection,
    toggleDateInTemp,
    clearTempSelection,
    isDateSelected,
  } = useNamedSelections()

  const [selectedDay, setSelectedDay] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectionName, setSelectionName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const handleDayClick = (day) => {
    if (isSelectionMode) {
      toggleDateInTemp(day.date)
    } else {
      setSelectedDay(day)
      setModalOpen(true)
    }
  }

  const handleSaveSelection = () => {
    if (addSelection(selectionName, tempSelection)) {
      setSelectionName('')
      setShowSaveDialog(false)
      clearTempSelection()
    }
  }

  const getSelectionForDate = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    return selections.find(s => s.dates.includes(dateKey))
  }

  const getDayClass = (day, isSelected) => {
    let classes = ['calendar-day']
    if (!day.isCurrentMonth) classes.push('faded')
    if (day.isToday) classes.push('today')
    if (isSelected) classes.push('selected')
    if (getSelectionForDate(day.date)) classes.push('in-selection')
    return classes.join(' ')
  }

  return (
    <div className="calendar-container" style={{ '--cal-bg': mergedTokens.calendarBg, '--cal-text': mergedTokens.calendarText, '--cal-accent': mergedTokens.calendarAccent, '--cal-highlight': mergedTokens.calendarHighlight, '--cal-selected': mergedTokens.calendarSelected, '--cal-range': mergedTokens.calendarRange, '--cal-border': mergedTokens.cardBorder }}>
      <div className="calendar-header">
        <div className="month-label">{monthLabel}</div>
        <div className="nav-buttons">
          <button className="nav-btn" onClick={goPrev}>‹</button>
          <button className="nav-btn" onClick={goNext}>›</button>
        </div>
        <button 
          className={`select-mode-btn ${isSelectionMode ? 'active' : ''}`}
          onClick={() => {
            if (isSelectionMode && tempSelection.length > 0) {
              setShowSaveDialog(true)
            } else {
              setIsSelectionMode(!isSelectionMode)
              if (isSelectionMode) clearTempSelection()
            }
          }}
        >
          {isSelectionMode 
            ? `${tempSelection.length} selected` 
            : 'Select Dates'}
        </button>
      </div>

      <div className="calendar-body">
        <div className="calendar-section">
          <div className="week-days">
            {weekDays.map(day => (
              <div key={day} className="week-day">{day}</div>
            ))}
          </div>

          <div className="date-grid">
            {monthGrid.map((day) => {
              const dateKey = format(day.date, 'yyyy-MM-dd')
              const isMarked = markedDays[dateKey]
              const note = notes[dateKey]
              const isSelected = isDateSelected(day.date)
              const selection = getSelectionForDate(day.date)

              return (
                <div
                  key={day.key}
                  className={getDayClass(day, isSelected)}
                  onClick={() => handleDayClick(day)}
                >
                  <span className="day-number">{format(day.date, 'd')}</span>
                  {isMarked && <span className="marker" />}
                  {note && <span className="marker note-marker" />}
                  {selection && <span className="selection-indicator" />}
                </div>
              )
            })}
          </div>
        </div>

        <div className="side-panel">
          <div className="side-panel-title">Saved Selections</div>
          {selections.length === 0 ? (
            <div className="no-selections">No selections yet</div>
          ) : (
            selections.map(sel => (
              <div key={sel.id} className="selection-item">
                <div className="selection-name">{sel.name}</div>
                <div className="selection-count">{sel.dates.length} dates</div>
                <button className="delete-btn" onClick={() => removeSelection(sel.id)}>
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {showSaveDialog && (
        <div className="save-dialog">
          <input
            className="save-input"
            placeholder="Selection name..."
            value={selectionName}
            onChange={(e) => setSelectionName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveSelection()}
            autoFocus
          />
          <button className="save-btn primary" onClick={handleSaveSelection}>
            Save
          </button>
          <button className="save-btn" onClick={() => {
            setShowSaveDialog(false)
            clearTempSelection()
          }}>
            Cancel
          </button>
        </div>
      )}

      {modalOpen && selectedDay && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">
              {format(selectedDay.date, 'EEEE, MMMM d, yyyy')}
            </div>
            <div className="mark-section">
              <label className="section-label">Mark as</label>
              <div className="mark-buttons">
                <button
                  className={`mark-btn ${markedDays[format(selectedDay.date, 'yyyy-MM-dd')] === 'important' ? 'active' : ''}`}
                  onClick={() => toggleMark(format(selectedDay.date, 'yyyy-MM-dd'), 'important')}
                >
                  Important
                </button>
                <button
                  className={`mark-btn ${markedDays[format(selectedDay.date, 'yyyy-MM-dd')] === 'special' ? 'active' : ''}`}
                  onClick={() => toggleMark(format(selectedDay.date, 'yyyy-MM-dd'), 'special')}
                >
                  Special
                </button>
              </div>
            </div>
            <div className="note-section">
              <label className="section-label">Note</label>
              <textarea
                className="note-input"
                placeholder="Add a note..."
                value={notes[format(selectedDay.date, 'yyyy-MM-dd')] || ''}
                onChange={(e) => setNote(format(selectedDay.date, 'yyyy-MM-dd'), e.target.value)}
              />
            </div>
            <div className="modal-buttons">
              {notes[format(selectedDay.date, 'yyyy-MM-dd')] && (
                <button
                  className="delete-note-btn"
                  onClick={() => {
                    deleteNote(format(selectedDay.date, 'yyyy-MM-dd'))
                    setModalOpen(false)
                  }}
                >
                  Delete Note
                </button>
              )}
              <button className="done-btn" onClick={() => setModalOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
