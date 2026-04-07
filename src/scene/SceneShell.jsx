import { ContactShadows, Environment, RoundedBox } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

function createWallTexture(baseColor, stripeColor) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const context = canvas.getContext('2d')

  context.fillStyle = baseColor
  context.fillRect(0, 0, canvas.width, canvas.height)

  for (let y = 0; y < canvas.height; y += 16) {
    const alpha = 0.025 + ((y / 16) % 2) * 0.018
    context.fillStyle = `rgba(${stripeColor.r}, ${stripeColor.g}, ${stripeColor.b}, ${alpha})`
    context.fillRect(0, y, canvas.width, 8)
  }

  for (let i = 0; i < 1400; i += 1) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const size = Math.random() * 2.2
    context.fillStyle = `rgba(255,255,255,${0.02 + Math.random() * 0.03})`
    context.fillRect(x, y, size, size)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2.8, 1.6)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function createFloorTexture(baseColor, lineColor) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const context = canvas.getContext('2d')

  context.fillStyle = baseColor
  context.fillRect(0, 0, canvas.width, canvas.height)

  const plankWidth = 128
  for (let x = 0; x < canvas.width; x += plankWidth) {
    context.fillStyle = `rgba(${lineColor.r}, ${lineColor.g}, ${lineColor.b}, 0.22)`
    context.fillRect(x, 0, 4, canvas.height)

    for (let y = 0; y < canvas.height; y += 64) {
      context.fillStyle = `rgba(${lineColor.r}, ${lineColor.g}, ${lineColor.b}, 0.14)`
      context.fillRect(x, y, plankWidth, 2)
    }

    for (let i = 0; i < 28; i += 1) {
      const grainX = x + Math.random() * plankWidth
      const grainY = Math.random() * canvas.height
      const grainWidth = 18 + Math.random() * 48
      context.fillStyle = `rgba(255,255,255,${0.016 + Math.random() * 0.018})`
      context.fillRect(grainX, grainY, grainWidth, 1)
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2.4, 1.8)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function WallSconce({ position, accent, metal }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 0, 0.02]}>
        <cylinderGeometry args={[0.08, 0.08, 0.08, 20]} />
        <meshStandardMaterial color={metal} roughness={0.28} metalness={0.78} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, -0.05, 0.14]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.26, 0.5, 24, 1, true]} />
        <meshStandardMaterial color={accent} roughness={0.62} metalness={0.08} />
      </mesh>
      <mesh position={[0, -0.05, 0.12]}>
        <sphereGeometry args={[0.08, 20, 20]} />
        <meshStandardMaterial color="#fff4df" emissive="#ffd8a6" emissiveIntensity={1.4} />
      </mesh>
      <pointLight color="#ffd5a1" intensity={1.8} distance={4.6} decay={2} position={[0, -0.08, 0.18]} />
    </group>
  )
}

function CenterMount({ tokens }) {
  return (
    <group position={[0, 3.18, -3.08]}>
      {/* Outer frame - sits closest to wall */}
      <RoundedBox args={[4.92, 6.14, 0.16]} radius={0.18} smoothness={8} position={[0, 0, 0]}>
        <meshStandardMaterial color={tokens.trimColor} roughness={0.72} metalness={0.08} />
      </RoundedBox>
      {/* Inner mat */}
      <RoundedBox args={[4.52, 5.74, 0.10]} radius={0.12} smoothness={8} position={[0, 0, 0.14]}>
        <meshStandardMaterial color={tokens.wallColor} roughness={0.94} metalness={0.02} />
      </RoundedBox>
      {/* Calendar surface - furthest from wall */}
      <RoundedBox args={[4.24, 5.44, 0.05]} radius={0.08} smoothness={6} position={[0, 0, 0.24]}>
        <meshStandardMaterial color={tokens.calendarGlowColor} roughness={0.97} metalness={0.01} />
      </RoundedBox>
      {/* Bottom shelf */}
      <mesh position={[0, -2.92, 0.26]}>
        <boxGeometry args={[1.08, 0.12, 0.08]} />
        <meshStandardMaterial color={tokens.baseboardColor} roughness={0.74} metalness={0.12} />
      </mesh>
      {/* Top hook ball */}
      <mesh position={[0, 3.18, 0.24]}>
        <sphereGeometry args={[0.085, 24, 24]} />
        <meshStandardMaterial color={tokens.hookColor} metalness={0.88} roughness={0.22} />
      </mesh>
      {/* Hook rod */}
      <mesh position={[0, 2.98, 0.24]}>
        <cylinderGeometry args={[0.024, 0.024, 0.4, 18]} />
        <meshStandardMaterial color={tokens.hookColor} metalness={0.88} roughness={0.22} />
      </mesh>
    </group>
  )
}

