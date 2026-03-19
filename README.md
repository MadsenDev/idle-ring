# Idle Ring

Idle Ring is a browser idle/incremental game built with React, Vite, TypeScript, and Framer Motion.

The game revolves around generating "Insight", investing it across constructs and upgrades, progressing through milestones, unlocking automation, and resetting into prestige loops.

## Current Scope

- resource loop centered on energy / insight generation
- generator list and upgrade panel
- milestones and automation panels
- prestige system
- offline progress handling
- animated HUD and ring-centric presentation

## Development

```bash
npm install
npm run dev
```

Other useful commands:

```bash
npm run build
npm run lint
npm run preview
```

## Stack

- React 19
- Vite
- TypeScript
- Framer Motion
- Tailwind CSS

## Notes

- The UI leans heavily into a stylized, sci-fi incremental-game presentation.
- Core game state is provided through `src/game/GameProvider`.
