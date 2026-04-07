import ModelAsset from '../../scene/ModelAsset'
import SceneShell from '../../scene/SceneShell'
import WallFrame from '../../scene/WallFrame'
import { theme2Tokens } from './tokens'

function ArtProps() {
  return (
    <group>
      <ModelAsset
        url="/models/theme2-art/Easel.glb"
        targetHeight={2.25}
        position={[-4.15, 0, -1.42]}
        rotation={[0, 0.5, 0]}
      />
      <ModelAsset
        url="/models/theme2-art/Paint Can.glb"
        targetHeight={0.48}
        position={[-3.3, 0, -0.68]}
        rotation={[0, 0.18, 0]}
      />
      <ModelAsset
        url="/models/theme2-art/Drafting Table.glb"
        targetHeight={1.45}
        position={[3.85, 0, -1.46]}
        rotation={[0, -0.46, 0]}
      />
      <ModelAsset
        url="/models/theme2-art/Wall painting.glb"
        targetHeight={1.3}
        position={[5.18, 4.02, -2.94]}
        rotation={[0, -0.08, 0]}
      />

      <WallFrame
        image="/images/art/art-portrait-2k.jpg"
        position={[-5.55, 4.65, -2.82]}
        rotation={[0, 0.1, 0]}
        size={[1.2, 1.5]}
        frameColor="#5c3726"
        matColor="#eadbc7"
      />
      <WallFrame
        image="/images/art/art-gallery.jpg"
        position={[-5.15, 2.55, -2.82]}
        rotation={[0, 0.12, 0]}
        size={[1.3, 0.95]}
        frameColor="#4d2f22"
        matColor="#efe2d0"
      />
      <WallFrame
        image="/images/art/art-studio-2k.jpg"
        position={[5.55, 4.55, -2.82]}
        rotation={[0, -0.1, 0]}
        size={[1.15, 1.35]}
        frameColor="#5a3424"
        matColor="#e8d8c4"
      />
      <WallFrame
        image="/images/art/art-portrait-2k.jpg"
        position={[4.95, 2.55, -2.82]}
        rotation={[0, -0.06, 0]}
        size={[1.0, 1.25]}
        frameColor="#4d2f22"
        matColor="#efe2d0"
      />
    </group>
  )
}

export default function Theme2Scene() {
  return (
    <SceneShell tokens={theme2Tokens}>
      <ArtProps />
    </SceneShell>
  )
}
