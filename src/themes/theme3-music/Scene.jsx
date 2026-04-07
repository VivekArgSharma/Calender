import ModelAsset from '../../scene/ModelAsset'
import SceneShell from '../../scene/SceneShell'
import WallFrame from '../../scene/WallFrame'
import { theme3Tokens } from './tokens'

function MusicStand({ position, height = 1.04 }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, height * 0.5, 0]}>
        <cylinderGeometry args={[0.06, 0.08, height, 20]} />
        <meshStandardMaterial color="#2b2428" roughness={0.82} metalness={0.2} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, height + 0.08, 0]}>
        <boxGeometry args={[1.55, 0.1, 0.52]} />
        <meshStandardMaterial color="#473840" roughness={0.76} metalness={0.14} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.025, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.05, 24]} />
        <meshStandardMaterial color="#1b171a" roughness={0.9} metalness={0.1} />
      </mesh>
    </group>
  )
}

function SaxStand({ position }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 1.04, 16]} />
        <meshStandardMaterial color="#2f272a" roughness={0.76} metalness={0.22} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.08, 24]} />
        <meshStandardMaterial color="#181517" roughness={0.92} metalness={0.08} />
      </mesh>
    </group>
  )
}

function MusicProps() {
  return (
    <group>
      <ModelAsset
        url="/models/theme3-music/Guitar Amp.glb"
        targetHeight={1.26}
        position={[4.2, 0, -1.52]}
        rotation={[0, -0.38, 0]}
      />
      <ModelAsset
        url="/models/theme3-music/Electric guitar.glb"
        targetHeight={1.9}
        position={[4.72, 0, -0.62]}
        rotation={[0.03, -0.58, -0.14]}
      />

      <MusicStand position={[-4.05, 0, -1.44]} />
      <ModelAsset
        url="/models/theme3-music/Midi controller.glb"
        targetHeight={0.36}
        position={[-4.05, 1.14, -1.44]}
        rotation={[0, 0.26, 0]}
      />

      <SaxStand position={[-3.2, 0, -0.78]} />
      <ModelAsset
        url="/models/theme3-music/Saxophone.glb"
        targetHeight={1.18}
        position={[-3.2, 0.96, -0.74]}
        rotation={[0.16, 0.4, -0.14]}
      />

      <WallFrame
        image="/images/art/music-stage-2k.jpg"
        position={[-5.55, 4.65, -2.82]}
        rotation={[0, 0.12, 0]}
        size={[1.3, 0.95]}
        frameColor="#261812"
        matColor="#d8c7b6"
      />
      <WallFrame
        image="/images/art/music-concert.jpg"
        position={[-5.15, 2.55, -2.82]}
        rotation={[0, 0.14, 0]}
        size={[1.05, 1.4]}
        frameColor="#1e1410"
        matColor="#ddccba"
      />
      <WallFrame
        image="/images/art/music-crowd-2k.jpg"
        position={[5.55, 4.55, -2.82]}
        rotation={[0, -0.12, 0]}
        size={[1.15, 1.35]}
        frameColor="#23150f"
        matColor="#ddccba"
      />
      <WallFrame
        image="/images/art/music-stage-2k.jpg"
        position={[4.95, 2.55, -2.82]}
        rotation={[0, -0.06, 0]}
        size={[1.0, 1.25]}
        frameColor="#261812"
        matColor="#d8c7b6"
      />
    </group>
  )
}

export default function Theme3Scene() {
  return (
    <SceneShell tokens={theme3Tokens}>
      <MusicProps />
    </SceneShell>
  )
}
