# 🏛️ Age of Focus

_A historical strategy game meets productivity tracker._  
Build your nation one task at a time. Complete real-life focus sessions to take strategic in-game actions and reshape history.

## 🌍 About the Project

**Age of Focus** is a gamified productivity app styled like a grand strategy game (inspired by *Victoria 3*, *Age of History 2*, etc.). Users develop their in-game nations by completing real-world to-dos, each tied to strategic "plays" that simulate governing, expanding, and innovating.

Built with:
- **Next.js** for app structure
- **Tailwind CSS** for sleek, customizable UI
- **Firebase** for backend, authentication, and data storage

---

## 🧱 Core Gameplay Loop

Each *focus session* in real life translates into an **in-game play**:
- ⏳ 1 focus = 1 turn (1 month of in-game time)
- 🎯 Each turn, players spend **action points** to perform strategic plays:
  
### 🧠 Play Types (Each Cost 1–2 Points)
| Action             | Cost | Effect |
|--------------------|------|--------|
| 🧱 Build           | 1    | Adds a building to a province |
| 📈 Develop         | 1    | Increases gold development in a state |
| ⚔️ Conquer         | 2    | Spend troops to invade bordering province |
| 🔬 Research Focus  | 1    | Increases research output by 30% for the turn |

✅ Users **create todos and assign a play** to them.  
📍 e.g., “Watch lecture” → *Develop Economy in Normandy*  
✔️ When the task is completed, the associated in-game effect is triggered.

---

## 🔁 Turn System

Each completed focus = 1 turn:
- 2 Action Points (AP) per turn
- 1 Turn = 1 Month in game time
- Actions are tracked per turn
- Game advances automatically when a task is completed

---

## 🧠 Scenarios

Custom curated scenarios inspire users to pursue challenging goal sets:
- **Waterloo**: Handle a major war campaign
- **Doom: 1789**: Survive revolutionary upheaval
- **The Sacred War**: Mobilize under occupation
- **Vietnam**: Manage asymmetric warfare and morale

Completing scenario-based tasks earns unique in-game **rewards** and **cosmetic upgrades**.

---

## 🗺️ Features Implemented So Far

- ✅ Interactive SVG world map with zoom & pan (via `panzoom`)
- ✅ Province selection and popup inspection
- ✅ Nation stats sidebar and player resource bar
- ✅ Real-time terminal interface for commands
- ✅ Demo + actual game views
- ✅ Basic dummy game logic with UI-connected nation/province data

---

## 🔮 Planned Features

- [ ] 🔐 User login and game save via Firebase Auth + Firestore
- [ ] 🧾 Full todo/task interface tied to gameplay
- [ ] 🛠️ Building types with development bonuses
- [ ] 🏗️ Province infrastructure management
- [ ] 💡 Research tree and technologies
- [ ] 🧠 Focus level tiers (e.g., Pomodoro = 1 AP, Deep Work = 2 AP)
- [ ] 🏆 Leaderboards and scenario tracking

---

## 🧪 Dev Notes

### Tech Stack
- **Frontend:** `Next.js`, `Tailwind`, `React`, `SVG`, `panzoom`
- **Backend:** `Firebase`, `Firestore`
- **State Mgmt:** Local for now, eventually context or Redux
- **Data Types:** Defined in `game.ts`, includes `Game`, `Nation`, and `Province`

### Folder Structure
```bash
/components
  ├── GameView.tsx       # Main game screen logic
  ├── MapView.tsx        # SVG rendering & logic
  ├── Terminal.tsx       # Hidden terminal with dev commands
  ├── HomeScreen.tsx     # Start screen for demo or new game
  ├── BackButton.tsx     # UI back button
/data
  └── dummyGame.ts       # Test game state for prototyping
/types
  └── game.ts            # Game, Nation, Province types
/lib
  └── firebase.ts        # Firebase config & utils

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
