import { useRef, useMemo, useState, useCallback, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import {
  startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, isAfter,
  addMonths, subMonths, format, isToday
} from 'date-fns'
import { indianHolidays2026, isSunday, isHoliday, getHolidaysForMonth } from '../../data/indianHolidays'

const CALENDAR_WIDTH = 3.2
const CALENDAR_HEIGHT = 4.2
const SEGMENTS_X = 32
const SEGMENTS_Y = 32

const STORAGE_KEY = 'calendar-events'
const ANNOTATIONS_KEY = 'calendar-annotations'

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

function getAnnotations() {
  try {
    const saved = localStorage.getItem(ANNOTATIONS_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function saveAnnotations(ann) {
  localStorage.setItem(ANNOTATIONS_KEY, JSON.stringify(ann))
}

function getHeroShape(ctx, width, height, themeId) {
  ctx.beginPath()
  
  const margin = 30
  const imageHeight = 500
  const vNotchWidth = 140
  const vNotchDepth = 70
  
  ctx.moveTo(margin, margin)
  ctx.lineTo(width - margin, margin)
  ctx.lineTo(width - margin, imageHeight - vNotchDepth)
  ctx.lineTo(width / 2 + vNotchWidth / 2, imageHeight - vNotchDepth)
  ctx.lineTo(width / 2, imageHeight)
  ctx.lineTo(width / 2 - vNotchWidth / 2, imageHeight - vNotchDepth)
  ctx.lineTo(margin, imageHeight - vNotchDepth)
  ctx.closePath()
  
  ctx.clip()
}

function drawHeroBorder(ctx, width, height, themeId) {
  const margin = 30
  const imageHeight = 500
  const vNotchWidth = 140
  const vNotchDepth = 70
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.lineWidth = 3
  
  ctx.beginPath()
  ctx.moveTo(margin, margin)
  ctx.lineTo(width - margin, margin)
  ctx.lineTo(width - margin, imageHeight - vNotchDepth)
  ctx.lineTo(width / 2 + vNotchWidth / 2, imageHeight - vNotchDepth)
  ctx.lineTo(width / 2, imageHeight)
  ctx.lineTo(width / 2 - vNotchWidth / 2, imageHeight - vNotchDepth)
  ctx.lineTo(margin, imageHeight - vNotchDepth)
  ctx.closePath()
  ctx.stroke()
}

function createCalendarTexture(date, tokens, activeDay, eventsArr, annotations, draftRangeStart, heroImage, hoveredDay) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1312
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = tokens.calendarBg || '#1a212c'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  if (heroImage) {
    ctx.save()
    getHeroShape(ctx, canvas.width, canvas.height, tokens.id)
    ctx.drawImage(heroImage, 0, 0, canvas.width, 500)
    ctx.restore()
    ctx.save()
    getHeroShape(ctx, canvas.width, canvas.height, tokens.id)
    drawHeroBorder(ctx, canvas.width, canvas.height, tokens.id)
    ctx.restore()
  } else {
    ctx.fillStyle = tokens.calendarAccent || '#8ec9ff'
    ctx.fillRect(0, 0, canvas.width, 500)
  }

  ctx.strokeStyle = tokens.cardBorder || 'rgba(226, 239, 255, 0.18)'
  ctx.lineWidth = 4
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40)

  ctx.fillStyle = tokens.calendarText || '#ebf2fb'
  ctx.font = 'bold 48px Manrope, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(format(date, 'MMMM yyyy'), canvas.width / 2, 560)

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  ctx.globalAlpha = 0.6
  ctx.font = 'bold 24px Manrope, sans-serif'
  const colWidth = canvas.width / 7
  weekDays.forEach((day, i) => {
    ctx.fillText(day, colWidth * i + colWidth / 2, 630)
  })
  ctx.globalAlpha = 1

  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const yStart = 660
  const rowHeight = (canvas.height - yStart) / 6
  const today = new Date()
  const accent = tokens.calendarAccent || '#8ec9ff'
  const textColor = tokens.calendarText || '#ebf2fb'
  const holidayColor = '#ff4444'
  const currentMonthNum = date.getMonth() + 1

  days.forEach((day, index) => {
    const col = index % 7
    const row = Math.floor(index / 7)
    const x = col * colWidth + colWidth / 2
    const y = yStart + row * rowHeight + rowHeight / 2

    const isCurrentMonth = isSameMonth(day, date)
    const isTodayDate = isSameDay(day, today)
    const isActiveDay = activeDay === day.getDate() && isSameMonth(day, date)
    const isSundayDate = isSunday(day)
    const holidayInfo = isHoliday(day, indianHolidays2026)
    const isHolidayDate = !!holidayInfo
    const isHovered = hoveredDay && isSameDay(day, hoveredDay.date) && isSameMonth(day, date)

    if (!isCurrentMonth) {
      ctx.globalAlpha = 0.3
    }

    const dateStr = format(day, 'yyyy-MM-dd')
    const dayDate = new Date(dateStr)

    let isSelectedRange = false
    let isRangeInterval = false
    let isSingleCircle = false

    annotations.forEach(ann => {
      const annStart = new Date(ann.start)
      if (ann.type === 'single') {
        if (isSameDay(dayDate, annStart)) isSingleCircle = true
      } else if (ann.type === 'range') {
        const annEnd = new Date(ann.end)
        const minDate = isAfter(annStart, annEnd) ? annEnd : annStart
        const maxDate = isAfter(annStart, annEnd) ? annStart : annEnd
        
        if (isSameDay(dayDate, minDate) || isSameDay(dayDate, maxDate)) {
          isSelectedRange = true
        }
        if (dayDate > minDate && dayDate < maxDate) {
          isRangeInterval = true
        }
      }
    })

    if (draftRangeStart && isSameDay(dayDate, new Date(draftRangeStart))) {
      isSelectedRange = true
    }

    if (isRangeInterval) {
      ctx.fillStyle = tokens.calendarRange || 'rgba(142, 201, 255, 0.25)'
      ctx.fillRect(x - colWidth / 2, y - rowHeight / 2, colWidth, rowHeight)
    }

    if (isHovered && !isActiveDay && !isSelectedRange && !isRangeInterval && !isTodayDate) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
      ctx.beginPath()
      ctx.arc(x, y - 8, 22, 0, Math.PI * 2)
      ctx.fill()
    }

    if (isSelectedRange) {
      ctx.fillStyle = tokens.calendarSelected || 'rgba(82, 123, 180, 0.8)'
      ctx.beginPath()
      ctx.arc(x, y - 8, 30, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
    } else if (isActiveDay && !isSelectedRange && !isRangeInterval) {
      ctx.fillStyle = accent
      ctx.beginPath()
      ctx.arc(x, y - 8, 30, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
    } else if (isTodayDate && !isSelectedRange && !isRangeInterval) {
      ctx.fillStyle = accent
      ctx.beginPath()
      ctx.arc(x, y - 8, 24, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
    } else if (isSundayDate || isHolidayDate) {
      ctx.fillStyle = holidayColor
    } else {
      ctx.fillStyle = textColor
    }

    ctx.font = isActiveDay || isTodayDate || isSelectedRange ? 'bold 32px Manrope, sans-serif' : '28px Manrope, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(format(day, 'd'), x, y - 8)

    if (isSundayDate || isHolidayDate) {
      ctx.font = isActiveDay || isTodayDate || isSelectedRange ? 'bold 20px Manrope, sans-serif' : '18px Manrope, sans-serif'
      ctx.fillText(isHolidayDate ? '★' : '', x, y + 18)
    }

    if (isSingleCircle) {
      ctx.strokeStyle = '#ff3b3b' // Red pen color
      ctx.lineWidth = 3
      ctx.beginPath()
      // Draw standard arc that looks like a quickly drawn red circle
      ctx.arc(x, y - 8, 32, 0, Math.PI * 2)
      ctx.stroke()
    }

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

function createPageFlipGeometry(width, height, segmentsX, segmentsY) {
  const geometry = new THREE.PlaneGeometry(width, height, segmentsX, segmentsY)
  const originalPositions = geometry.attributes.position.array.slice()
  geometry.userData.originalPositions = originalPositions
  return geometry
}

function CalendarPage({ frontTexture, backTexture, flipProgress, position = [0, 0, 0], direction = 1, isMobile = false }) {
  const meshRef = useRef()
  const groupRef = useRef()
  
  const geometry = useMemo(() => {
    return createPageFlipGeometry(
      CALENDAR_WIDTH,
      CALENDAR_HEIGHT,
      isMobile ? 16 : SEGMENTS_X,
      isMobile ? 16 : SEGMENTS_Y,
    )
  }, [isMobile])

  useFrame(() => {
    if (!meshRef.current || !geometry.userData.originalPositions) return
    
    const pos = geometry.attributes.position
    const original = geometry.userData.originalPositions
    
    const t = flipProgress
    
    for (let i = 0; i < pos.count; i++) {
      const ox = original[i * 3]
      const oy = original[i * 3 + 1]
      const oz = original[i * 3 + 2]
      
      const normalizedX = (ox / (CALENDAR_WIDTH / 2) + 1) / 2
      
      let px = ox, py = oy, pz = oz
      
      if (direction > 0) {
        if (t > 0) {
          const curlStart = t * 0.5
          
          if (normalizedX > curlStart) {
            const curlFactor = (normalizedX - curlStart) / (1 - curlStart)
            const angle = curlFactor * Math.PI * (1 - t * 0.5)
            
            const curlAmount = Math.sin(angle) * 0.6
            px = ox - curlAmount * 1.8 - (normalizedX - curlStart) * t * 0.8
            pz = oz + curlAmount * 0.6 + t * 0.4
            py = oy + Math.abs(Math.cos(angle)) * 0.4 * t + normalizedX * t * 0.3
          } else {
            px = ox - t * 0.3
            pz = oz + t * 0.3
            py = oy + t * 0.15
          }
        }
      } else {
        if (t > 0) {
          const curlStart = 1 - t * 0.5
          
          if (normalizedX < curlStart) {
            const curlFactor = (curlStart - normalizedX) / curlStart
            const angle = curlFactor * Math.PI * (1 - t * 0.5)
            
            const curlAmount = Math.sin(angle) * 0.6
            px = ox + curlAmount * 1.8 + (curlStart - normalizedX) * t * 0.8
            pz = oz + curlAmount * 0.6 + t * 0.4
            py = oy + Math.abs(Math.cos(angle)) * 0.4 * t + (1 - normalizedX) * t * 0.3
          } else {
            px = ox + t * 0.3
            pz = oz + t * 0.3
            py = oy + t * 0.15
          }
        }
      }
      
      pos.setXYZ(i, px, py, pz)
    }
    
    pos.needsUpdate = true
    geometry.computeVertexNormals()
  })

  const groupRotation = direction > 0 ? [0, 0, 0] : [0, Math.PI, 0]
  
  return (
    <group ref={groupRef} position={position} rotation={groupRotation}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial 
          map={direction > 0 ? frontTexture : backTexture} 
          side={THREE.DoubleSide} 
          roughness={0.85} 
          metalness={0.02}
          transparent
          opacity={1 - flipProgress}
        />
      </mesh>
    </group>
  )
}

function getDayFromUV(uv, date) {
  if (!uv) return null

  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const pxX = uv.x * 1024
  const pxY = (1 - uv.y) * 1312

  const yStart = 660
  if (pxY < yStart || pxY > 1312) return null

  const rowHeight = (1312 - yStart) / 6
  const colWidth = 1024 / 7

  const col = Math.floor(pxX / colWidth)
  const row = Math.floor((pxY - yStart) / rowHeight)

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

function getGridPosFromDate(date, currentDate) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const index = days.findIndex(d => isSameDay(d, date))
  if (index === -1) return null

  const col = index % 7
  const row = Math.floor(index / 7)

  const colWidth = 1024 / 7
  const yStart = 660
  const rowHeight = (1312 - 660) / 6

  const x = -CALENDAR_WIDTH / 2 + (col * colWidth + colWidth / 2) / 1024 * CALENDAR_WIDTH
  const y = (CALENDAR_HEIGHT / 2) - (yStart + row * rowHeight + rowHeight / 2) / 1312 * CALENDAR_HEIGHT

  return new THREE.Vector3(x, y, 0.05)
}

function CartoonyArrow({ startVec, endVec, color }) {
  const curve = useMemo(() => {
    if (!startVec || !endVec) return null
    const mid = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5)
    mid.z += 0.8
    mid.y += 0.5
    return new THREE.QuadraticBezierCurve3(startVec, mid, endVec)
  }, [startVec, endVec])

  const tubeGeo = useMemo(() => {
    if (!curve) return null
    return new THREE.TubeGeometry(curve, 20, 0.03, 8, false)
  }, [curve])

  const meshRef = useRef()
  useFrame(() => {
    if (meshRef.current && curve) {
      const point = curve.getPoint(1)
      const tangent = curve.getTangent(1).normalize()
      meshRef.current.position.copy(point)
      meshRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent)
    }
  })

  if (!curve) return null

  return (
    <group>
      <mesh geometry={tubeGeo}>
        <meshStandardMaterial color={color || '#ff8800'} roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh ref={meshRef}>
        <coneGeometry args={[0.08, 0.2, 16]} />
        <meshStandardMaterial color={color || '#ff8800'} roughness={0.3} />
      </mesh>
    </group>
  )
}

function StickyNote3D({ text, onChange, position, onEnter, isMobile = false }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <planeGeometry args={isMobile ? [2.1, 1.2] : [1.5, 1.5]} />
        <meshStandardMaterial color="#fffacd" roughness={0.9} />
      </mesh>
      <Html transform position={[0, 0, 0.02]} distanceFactor={1.5} zIndexRange={[100, 0]}>
        <div style={{
            width: isMobile ? '240px' : '180px',
            height: isMobile ? '136px' : '180px',
            padding: isMobile ? '12px' : '10px',
            boxSizing: 'border-box'
        }}>
          <textarea
            value={text}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.target.blur()
                if (onEnter) onEnter()
              }
            }}
            placeholder="Write your sticky note here..."
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              borderRadius: isMobile ? '12px' : '0',
              fontFamily: 'Manrope, sans-serif',
              fontWeight: '600',
              fontSize: isMobile ? '16px' : '18px',
              lineHeight: '1.35',
              color: '#333'
            }}
          />
        </div>
      </Html>
    </group>
  )
}

