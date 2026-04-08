import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { format } from 'date-fns'
import NoteCard from './NoteCard'

export default function NotesPanel({ notes, setNote, deleteNote, selectedRange }) {
  const [draft, setDraft] = useState('')

  // Safe check for notes object
  const safeNotes = notes || {}
  const noteEntries = Object.entries(safeNotes)

  return (
    <div className="notes-panel">
      <h3>Notes</h3>

      {/* Add note input */}
      {selectedRange?.startDate && (
        <div className="note-input">
          <span className="note-date-label">
            {format(selectedRange.startDate, 'MMM d')}
          </span>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Add a note..."
          />
          <button onClick={() => {
            setNote(format(selectedRange.startDate, 'yyyy-MM-dd'), draft)
            setDraft('')
          }}>
            Save
          </button>
        </div>
      )}

      {/* Existing notes */}
      <AnimatePresence>
        {noteEntries.map(([dateKey, text]) => (
          <NoteCard
            key={dateKey}
            dateKey={dateKey}
            text={text}
            onDelete={() => deleteNote(dateKey)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
