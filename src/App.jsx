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

  useEffect(() => {
    const media = window.matchMedia('(max-width: 820px), (pointer: coarse)')
    const sync = () => setIsMobile(media.matches)
    sync()

    if (media.addEventListener) {
      media.addEventListener('change', sync)
      return () => media.removeEventListener('change', sync)
    }

    media.addListener(sync)
    return () => media.removeListener(sync)
  }, [])

  return (
    <div className="app-shell" style={{ '--card-tone': tokens.cardTone, '--card-surface': tokens.cardSurface, '--card-border': tokens.cardBorder, '--chip-color': tokens.chipColor }}>
      <Canvas
        className="scene-canvas"
        gl={{ antialias: !isMobile, powerPreference: 'high-performance', logarithmicDepthBuffer: true }}
        dpr={isMobile ? [1, 1.2] : [1, 2]}
        camera={{ position: isMobile ? [0, 4.2, 11.2] : [0, 4.3, 10.2], fov: isMobile ? 35 : 30.5, near: 0.1, far: 100 }}
        onCreated={({ gl, scene }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = isMobile ? 1 : 1.05
          scene.environmentIntensity = 0.6
        }}
      >
        <Suspense fallback={null}>
          <CameraRig config={camera} isMobile={isMobile} />
          <Scene isMobile={isMobile} />
        </Suspense>
      </Canvas>

      <div className="ui-shell">
        <ThemeSwitcher isMobile={isMobile} />
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
