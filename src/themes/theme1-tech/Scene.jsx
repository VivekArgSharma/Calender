import ModelAsset from '../../scene/ModelAsset'
import SceneShell from '../../scene/SceneShell'
import WallFrame from '../../scene/WallFrame'
import { theme1Tokens } from './tokens'
import Calendar3D from '../../components/calendar/Calendar3D'

function TechProps({ isMobile, isTablet, isTabletLandscape }) {
  return (
    <group>
      {(!isMobile || isTablet) ? (
        <>
          <ModelAsset
            url="/models/theme1-tech/Super Computer.glb"
            targetHeight={2.4}
            position={[-5.2, 0, -1.55]}
            rotation={[0, 0.38, 0]}
            floorOffset={-0.35}
          />
          <ModelAsset
            url="/models/theme1-tech/Standing Desk.glb"
            targetHeight={2.12}
            position={[4.95, 0, -1.98]}
            rotation={[0, -0.72, 0]}
          />
        </>
      ) : null}

      <WallFrame
        image="/images/art/tech-circuit-2k.jpg"
        position={[-5.65, 4.55, -2.82]}
        rotation={[0, 0.08, 0]}
        size={[1.35, 1.0]}
        frameColor="#2a2220"
        matColor="#d8d2cb"
      />
      {(!isMobile || isTablet) ? (
        <WallFrame
          image="/images/art/tech-cyber.jpg"
          position={[-5.35, 2.55, -2.82]}
          rotation={[0, 0.1, 0]}
          size={[1.1, 1.45]}
          frameColor="#1e1a18"
          matColor="#e2dcd5"
        />
      ) : null}
      <WallFrame
        image="/images/art/tech-desk-2k.jpg"
        position={[5.05, 4.45, -2.82]}
        rotation={[0, -0.1, 0]}
        size={[1.25, 0.95]}
        frameColor="#261e1b"
        matColor="#ded8d1"
      />
      {(!isMobile || isTablet) ? (
        <WallFrame
          image="/images/art/tech-circuit-2k.jpg"
          position={[4.55, 2.55, -2.82]}
          rotation={[0, -0.06, 0]}
          size={[1.05, 1.3]}
          frameColor="#1e1715"
          matColor="#e5e1db"
        />
      ) : null}

      <Calendar3D tokens={theme1Tokens} isMobile={isMobile} isTablet={isTablet} isTabletLandscape={isTabletLandscape} />
    </group>
  )
}

export default function Theme1Scene({ isMobile = false, isTablet = false, isTabletLandscape = false }) {
  return (
    <SceneShell tokens={theme1Tokens} isMobile={isMobile} isTablet={isTablet}>
      <TechProps isMobile={isMobile} isTablet={isTablet} isTabletLandscape={isTabletLandscape} />
    </SceneShell>
  )
}
