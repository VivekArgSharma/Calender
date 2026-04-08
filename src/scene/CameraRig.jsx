import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

const defaultConfig = {
  position: [0, 4.2, 10.2],
  lookAt: [0, 3.25, -3.2],
  drift: { x: 0.18, y: 0.12 },
}

export default function CameraRig({ config = defaultConfig, isMobile = false, isTablet = false, isTabletLandscape = false }) {
  const { camera, pointer } = useThree()

  const state = useMemo(
    () => ({
      targetPosition: new THREE.Vector3(),
      lookTarget: new THREE.Vector3(),
      currentLook: new THREE.Vector3(),
    }),
    [],
  )

  useEffect(() => {
    const { position, lookAt } = config

    camera.position.set(position[0], position[1], position[2])
    state.currentLook.set(lookAt[0], lookAt[1], lookAt[2])
    state.lookTarget.set(lookAt[0], lookAt[1], lookAt[2])
    state.targetPosition.set(position[0], position[1], position[2])
    camera.lookAt(state.currentLook)
  }, [camera, config, state])

  useFrame((_, delta) => {
    const { position, lookAt, drift = defaultConfig.drift } = config
    const driftScale = isMobile ? (isTabletLandscape ? 0.48 : isTablet ? 0.55 : 0.35) : 1

    state.targetPosition.set(
      position[0] + pointer.x * drift.x * driftScale,
      position[1] + pointer.y * drift.y * driftScale,
      position[2],
    )

    state.lookTarget.set(
      lookAt[0] + pointer.x * drift.x * 0.45 * driftScale,
      lookAt[1] + pointer.y * drift.y * 0.35 * driftScale,
      lookAt[2],
    )

    const ease = 1 - Math.exp(-delta * 2.4)
    camera.position.lerp(state.targetPosition, ease)
    state.currentLook.lerp(state.lookTarget, ease)
    camera.lookAt(state.currentLook)
  })

  return null
}
