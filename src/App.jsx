import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import * as THREE from 'three'
import { ThemeProvider, useTheme } from './ThemeContext'
import ThemeSwitcher from './components/ui/ThemeSwitcher'
import CameraRig from './scene/CameraRig'

function AppShell() {
  const { activeThemeConfig } = useTheme()
  const { Scene, tokens, camera } = activeThemeConfig

  return (
    <div className="app-shell" style={{ '--card-tone': tokens.cardTone, '--card-surface': tokens.cardSurface, '--card-border': tokens.cardBorder, '--chip-color': tokens.chipColor }}>
      <Canvas
        className="scene-canvas"
        gl={{ antialias: true, powerPreference: 'high-performance', logarithmicDepthBuffer: true }}
        dpr={[1, 2]}
        camera={{ position: [0, 4.3, 10.2], fov: 30.5, near: 0.1, far: 100 }}
        onCreated={({ gl, scene }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
          scene.environmentIntensity = 0.6
        }}
      >
        <Suspense fallback={null}>
          <CameraRig config={camera} />
          <Scene />
        </Suspense>
      </Canvas>

      <div className="ui-shell">
        <ThemeSwitcher />
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
