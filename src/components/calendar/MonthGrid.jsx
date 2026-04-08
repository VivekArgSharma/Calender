import { motion, AnimatePresence } from 'framer-motion'
import DateCell from './DateCell'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function MonthGrid({ monthGrid, rangeProps, noteProps, tokens = {} }) {
  return (
    <div style={{ '--accent': tokens.accent, '--font': tokens.font }}>

      {/* Day headers */}
      <div className="day-headers">
        {DAYS.map(d => <span key={d}>{d}</span>)}
      </div>

      {/* Date cells */}
      <AnimatePresence mode="wait">
        <motion.div
          key={monthGrid[15]?.key} // mid-month key forces re-render on month change
          className="date-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {monthGrid.map(({ date, isCurrentMonth, isToday, key }) => (
            <DateCell
              key={key}
              date={date}
              dateKey={key}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday}
              isStart={rangeProps.isStart(date)}
              isEnd={rangeProps.isEnd(date)}
              isInRange={rangeProps.isInRange(date)}
              markType={noteProps.markedDays[key]}
              hasNote={!!noteProps.notes[key]}
              onClick={() => rangeProps.handleDateClick(date)}
              onHover={() => rangeProps.handleDateHover(date)}
              onRightClick={(e) => {
                e.preventDefault()
                noteProps.toggleMark(key)
              }}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