export default function Calendar3D({ tokens, isMobile = false }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeDay, setActiveDay] = useState(new Date().getDate())
  const [isFlipping, setIsFlipping] = useState(false)
  const isFlippingRef = useRef(false)
  const [flipDirection, setFlipDirection] = useState(1)
  const [flipProgress, setFlipProgress] = useState(0)
  const [eventsArr, setEventsArr] = useState(getEvents)
  const [hoveredDay, setHoveredDay] = useState(null)

  // Unified Annotations State
  const [annotations, setAnnotations] = useState(getAnnotations)
  const [activeNoteId, setActiveNoteId] = useState(null)
  
  const [isRangeSelectionMode, setIsRangeSelectionMode] = useState(false)
  const [draftRangeStart, setDraftRangeStart] = useState(null)
  const [showHolidaysPanel, setShowHolidaysPanel] = useState(false)
  const [displayedMonthOffset, setDisplayedMonthOffset] = useState(0)
  const gestureRef = useRef({ startX: 0, startY: 0, startTime: 0, dayInfo: null, longPressTriggered: false })
  const longPressRef = useRef(null)
  const lastTapRef = useRef({ time: 0, key: '' })

  const currentMonthHolidays = useMemo(() => {
    const visibleDate = addMonths(currentDate, displayedMonthOffset)
    return getHolidaysForMonth(visibleDate.getMonth() + 1, visibleDate.getFullYear(), indianHolidays2026)
  }, [currentDate, displayedMonthOffset])

  const calendarMeshRef = useRef()
  const { raycaster, camera, gl, size } = useThree()

  useEffect(() => {
    saveEvents(eventsArr)
  }, [eventsArr])

  useEffect(() => {
    saveAnnotations(annotations)
  }, [annotations])

  useEffect(() => () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current)
    }
  }, [])

  const findAnnotationForDate = useCallback((clickedDate) => {
    for (const ann of annotations) {
      const startD = new Date(ann.start)
      if (ann.type === 'single') {
        if (isSameDay(clickedDate, startD)) return ann
      } else if (ann.type === 'range' && ann.end) {
        const endD = new Date(ann.end)
        const minDate = isAfter(startD, endD) ? endD : startD
        const maxDate = isAfter(startD, endD) ? startD : endD
        if (isSameDay(clickedDate, minDate) || isSameDay(clickedDate, maxDate) || (clickedDate > minDate && clickedDate < maxDate)) {
          return ann
        }
      }
    }

    return null
  }, [annotations])

  const [heroImage, setHeroImage] = useState(null)
  useEffect(() => {
    if (!tokens.heroImage) return
    const img = new window.Image()
    img.src = tokens.heroImage
    img.onload = () => setHeroImage(img)
  }, [tokens.heroImage])

  const calendarTexture = useMemo(() => {
    return createCalendarTexture(addMonths(currentDate, displayedMonthOffset), tokens, activeDay, eventsArr, annotations, draftRangeStart, heroImage, isMobile ? null : hoveredDay)
  }, [currentDate, tokens, activeDay, eventsArr, annotations, draftRangeStart, heroImage, displayedMonthOffset, hoveredDay, isMobile])

  const nextMonthTexture = useMemo(() => {
    return createCalendarTexture(addMonths(currentDate, displayedMonthOffset + 1), tokens, 0, eventsArr, annotations, draftRangeStart, heroImage, null)
  }, [currentDate, tokens, eventsArr, annotations, draftRangeStart, heroImage, displayedMonthOffset])

  const prevMonthTexture = useMemo(() => {
    return createCalendarTexture(addMonths(currentDate, displayedMonthOffset - 1), tokens, 0, eventsArr, annotations, draftRangeStart, heroImage, null)
  }, [currentDate, tokens, eventsArr, annotations, draftRangeStart, heroImage, displayedMonthOffset])

  const handleFlip = useCallback((direction) => {
    if (isFlippingRef.current) return

    isFlippingRef.current = true
    setFlipDirection(direction)
    setDisplayedMonthOffset(prev => prev + direction)
    setIsFlipping(true)
    setFlipProgress(0)

    const startTime = Date.now()
    const duration = 1000

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)

      setFlipProgress(eased)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCurrentDate(prev => direction > 0 ? addMonths(prev, 1) : subMonths(prev, 1))
        setDisplayedMonthOffset(0)
        setFlipProgress(0)
        setIsFlipping(false)
        isFlippingRef.current = false
      }
    }

    requestAnimationFrame(animate)
  }, [])

  const handleDaySelection = useCallback((dayInfo) => {
    if (!dayInfo) return

    if (isMobile && dayInfo.isCurrentMonth) {
      const existingAnnotation = findAnnotationForDate(dayInfo.date)
      if (existingAnnotation) {
        setActiveNoteId(existingAnnotation.id)
        return
      }
    }

    if (dayInfo.isPrevMonth) {
      handleFlip(-1)
      setTimeout(() => setActiveDay(dayInfo.dayNum), 100)
    } else if (dayInfo.isNextMonth) {
      handleFlip(1)
      setTimeout(() => setActiveDay(dayInfo.dayNum), 100)
    } else {
      setActiveDay(dayInfo.dayNum)
    }
  }, [findAnnotationForDate, handleFlip, isMobile])

  const handleDayAnnotation = useCallback((clickedDate) => {
    const clickedStr = format(clickedDate, 'yyyy-MM-dd')

    const foundAnn = findAnnotationForDate(clickedDate)

    if (foundAnn) {
      setActiveNoteId(foundAnn.id)
      setIsRangeSelectionMode(false)
      setDraftRangeStart(null)
      return
    }

    if (isRangeSelectionMode) {
      if (!draftRangeStart) {
        setDraftRangeStart(clickedStr)
      } else {
        const newId = 'range-' + Date.now()
        setAnnotations(prev => [...prev, {
          id: newId,
          type: 'range',
          start: draftRangeStart,
          end: clickedStr,
          text: ''
        }])
        setDraftRangeStart(null)
        setIsRangeSelectionMode(false)
        setActiveNoteId(newId)
      }
      return
    }

    const newId = 'single-' + Date.now()
    setAnnotations(prev => [...prev, {
      id: newId,
      type: 'single',
      start: clickedStr,
      text: ''
    }])
    setActiveNoteId(newId)
  }, [draftRangeStart, findAnnotationForDate, isRangeSelectionMode])

  const handleCalendarClick = useCallback((e) => {
    e.stopPropagation()

    if (activeNoteId) {
      setActiveNoteId(null)
    }

    if (isRangeSelectionMode) return // In selection mode, ignore single clicks

    // Close holidays panel when clicking elsewhere
    if (showHolidaysPanel) {
      setShowHolidaysPanel(false)
    }

    const uv = e.uv
    if (!uv) return

    const dayInfo = getDayFromUV(uv, currentDate)
    if (!dayInfo) return

    handleDaySelection(dayInfo)
  }, [currentDate, handleDaySelection, isRangeSelectionMode, activeNoteId, showHolidaysPanel])

  const handleCalendarDoubleClick = useCallback((e) => {
    e.stopPropagation()

    const uv = e.uv
    if (!uv) return

    const dayInfo = getDayFromUV(uv, currentDate)
    if (!dayInfo) return

    handleDayAnnotation(dayInfo.date)
  }, [currentDate, handleDayAnnotation])

  const clearLongPress = useCallback(() => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current)
      longPressRef.current = null
    }
  }, [])

  const handleCalendarPointerDown = useCallback((e) => {
    if (!isMobile) return

    const uv = e.uv
    if (!uv) return

    const dayInfo = getDayFromUV(uv, currentDate)
    gestureRef.current = {
      startX: uv.x,
      startY: uv.y,
      startTime: Date.now(),
      dayInfo,
      longPressTriggered: false,
    }

    clearLongPress()
  }, [clearLongPress, currentDate, isMobile])

  const handleCalendarPointerUp = useCallback((e) => {
    if (!isMobile) return

    const uv = e.uv
    const gesture = gestureRef.current
    clearLongPress()
    if (!uv || !gesture.dayInfo) return

    const deltaX = uv.x - gesture.startX
    const deltaY = uv.y - gesture.startY
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    if (absX > 0.12 && absX > absY) {
      handleFlip(deltaX < 0 ? 1 : -1)
      return
    }

    if (gesture.longPressTriggered) return

    const tapKey = format(gesture.dayInfo.date, 'yyyy-MM-dd')
    const now = Date.now()
    const isDoubleTap = lastTapRef.current.key === tapKey && now - lastTapRef.current.time < 320
    lastTapRef.current = { time: now, key: tapKey }

    if (isDoubleTap) {
      handleDayAnnotation(gesture.dayInfo.date)
      return
    }

    if (isRangeSelectionMode) {
      handleDayAnnotation(gesture.dayInfo.date)
      return
    }

    handleDaySelection(gesture.dayInfo)
  }, [clearLongPress, handleDayAnnotation, handleDaySelection, handleFlip, isMobile, isRangeSelectionMode])

  const handleCalendarPointerLeave = useCallback(() => {
    setHoveredDay(null)
    clearLongPress()
  }, [clearLongPress])

  const getDayInfoFromClientPoint = useCallback((clientX, clientY) => {
    if (!calendarMeshRef.current) return null

    const x = (clientX / size.width) * 2 - 1
    const y = -(clientY / size.height) * 2 + 1
    raycaster.setFromCamera({ x, y }, camera)
    const hits = raycaster.intersectObject(calendarMeshRef.current, false)
    if (!hits.length || !hits[0].uv) return null
    return getDayFromUV(hits[0].uv, currentDate)
  }, [camera, currentDate, raycaster, size.height, size.width])

  useEffect(() => {
    if (!isMobile) return undefined

    const element = gl.domElement
    const swipe = {
      startX: 0,
      startY: 0,
      active: false,
    }

    const onTouchStart = (event) => {
      if (event.target.closest('textarea, button, input, select')) return
      const touch = event.touches[0]
      if (!touch) return
      swipe.startX = touch.clientX
      swipe.startY = touch.clientY
      swipe.active = true
    }

    const onTouchEnd = (event) => {
      if (!swipe.active || isFlippingRef.current) return
      const touch = event.changedTouches[0]
      if (!touch) return
      const deltaX = touch.clientX - swipe.startX
      const deltaY = touch.clientY - swipe.startY
      swipe.active = false

      if (Math.abs(deltaX) > 54 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        handleFlip(deltaX < 0 ? 1 : -1)
        setShowHolidaysPanel(false)
      }
    }

    element.addEventListener('touchstart', onTouchStart, { passive: true })
    element.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', onTouchStart)
      element.removeEventListener('touchend', onTouchEnd)
    }
  }, [gl, handleFlip, isMobile])

  const handleCalendarHover = useCallback((e) => {
    if (isMobile) return
    e.stopPropagation()
    const uv = e.uv
    if (!uv) {
      setHoveredDay(null)
      return
    }

    const dayInfo = getDayFromUV(uv, currentDate)
    setHoveredDay(dayInfo)
  }, [currentDate, isMobile])

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

  const activeAnnotation = useMemo(() => annotations.find(a => a.id === activeNoteId), [annotations, activeNoteId])

  const arrowTargetVec = useMemo(() => {
    if (!activeAnnotation) return null
    if (activeAnnotation.type === 'single') {
       return getGridPosFromDate(new Date(activeAnnotation.start + 'T00:00:00'), currentDate)
    } else {
       const start = new Date(activeAnnotation.start)
       const end = new Date(activeAnnotation.end)
       const minDate = isAfter(start, end) ? end : start
       return getGridPosFromDate(minDate, currentDate)
    }
  }, [activeAnnotation, currentDate])

  const navOffsetX = isMobile ? CALENDAR_WIDTH / 2 + 0.3 : CALENDAR_WIDTH / 2 + 0.65
  const navSize = isMobile ? 0.9 : 0.7
  const actionButtonPos = isMobile ? [-1.05, 2.75, 1.0] : [-CALENDAR_WIDTH / 2 - 1.2, 1.6, 1.0]
  const holidaysButtonPos = isMobile ? [1.05, 2.75, 1.0] : [CALENDAR_WIDTH / 2 + 1.6, 1.6, 1.0]
  const stickyNotePosition = isMobile ? [0, -3.35, 0.8] : [CALENDAR_WIDTH / 2 + 2.0, 0, 0.5]
  const stickyArrowStart = isMobile ? new THREE.Vector3(0, -2.55, 0.8) : new THREE.Vector3(CALENDAR_WIDTH / 2 + 2.0 - 0.75, 0, 0.5)
  const visibleMonthDate = addMonths(currentDate, displayedMonthOffset)

  return (
    <group position={[0, 3.18, 0.5]}>
      {/* Navigation buttons - visible with background */}
      {/* Right arrow button (next month) */}
      <group position={[navOffsetX, 0, 1.2]}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            handleFlip(1);
          }}
          renderOrder={999}
        >
          <planeGeometry args={[navSize, navSize]} />
          <meshStandardMaterial color={tokens.calendarAccent || '#4b78b6'} roughness={0.5} metalness={0.1} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        {/* Arrow triangle right - rotate to point right */}
        <mesh position={[0.05, 0, 0.02]} rotation={[0, 0, -Math.PI / 2]} renderOrder={1001}>
          <coneGeometry args={[0.22, 0.35, 3]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>

      {/* Left arrow button (prev month) */}
      <group position={[-navOffsetX, 0, 1.2]}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            handleFlip(-1);
          }}
          renderOrder={999}
        >
          <planeGeometry args={[navSize, navSize]} />
          <meshStandardMaterial color={tokens.calendarAccent || '#4b78b6'} roughness={0.5} metalness={0.1} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        {/* Arrow triangle left - rotate to point left */}
        <mesh position={[-0.05, 0, 0.02]} rotation={[0, 0, Math.PI / 2]} renderOrder={1001}>
          <coneGeometry args={[0.22, 0.35, 3]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>


      {/* Stack of remaining pages */}
      {(isMobile ? [0, -0.005] : [0, -0.005, -0.01]).map((z, i) => (
        <mesh key={`stack-${i}`} position={[0, 0, z]} renderOrder={100}>
          <planeGeometry args={[CALENDAR_WIDTH, CALENDAR_HEIGHT]} />
          <meshStandardMaterial 
            map={nextMonthTexture}
            roughness={0.9} 
            metalness={0.01} 
          />
        </mesh>
      ))}

      {/* Outgoing page that curls away */}
      {isFlipping && (
        <CalendarPage
          frontTexture={calendarTexture}
          backTexture={flipDirection > 0 ? nextMonthTexture : prevMonthTexture}
          flipProgress={flipProgress}
          position={[0, 0, 0.05]}
          direction={flipDirection}
          isMobile={isMobile}
        />
      )}

      {/* Main calendar page with click detection */}
      <mesh
        ref={calendarMeshRef}
        position={[0, 0, 0.02]}
        renderOrder={101}
        onClick={isMobile ? undefined : handleCalendarClick}
        onDoubleClick={isMobile ? undefined : handleCalendarDoubleClick}
        onPointerMove={handleCalendarHover}
        onPointerDown={handleCalendarPointerDown}
        onPointerUp={handleCalendarPointerUp}
        onPointerLeave={handleCalendarPointerLeave}
      >
        <planeGeometry args={[CALENDAR_WIDTH, CALENDAR_HEIGHT]} />
        <meshStandardMaterial 
          map={calendarTexture}
          roughness={0.85} 
          metalness={0.02} 
          side={THREE.DoubleSide} 
        />
      </mesh>

      {/* Page shadow */}
      <mesh position={[0, -CALENDAR_HEIGHT / 2 - 0.1, 1.0]}>
        <planeGeometry args={[CALENDAR_WIDTH * 0.8, 0.08]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.3} roughness={1} />
      </mesh>

      {isMobile ? (
        <Html transform position={[0, -3.05, 1.05]} distanceFactor={1.55} pointerEvents="none">
          <div style={{
            width: '240px',
            padding: '10px 12px',
            borderRadius: '18px',
            background: 'rgba(18, 22, 28, 0.78)',
            border: `1px solid ${tokens.cardBorder || 'rgba(255,255,255,0.15)'}`,
            color: '#f7f8fb',
            fontFamily: 'Manrope, sans-serif',
            textAlign: 'center',
            boxShadow: '0 12px 36px rgba(0,0,0,0.22)',
            backdropFilter: 'blur(12px)'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '0.01em' }}>
              {format(visibleMonthDate, 'MMMM yyyy')}
            </div>
            <div style={{ marginTop: '4px', fontSize: '11px', opacity: 0.85, lineHeight: 1.35 }}>
              Tap to select • Double-tap for note • Swipe to change month
            </div>
          </div>
        </Html>
      ) : null}

      {/* Primary Action Button - Left side top */}
      <group position={actionButtonPos}>
        <mesh
          onClick={(e) => {
            e.stopPropagation()
            if (activeNoteId) {
              setAnnotations(prev => prev.filter(a => a.id !== activeNoteId))
              setActiveNoteId(null)
            } else if (!isRangeSelectionMode) {
              setIsRangeSelectionMode(true)
              setDraftRangeStart(null)
            } else {
              setIsRangeSelectionMode(false)
              setDraftRangeStart(null)
            }
          }}
          renderOrder={1002}
        >
          <boxGeometry args={[isMobile ? 1.75 : 2.0, isMobile ? 0.48 : 0.55, 0.05]} />
          <meshStandardMaterial 
            color={activeNoteId ? '#f44336' : (isRangeSelectionMode ? '#527bb4' : (tokens.chipColor || tokens.calendarAccent || '#4b78b6'))} 
            roughness={0.5} 
          />
        </mesh>
        <Html transform position={[0, 0, 0.03]} distanceFactor={1.5} pointerEvents="none">
          <div style={{
            color: '#fff',
            fontFamily: 'Manrope, sans-serif',
            fontSize: isMobile ? '14px' : '18px',
            fontWeight: 'bold',
            textAlign: 'center',
            width: isMobile ? '170px' : '220px',
            userSelect: 'none',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}>
            {activeNoteId ? 'Delete Note' : 
             !isRangeSelectionMode ? 'Range' : 
             !draftRangeStart ? (isMobile ? 'Tap start date' : 'Double click start date') : 
             (isMobile ? 'Tap end date' : 'Double click end date')}
          </div>
        </Html>
      </group>

      {/* Interactive Sticky Note overlay (Visible when selection is complete) */}
      {activeAnnotation && (
        isMobile ? (
          <Html fullscreen style={{ pointerEvents: 'auto' }}>
            <div
              onClick={() => setActiveNoteId(null)}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                background: 'rgba(8, 10, 14, 0.42)',
                backdropFilter: 'blur(6px)'
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: 'min(86vw, 320px)',
                  minHeight: '190px',
                  padding: '16px',
                  borderRadius: '24px',
                  background: '#fff5b8',
                  boxShadow: '0 24px 70px rgba(0,0,0,0.28)',
                  border: '1px solid rgba(86, 68, 18, 0.18)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '14px', color: '#6d5712' }}>
                    Note
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveNoteId(null)}
                    style={{
                      border: 'none',
                      background: 'rgba(109, 87, 18, 0.12)',
                      color: '#6d5712',
                      width: '32px',
                      height: '32px',
                      borderRadius: '999px',
                      fontSize: '18px',
                      fontWeight: 800,
                      lineHeight: 1,
                      cursor: 'pointer'
                    }}
                    aria-label="Close note"
                  >
                    x
                  </button>
                </div>
                <textarea
                  autoFocus
                  value={activeAnnotation.text}
                  onChange={(e) => setAnnotations(prev => prev.map(a => a.id === activeNoteId ? { ...a, text: e.target.value } : a))}
                  placeholder="Write your note..."
                  style={{
                    width: '100%',
                    minHeight: '130px',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    background: 'transparent',
                    fontFamily: 'Manrope, sans-serif',
                    fontSize: '17px',
                    lineHeight: '1.45',
                    color: '#2c2720'
                  }}
                />
              </div>
            </div>
          </Html>
        ) : (
          <group>
            <StickyNote3D 
              text={activeAnnotation.text} 
              onChange={(val) => setAnnotations(prev => prev.map(a => a.id === activeNoteId ? { ...a, text: val } : a))} 
              onEnter={() => setActiveNoteId(null)}
              position={stickyNotePosition}
              isMobile={isMobile}
            />
            {arrowTargetVec && (
              <CartoonyArrow 
                startVec={stickyArrowStart} 
                endVec={arrowTargetVec} 
                color={activeAnnotation.type === 'single' ? "#ff3b3b" : "#ff8800"}
              />
            )}
          </group>
        )
      )}

      {/* Holidays Button + Dropdown - Right side top */}
      <group position={holidaysButtonPos}>
        <mesh
          onClick={(e) => {
            e.stopPropagation()
            setShowHolidaysPanel(!showHolidaysPanel)
          }}
          renderOrder={1003}
        >
          <boxGeometry args={[isMobile ? 1.45 : 1.6, isMobile ? 0.48 : 0.55, 0.05]} />
          <meshStandardMaterial 
            color={showHolidaysPanel ? (tokens.calendarAccent || '#4b78b6') : (tokens.chipColor || tokens.calendarAccent || '#4b78b6')} 
            roughness={0.5} 
          />
        </mesh>
        <Html transform position={[0, 0, 0.03]} distanceFactor={1.5} pointerEvents="none">
          <div style={{
            color: '#fff',
            fontFamily: 'Manrope, sans-serif',
            fontSize: isMobile ? '14px' : '18px',
            fontWeight: 'bold',
            textAlign: 'center',
            width: isMobile ? '150px' : '180px',
            userSelect: 'none',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}>
            Holidays {showHolidaysPanel ? '▼' : '▶'}
          </div>
        </Html>

        {/* Dropdown Panel - expands downward from button */}
        {showHolidaysPanel && (
          <group position={[0, isMobile ? -1.3 : -1.6, 0.05]}>
            <mesh>
              <planeGeometry args={[isMobile ? 1.95 : 2.4, isMobile ? 1.8 : 2.2]} />
              <meshStandardMaterial color={tokens.calendarBg || '#1a212c'} roughness={0.9} transparent opacity={0.95} />
            </mesh>
            <Html transform position={[0, 0, 0.01]} distanceFactor={1.5} style={{ width: isMobile ? '210px' : '260px', pointerEvents: 'none' }}>
              <div style={{
                padding: isMobile ? '14px' : '20px',
                fontFamily: 'Manrope, sans-serif',
                color: tokens.calendarText || '#ebf2fb',
                fontSize: isMobile ? '16px' : '22px',
                lineHeight: '1.5'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: isMobile ? '18px' : '26px', marginBottom: '16px', borderBottom: `3px solid ${tokens.calendarAccent}`, paddingBottom: '8px' }}>
                  Holidays
                </div>
                {currentMonthHolidays.length === 0 ? (
                  <div style={{ opacity: 0.6, fontStyle: 'italic', fontSize: isMobile ? '14px' : '20px' }}>No holidays this month</div>
                ) : (
                  currentMonthHolidays.map((h, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: isMobile ? '8px' : '12px', alignItems: 'center' }}>
                      <span style={{ color: '#ff4444', fontWeight: '900', fontSize: isMobile ? '18px' : '26px' }}>{h.date.getDate()}</span>
                      <span style={{ flex: 1, marginLeft: '14px', fontSize: isMobile ? '14px' : '22px', fontWeight: '600' }}>{h.name}</span>
                    </div>
                  ))
                )}
                <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.3)', fontSize: isMobile ? '12px' : '16px', opacity: 0.85 }}>
                  ★ National Holiday<br/>
                  ✦ Sunday
                </div>
              </div>
            </Html>
          </group>
        )}
      </group>

    </group>
  )
}
