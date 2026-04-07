import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

export default function FrameInsert({ image, position = [0, 0, 0], rotation = [0, 0, 0], size = [0.7, 0.95] }) {
  const texture = useTexture(image)
  texture.colorSpace = THREE.SRGBColorSpace

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={texture} toneMapped={false}
        polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
    </mesh>
  )
}
