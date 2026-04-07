# Aesthetic Wall Calendar

This project now includes the Three.js scene foundation for the interactive calendar assignment.

Current state:
- React + Vite app scaffold
- Three themed 3D scenes built with `@react-three/fiber`
- Shared room shell with a protected center wall for the future calendar UI
- Theme switcher to preview the scene directions

Themes:
- `Tech Studio` - desk and Macintosh on the right, framed art on the left
- `Art Loft` - easel and paint can on the left, drafting table and painting on the right
- `Music Corner` - amp and guitar on the right, keyboard and saxophone on the left

Run locally:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`

Key files:
- `src/App.jsx` - app shell with canvas and scene switcher
- `src/scene/SceneShell.jsx` - shared room, lighting, effects, and center wall staging
- `src/scene/ModelAsset.jsx` - reusable GLB loader with auto-centering and height fitting
- `src/themes/theme1-tech/Scene.jsx` - tech scene composition
- `src/themes/theme2-art/Scene.jsx` - art scene composition
- `src/themes/theme3-music/Scene.jsx` - music scene composition

Next planned step:
- Build the HTML calendar overlay on top of the prepared center wall area
