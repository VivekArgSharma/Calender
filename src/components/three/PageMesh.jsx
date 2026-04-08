import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'

// Higher segment count = more realistic bend during flip
const PAGE_SEGMENTS = 20

const PageMesh = forwardRef(({ onFlipComplete }, ref) => {
  const meshRef = useRef()
  const windTime = useRef(0)

  // Expose flip methods to parent (MonthNav triggers these)
  useImperativeHandle(ref, () => ({
    flipForward: () => {
      gsap.to(meshRef.current.rotation, {
        y: -Math.PI,
        duration: 0.9,
        ease: 'power2.inOut',
        onComplete: () => {
          meshRef.current.rotation.y = 0
          onFlipComplete?.('forward')
        }
      })
    },
    flipBack: () => {
      gsap.to(meshRef.current.rotation, {
        y: Math.PI,
        duration: 0.9,
        ease: 'power2.inOut',
        onComplete: () => {
          meshRef.current.rotation.y = 0
          onFlipComplete?.('back')
        }
      })
    }
  }))

  // Wind: subtle continuous oscillation on x and z
  useFrame((_, delta) => {
    windTime.current += delta
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(windTime.current * 0.4) * 0.012
      meshRef.current.rotation.z = Math.sin(windTime.current * 0.3) * 0.008
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0.01]}>
      <planeGeometry args={[3.2, 4.5, PAGE_SEGMENTS, PAGE_SEGMENTS]} />
      <meshStandardMaterial
        color="#faf7f0"
        side={THREE.DoubleSide}
        roughness={0.8}
      />
    </mesh>
  )
})

export default PageMesh
