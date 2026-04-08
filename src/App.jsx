import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useState } from 'react'
import * as THREE from 'three'
import { ThemeProvider, useTheme } from './ThemeContext'
import ThemeSwitcher from './components/ui/ThemeSwitcher'
import CameraRig from './scene/CameraRig'

function AppShell() {
  const { activeThemeConfig } = useTheme()
  const { Scene, tokens, camera } = activeThemeConfig
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isTabletLandscape, setIsTabletLandscape] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(pointer: coarse)')
    const sync = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const coarse = media.matches
      const tablet = (coarse && width > 820) || (width > 820 && width <= 1180)
      setIsMobile(coarse || width <= 820)
      setIsTablet(tablet)
      setIsTabletLandscape(tablet && width > height)
    }
    sync()

    if (media.addEventListener) {
      media.addEventListener('change', sync)
      return () => media.removeEventListener('change', sync)
    }

    media.addListener(sync)
    return () => media.removeListener(sync)
  }, [])

  return (
    <div className={`app-shell${isTabletLandscape ? ' is-tablet-landscape' : ''}`} style={{ '--card-tone': tokens.cardTone, '--card-surface': tokens.cardSurface, '--card-border': tokens.cardBorder, '--chip-color': tokens.chipColor }}>
      <Canvas
        className="scene-canvas"
        gl={{ antialias: !isMobile, powerPreference: 'high-performance', logarithmicDepthBuffer: true }}
        dpr={isMobile ? (isTablet ? [1, 1.45] : [1, 1.2]) : [1, 2]}
        camera={{ position: isMobile ? (isTabletLandscape ? [0, 4.15, 10.1] : isTablet ? [0, 4.25, 10.7] : [0, 4.2, 11.2]) : [0, 4.3, 10.2], fov: isMobile ? (isTabletLandscape ? 31.5 : isTablet ? 33 : 35) : 30.5, near: 0.1, far: 100 }}
        onCreated={({ gl, scene }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = isMobile ? (isTabletLandscape ? 1.03 : isTablet ? 1.02 : 1) : 1.05
          scene.environmentIntensity = 0.6
        }}
      >
        <Suspense fallback={null}>
          <CameraRig config={camera} isMobile={isMobile} isTablet={isTablet} isTabletLandscape={isTabletLandscape} />
          <Scene isMobile={isMobile} isTablet={isTablet} isTabletLandscape={isTabletLandscape} />
        </Suspense>
      </Canvas>

      <div className="ui-shell">
        <ThemeSwitcher isMobile={isMobile} isTablet={isTablet} isTabletLandscape={isTabletLandscape} />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  )
}
