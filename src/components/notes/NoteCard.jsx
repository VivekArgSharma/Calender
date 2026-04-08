import { motion } from 'framer-motion'

export default function NoteCard({ dateKey, text, onDelete }) {
  return (
    <motion.div
      className="note-card"
      initial={{ opacity: 0, y: -20, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: Math.random() * 4 - 2 }} // slight random tilt
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      whileHover={{ scale: 1.04, rotate: 0 }}
    >
      <span className="note-date">{dateKey}</span>
      <p>{text}</p>
      <button onClick={onDelete}>×</button>
    </motion.div>
  )
}
