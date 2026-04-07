import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

export default function ModelAsset({
  url,
  targetHeight = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scaleMultiplier = 1,
  floorOffset = 0,
}) {
  const { scene } = useGLTF(url)

  const prepared = useMemo(() => {
    const clone = scene.clone(true)

    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        if (child.material) {
          child.material = child.material.clone()
        }
      }
    })

    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)

    const normalizedScale = size.y > 0 ? (targetHeight / size.y) * scaleMultiplier : 1
    const normalizedPosition = [
      -center.x * normalizedScale,
      -box.min.y * normalizedScale + floorOffset,
      -center.z * normalizedScale,
    ]

    return {
      clone,
      normalizedScale,
      normalizedPosition,
    }
  }, [scene, scaleMultiplier, targetHeight, floorOffset])

  return (
    <group position={position} rotation={rotation}>
      <group scale={prepared.normalizedScale} position={prepared.normalizedPosition}>
        <primitive object={prepared.clone} />
      </group>
    </group>
  )
}

useGLTF.preload('/models/theme1-tech/Super Computer.glb')
useGLTF.preload('/models/theme1-tech/Standing Desk.glb')
useGLTF.preload('/models/theme2-art/Easel.glb')
useGLTF.preload('/models/theme2-art/Paint Can.glb')
useGLTF.preload('/models/theme2-art/Drafting Table.glb')
useGLTF.preload('/models/theme2-art/Wall painting.glb')
useGLTF.preload('/models/theme3-music/Guitar Amp.glb')
useGLTF.preload('/models/theme3-music/Electric guitar.glb')
useGLTF.preload('/models/theme3-music/Midi controller.glb')
useGLTF.preload('/models/theme3-music/Saxophone.glb')