function RoomBase({ tokens }) {
  const wallTexture = useMemo(
    () => createWallTexture(tokens.wallColor, new THREE.Color(tokens.trimColor).multiplyScalar(255)),
    [tokens.wallColor, tokens.trimColor],
  )
  const sideWallTexture = useMemo(
    () => createWallTexture(tokens.sideWallColor, new THREE.Color(tokens.baseboardColor).multiplyScalar(255)),
    [tokens.sideWallColor, tokens.baseboardColor],
  )
  const floorTexture = useMemo(
    () => createFloorTexture(tokens.floorColor, new THREE.Color(tokens.shadowColor).multiplyScalar(255)),
    [tokens.floorColor, tokens.shadowColor],
  )
  const panelY = [1.9, 4.75]

  return (
    <group>
      {/* Floor */}
      <mesh position={[0, -0.11, 0]} receiveShadow>
        <boxGeometry args={[16.4, 0.22, 10.4]} />
        <meshStandardMaterial color={tokens.floorColor} map={floorTexture} roughness={0.76} metalness={0.03} />
      </mesh>

      {/* Back wall — the reference surface; everything else must be clearly in front */}
      <mesh position={[0, 3.35, -3.42]} receiveShadow>
        <boxGeometry args={[16.2, 7.2, 0.12]} />
        <meshStandardMaterial color={tokens.wallColor} map={wallTexture} roughness={0.93} metalness={0.02} />
      </mesh>
      {/* Left side wall */}
      <mesh position={[-7.95, 3.35, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[6.8, 7.2, 0.12]} />
        <meshStandardMaterial color={tokens.sideWallColor} map={sideWallTexture} roughness={0.94} metalness={0.02} />
      </mesh>
      {/* Right side wall */}
      <mesh position={[7.95, 3.35, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[6.8, 7.2, 0.12]} />
        <meshStandardMaterial color={tokens.sideWallColor} map={sideWallTexture} roughness={0.94} metalness={0.02} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 6.85, 0]} receiveShadow>
        <boxGeometry args={[16.2, 0.12, 6.8]} />
        <meshStandardMaterial color={tokens.sideWallColor} roughness={0.92} metalness={0.02} />
      </mesh>

      {/* Baseboard — pulled forward from wall */}
      <mesh position={[0, 0.22, -3.08]}>
        <boxGeometry args={[16.2, 0.24, 0.12]} />
        <meshStandardMaterial color={tokens.baseboardColor} roughness={0.76} metalness={0.08} />
      </mesh>
      {/* Crown moulding — pulled forward */}
      <mesh position={[0, 6.52, -3.08]}>
        <boxGeometry args={[16.2, 0.22, 0.18]} />
        <meshStandardMaterial color={tokens.trimColor} roughness={0.72} metalness={0.08} />
      </mesh>

      {/* Vertical trim left — pulled forward */}
      <mesh position={[-5.5, 3.35, -3.06]}>
        <boxGeometry args={[0.22, 6.04, 0.12]} />
        <meshStandardMaterial color={tokens.trimColor} roughness={0.74} metalness={0.08} />
      </mesh>
      {/* Vertical trim right — pulled forward */}
      <mesh position={[5.5, 3.35, -3.06]}>
        <boxGeometry args={[0.22, 6.04, 0.12]} />
        <meshStandardMaterial color={tokens.trimColor} roughness={0.74} metalness={0.08} />
      </mesh>

      {/* Decorative wall panels — pulled forward with clear gap */}
      {panelY.map((y) => (
        <group key={y}>
          <RoundedBox args={[4.3, 1.68, 0.06]} radius={0.06} smoothness={4} position={[-3.65, y, -3.02]}>
            <meshStandardMaterial color={tokens.sideWallColor} roughness={0.94} metalness={0.02}
              polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
          </RoundedBox>
          <RoundedBox args={[4.3, 1.68, 0.06]} radius={0.06} smoothness={4} position={[3.65, y, -3.02]}>
            <meshStandardMaterial color={tokens.sideWallColor} roughness={0.94} metalness={0.02}
              polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
          </RoundedBox>
        </group>
      ))}

      <CenterMount tokens={tokens} />
    </group>
  )
}

export default function SceneShell({ tokens, children }) {
  return (
    <group>
      <color attach="background" args={[tokens.background]} />
      <fog attach="fog" args={[tokens.fogColor, 12, 23]} />

      <ambientLight intensity={tokens.ambientIntensity ?? 0.55} color={tokens.ambientLight} />
      <hemisphereLight intensity={tokens.hemiIntensity ?? 0.55} color={tokens.skyLight} groundColor={tokens.groundLight} />
      <directionalLight intensity={tokens.keyIntensity ?? 2.2} color={tokens.keyLight} position={[4.8, 7.6, 4.8]} />
      <spotLight
        position={[0, 6.1, 1.8]}
        angle={0.44}
        penumbra={1}
        intensity={tokens.centerSpotIntensity ?? 24}
        distance={18}
        color={tokens.centerLight}
      />
      <spotLight
        position={[-4.8, 5.2, 1.3]}
        angle={0.52}
        penumbra={1}
        intensity={tokens.sideSpotIntensity ?? 9}
        distance={15}
        color={tokens.leftAccent}
      />
      <spotLight
        position={[4.8, 5.2, 1.3]}
        angle={0.52}
        penumbra={1}
        intensity={tokens.sideSpotIntensity ?? 9}
        distance={15}
        color={tokens.rightAccent}
      />

      <Environment preset={tokens.environmentPreset} environmentIntensity={tokens.environmentIntensity ?? 0.55} />
      <RoomBase tokens={tokens} />
      <WallSconce position={[-5.65, 5.82, -2.92]} accent={tokens.leftAccent} metal={tokens.hookColor} />
      <WallSconce position={[5.65, 5.82, -2.92]} accent={tokens.rightAccent} metal={tokens.hookColor} />

      <group>{children}</group>

      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.34}
        scale={13.5}
        blur={2.1}
        far={7}
        color={tokens.shadowColor}
      />
    </group>
  )
}
