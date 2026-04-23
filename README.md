# Idle Ring

Idle Ring is a browser-based idle / incremental game built with React, Vite, TypeScript, and Framer Motion.

The game loop is centered on generating energy and insight, investing those resources into generators and upgrades, unlocking automation, hitting milestones, and eventually resetting into prestige for stronger long-term growth.

## Current scope

- energy and insight resource loop
- generator list and upgrade panel
- milestone unlocks and automation systems
- prestige progression
- offline progress handling
- animated HUD and ring-centric presentation
- persisted game state

## Tech stack

- React 19
- Vite
- TypeScript
- Framer Motion
- Tailwind CSS

## Development

```bash
npm install
npm run dev
```

Useful commands:

```bash
npm run build
npm run lint
npm run preview
```

## Project structure

- `src/App.tsx`: main application shell
- `src/game/GameProvider.tsx`: core game state and progression provider
- `src/game/config.ts`: game content and balancing inputs
- `src/game/economy.ts`: progression and economy logic
- `src/components/`: gameplay panels for generators, upgrades, milestones, automation, prestige, and the ring UI
- `src/utils/persist.ts`: save/load behavior

## Notes

- The visual design leans into a stylized sci-fi presentation rather than a minimal spreadsheet-like incremental UI.
- `src/game/GameProvider.tsx` is the main place to start if you need to change progression behavior.
