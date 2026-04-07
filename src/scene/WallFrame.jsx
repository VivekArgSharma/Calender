import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

export default function WallFrame({
  image,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  size = [1.2, 0.9],
  frameColor = '#3b2f28',
  matColor = '#e8dccf',
}) {
  const texture = useTexture(image)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8

  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[size[0] + 0.16, size[1] + 0.16, 0.10]} />
        <meshStandardMaterial color={frameColor} roughness={0.72} metalness={0.12} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0, 0.06]}>
        <boxGeometry args={[size[0] + 0.05, size[1] + 0.05, 0.03]} />
        <meshStandardMaterial color={matColor} roughness={0.96} />
      </mesh>
      <mesh position={[0, 0, 0.09]}>
        <planeGeometry args={size} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  )
}
