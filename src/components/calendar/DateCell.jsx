import { motion } from 'framer-motion'

export default function DateCell({
  date, dateKey, isCurrentMonth, isToday,
  isStart, isEnd, isInRange,
  markType, hasNote,
  onClick, onHover, onRightClick
}) {
  return (
    <motion.div
      className={`date-cell
        ${!isCurrentMonth ? 'faded' : ''}
        ${isToday ? 'today' : ''}
        ${isStart ? 'range-start' : ''}
        ${isEnd ? 'range-end' : ''}
        ${isInRange ? 'in-range' : ''}
      `}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      onClick={onClick}
      onMouseEnter={onHover}
      onContextMenu={onRightClick}
    >
      <span className="date-number">{date.getDate()}</span>

      {/* Indicator dots */}
      <div className="dots">
        {markType && <span className={`dot dot-${markType}`} />}
        {hasNote && <span className="dot dot-note" />}
      </div>
    </motion.div>
  )
}
