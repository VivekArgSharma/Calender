import { useRef, useMemo, useState, useCallback, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
  startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isSameDay,
  addMonths, subMonths, format, isToday
} from 'date-fns'

const CALENDAR_WIDTH = 3.2
const CALENDAR_HEIGHT = 4.2
const SEGMENTS_X = 40
const SEGMENTS_Y = 40

const STORAGE_KEY = 'calendar-events'

function getEvents() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
}

function createCalendarTexture(date, tokens, activeDay, eventsArr) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1312
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = tokens.calendarBg || '#1a212c'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.strokeStyle = tokens.cardBorder || 'rgba(226, 239, 255, 0.18)'
  ctx.lineWidth = 4
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40)

  ctx.fillStyle = tokens.calendarAccent || '#8ec9ff'
  ctx.fillRect(0, 0, canvas.width, 120)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 48px Manrope, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(format(date, 'MMMM yyyy'), canvas.width / 2, 60)

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  ctx.fillStyle = tokens.calendarText || '#ebf2fb'
  ctx.globalAlpha = 0.6
  ctx.font = 'bold 24px Manrope, sans-serif'
  const colWidth = canvas.width / 7
  weekDays.forEach((day, i) => {
    ctx.fillText(day, colWidth * i + colWidth / 2, 160)
  })
  ctx.globalAlpha = 1

  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const rowHeight = (canvas.height - 200) / 6
  const today = new Date()
  const accent = tokens.calendarAccent || '#8ec9ff'
  const textColor = tokens.calendarText || '#ebf2fb'

  days.forEach((day, index) => {
    const col = index % 7
    const row = Math.floor(index / 7)
    const x = col * colWidth + colWidth / 2
    const y = 200 + row * rowHeight + rowHeight / 2

    const isCurrentMonth = isSameMonth(day, date)
    const isTodayDate = isSameDay(day, today)
    const isActiveDay = activeDay === day.getDate() && isSameMonth(day, date)

    if (!isCurrentMonth) {
      ctx.globalAlpha = 0.3
    }

    if (isActiveDay) {
      ctx.fillStyle = accent
      ctx.beginPath()
      ctx.arc(x, y - 8, 30, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
    } else if (isTodayDate) {
      ctx.fillStyle = accent
      ctx.beginPath()
      ctx.arc(x, y - 8, 24, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
    } else {
      ctx.fillStyle = textColor
    }

    ctx.font = isActiveDay || isTodayDate ? 'bold 32px Manrope, sans-serif' : '28px Manrope, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(format(day, 'd'), x, y - 8)

    const dayEvents = eventsArr.filter(e => {
      const eventDate = new Date(e.year, e.month - 1, e.day)
      return isSameDay(eventDate, day)
    })
    if (dayEvents.length > 0) {
      ctx.fillStyle = isActiveDay ? '#ffffff' : accent
      ctx.beginPath()
      ctx.arc(x, y + 18, 6, 0, Math.PI * 2)
      ctx.fill()
      if (dayEvents.length > 1) {
        ctx.beginPath()
        ctx.arc(x - 10, y + 18, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(x + 10, y + 18, 4, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    ctx.globalAlpha = 1
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function CalendarPage({ texture, flipProgress, position = [0, 0, 0] }) {
  const meshRef = useRef()
  const geometryRef = useRef()

  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(CALENDAR_WIDTH, CALENDAR_HEIGHT, SEGMENTS_X, SEGMENTS_Y)
  }, [])

  useFrame(() => {
    if (!meshRef.current || !geometryRef.current) return

    const pos = geometryRef.current.attributes.position

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const normalizedX = (x / CALENDAR_WIDTH) + 0.5

      const curl = Math.sin(normalizedX * Math.PI) * flipProgress * 0.4
      const lift = Math.sin(normalizedX * Math.PI * flipProgress) * 0.2

      pos.setZ(i, curl)
      pos.setY(i, pos.getY(i) + lift * 0.05)
    }
    pos.needsUpdate = true
    geometryRef.current.computeVertexNormals()
  })

  return (
    <mesh ref={meshRef} geometry={geometry} position={position}>
      <meshStandardMaterial map={texture} side={THREE.DoubleSide} roughness={0.85} metalness={0.02} />
    </mesh>
  )
}

function getDayFromUV(uv, date) {
  if (!uv) return null

  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const colWidth = 1 / 7
  const rowHeight = (1312 - 200) / 1312

  const col = Math.floor(uv.x / colWidth)
  const row = Math.floor((uv.y - (200 / 1312)) / rowHeight)

  const index = row * 7 + col

  if (index >= 0 && index < days.length) {
    const day = days[index]
    const isCurrentMonth = isSameMonth(day, date)
    return {
      date: day,
      dayNum: day.getDate(),
      isCurrentMonth,
      isPrevMonth: !isCurrentMonth && day < monthStart,
      isNextMonth: !isCurrentMonth && day > monthEnd
    }
  }
  return null
}

export default function Calendar3D({ tokens }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeDay, setActiveDay] = useState(new Date().getDate())
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipProgress, setFlipProgress] = useState(0)
  const [eventsArr, setEventsArr] = useState(getEvents)
  const [hoveredDay, setHoveredDay] = useState(null)

  const calendarMeshRef = useRef()
  const { raycaster, camera } = useThree()

  useEffect(() => {
    saveEvents(eventsArr)
  }, [eventsArr])

  const calendarTexture = useMemo(() => {
    return createCalendarTexture(currentDate, tokens, activeDay, eventsArr)
  }, [currentDate, tokens, activeDay, eventsArr])

  const prevTexture = useMemo(() => {
    return createCalendarTexture(subMonths(currentDate, 1), tokens, 0, eventsArr)
  }, [currentDate, tokens, eventsArr])

  const handleFlip = useCallback((direction) => {
    if (isFlipping) return

    setIsFlipping(true)
    setFlipProgress(0)

    const startTime = Date.now()
    const duration = 800

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)

      setFlipProgress(eased)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCurrentDate(prev => direction > 0 ? addMonths(prev, 1) : subMonths(prev, 1))
        setFlipProgress(0)
        setIsFlipping(false)
      }
    }

    requestAnimationFrame(animate)
  }, [isFlipping])

  const handleCalendarClick = useCallback((e) => {
    e.stopPropagation()

    const uv = e.uv
    if (!uv) return

    const dayInfo = getDayFromUV(uv, currentDate)
    if (!dayInfo) return

    if (dayInfo.isPrevMonth) {
      handleFlip(-1)
      setTimeout(() => setActiveDay(dayInfo.dayNum), 100)
    } else if (dayInfo.isNextMonth) {
      handleFlip(1)
      setTimeout(() => setActiveDay(dayInfo.dayNum), 100)
    } else {
      setActiveDay(dayInfo.dayNum)
    }
  }, [currentDate, handleFlip])

  const handleCalendarHover = useCallback((e) => {
    e.stopPropagation()
    const uv = e.uv
    if (!uv) {
      setHoveredDay(null)
      return
    }

    const dayInfo = getDayFromUV(uv, currentDate)
    setHoveredDay(dayInfo)
  }, [currentDate])

  const activeDayEvents = useMemo(() => {
    return eventsArr.find(ev =>
      ev.day === activeDay &&
      ev.month === currentDate.getMonth() + 1 &&
      ev.year === currentDate.getFullYear()
    )
  }, [eventsArr, activeDay, currentDate])

  const selectedDate = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), activeDay)
  }, [currentDate, activeDay])

  return (
    <group position={[0, 3.18, 0.5]}>
      {/* Navigation buttons - visible with background */}
      {/* Right arrow button (next month) */}
      <group position={[CALENDAR_WIDTH / 2 + 0.65, 0, 1.2]}>
        <mesh
          onClick={() => handleFlip(1)}
          renderOrder={999}
        >
          <planeGeometry args={[0.7, 0.7]} />
          <meshStandardMaterial color={tokens.calendarAccent || '#4b78b6'} roughness={0.5} metalness={0.1} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        {/* Arrow shape */}
        <mesh position={[0, 0, 0.01]} renderOrder={1000}>
          <planeGeometry args={[0.35, 0.35]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        {/* Arrow triangle right */}
        <mesh position={[0.05, 0, 0.02]} rotation={[0, 0, -Math.PI / 2]} renderOrder={1001}>
          <planeGeometry args={[0.25, 0.25]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>

      {/* Left arrow button (prev month) */}
      <group position={[-CALENDAR_WIDTH / 2 - 0.65, 0, 1.2]}>
        <mesh
          onClick={() => handleFlip(-1)}
          renderOrder={999}
        >
          <planeGeometry args={[0.7, 0.7]} />
          <meshStandardMaterial color={tokens.calendarAccent || '#4b78b6'} roughness={0.5} metalness={0.1} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        {/* Arrow shape */}
        <mesh position={[0, 0, 0.01]} renderOrder={1000}>
          <planeGeometry args={[0.35, 0.35]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        {/* Arrow triangle left */}
        <mesh position={[-0.05, 0, 0.02]} rotation={[0, 0, Math.PI / 2]} renderOrder={1001}>
          <planeGeometry args={[0.25, 0.25]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>

      {/* Click areas for navigation */}
      <mesh
        position={[CALENDAR_WIDTH / 2, 0, 1.0]}
        onClick={() => handleFlip(1)}
        renderOrder={999}
      >
        <planeGeometry args={[CALENDAR_WIDTH / 2, CALENDAR_HEIGHT]} />
        <meshStandardMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <mesh
        position={[-CALENDAR_WIDTH / 2, 0, 1.0]}
        onClick={() => handleFlip(-1)}
        renderOrder={999}
      >
        <planeGeometry args={[CALENDAR_WIDTH / 2, CALENDAR_HEIGHT]} />
        <meshStandardMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Stack of remaining pages */}
      {[0, -0.005, -0.01].map((z, i) => (
        <mesh key={`stack-${i}`} position={[0, 0, z]} renderOrder={100}>
          <planeGeometry args={[CALENDAR_WIDTH, CALENDAR_HEIGHT]} />
          <meshStandardMaterial color={tokens.calendarBg || '#1a212c'} roughness={0.9} metalness={0.01} />
        </mesh>
      ))}

      {/* Current page with flip animation */}
      {isFlipping && (
        <CalendarPage
          texture={prevTexture}
          flipProgress={flipProgress}
          position={[0, 0, 0.05]}
        />
      )}

      {/* Main calendar page with click detection */}
      <mesh
        ref={calendarMeshRef}
        position={[0, 0, 0.02]}
        renderOrder={101}
        onClick={handleCalendarClick}
        onPointerMove={handleCalendarHover}
      >
        <planeGeometry args={[CALENDAR_WIDTH, CALENDAR_HEIGHT]} />
        <meshStandardMaterial map={calendarTexture} roughness={0.85} metalness={0.02} side={THREE.DoubleSide} />
      </mesh>

      {/* Page shadow */}
      <mesh position={[0, -CALENDAR_HEIGHT / 2 - 0.1, 1.0]}>
        <planeGeometry args={[CALENDAR_WIDTH * 0.8, 0.08]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.3} roughness={1} />
      </mesh>
    </group>
  )
}
