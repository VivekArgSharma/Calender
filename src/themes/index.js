import Theme1Scene from './theme1-tech/Scene'
import { theme1Tokens } from './theme1-tech/tokens'
import Theme2Scene from './theme2-art/Scene'
import { theme2Tokens } from './theme2-art/tokens'
import Theme3Scene from './theme3-music/Scene'
import { theme3Tokens } from './theme3-music/tokens'

export const themes = {
  tech: {
    id: 'tech',
    label: 'Tech Studio',
    blurb: 'Retro workstation styling with a bright center wall for the calendar.',
    Scene: Theme1Scene,
    tokens: theme1Tokens,
    camera: {
      position: [0.1, 4.55, 10.1],
      lookAt: [0, 3.55, -3.15],
      drift: { x: 0.2, y: 0.15 },
    },
  },
  art: {
    id: 'art',
    label: 'Art Loft',
    blurb: 'A gallery-like studio composition that frames the wall with creative props.',
    Scene: Theme2Scene,
    tokens: theme2Tokens,
    camera: {
      position: [0, 4.4, 10],
      lookAt: [0, 3.4, -3.18],
      drift: { x: 0.18, y: 0.14 },
    },
  },
  music: {
    id: 'music',
    label: 'Music Corner',
    blurb: 'A performance-inspired room with warmer lighting and balanced side vignettes.',
    Scene: Theme3Scene,
    tokens: theme3Tokens,
    camera: {
      position: [0.05, 4.25, 10.35],
      lookAt: [0, 3.45, -3.15],
      drift: { x: 0.24, y: 0.16 },
    },
  },
}

export const themeOrder = ['tech', 'art', 'music']
