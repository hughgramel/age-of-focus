# ✅ 6-Week Production Roadmap: Age of Focus

> Goal: Launch a functional, polished MVP of **Age of Focus** that ties real-world tasks to in-game actions with scenario-based progression, Firebase integration, and a fully navigable UI.

---

## 📅 Week 1: Core Backend & Basic Task-to-Play Hookup

### 🔧 Firebase Setup & Auth
- [ ] Set up Firebase project with Firestore & Auth
- [ ] Enable email/password and Google OAuth login
- [ ] Create `firebase.ts` utility for secure access
- [ ] Create protected routes for authenticated users

### 📂 Game & User Data Modeling
- [ ] Define Firestore collections:
  - `/users/{uid}`
  - `/games/{gameId}`
  - `/todos/{todoId}`
- [ ] Model user profile data (name, avatar, current focus level)
- [ ] Define and seed base game templates

### ✅ Real Task-to-Play Binding
- [ ] Build `TodoForm` UI to create tasks
- [ ] Add dropdown to select a play (Develop, Build, etc.)
- [ ] Add dropdown to select province
- [ ] On task completion, trigger the assigned in-game play

---

## 📅 Week 2: Action System, Turns, and Focus Logic

### 🕹️ Action Point System
- [ ] Implement turn counter (1 turn per focus completed)
- [ ] Give player 2 action points per turn
- [ ] Ensure each play costs appropriate points (Build = 1, Conquer = 2)

### 📊 Province Actions
- [ ] Add basic effects for plays:
  - [ ] Develop: `province.goldIncome += 1`
  - [ ] Build: `province.buildings.push(...)`
  - [ ] Conquer: logic to move army & transfer province
  - [ ] Research: nation.researchProgress += % boost

### 🔁 Turn Progression
- [ ] Advance game date by 1 month per completed todo
- [ ] Update UI to reflect turns and date progression
- [ ] Consume & reset action points each turn

---

## 📅 Week 3: UI/UX and Map Polish

### 🗺️ Map Enhancements
- [ ] Add turn-based visual update to provinces
- [ ] Highlight current player's owned provinces
- [ ] Add hover tooltips for action previews

### 🧭 UI Navigation
- [ ] Create sidebar for:
  - [ ] Nation summary
  - [ ] Current action points
  - [ ] Play history log
- [ ] Add confirmation modals before plays
- [ ] Show countdown / animation when a todo is marked done

### 🎨 Visual Improvements
- [ ] Add smooth transitions for province takeovers
- [ ] Animate research/industry progress bars
- [ ] Polish font usage and layout responsiveness

---

## 📅 Week 4: Task System and Scenario Integration

### 📘 Scenario Framework
- [ ] Create scenario templates (e.g., "Waterloo")
- [ ] Define special win/loss goals per scenario
- [ ] Allow user to start a game with a scenario preset

### 🧠 Task Engine Expansion
- [ ] Add task types:
  - [ ] Daily recurring
  - [ ] One-time
  - [ ] Scenario-linked
- [ ] Tie scenario objectives to task completion (e.g., build 3 times, conquer 2 provinces)

### 🏆 Scenario Progress View
- [ ] Show progress toward scenario completion
- [ ] Unlock "scenario badge" on success
- [ ] Store finished scenarios in user profile

---

## 📅 Week 5: Cloud Sync, Save/Load & Session Handling

### ☁️ Cloud Game State
- [ ] Save game state after each turn
- [ ] Auto-load game state on login
- [ ] Allow multiple saved games per user

### 🧾 Todo Syncing
- [ ] Store todos in Firestore per user
- [ ] Sync real-time completion status
- [ ] Support offline mode + sync on reconnect

### 🔄 Session Restore
- [ ] Resume last open game session automatically
- [ ] Implement logout and game reset buttons

---

## 📅 Week 6: Polish, Marketing Prep, & Launch

### 🧹 Final Polish
- [ ] Bug fixes across map, plays, and turns
- [ ] Input validation for tasks & game creation
- [ ] Optimize for mobile and small screens
- [ ] Lighthouse accessibility & performance checks

### 📢 Landing Page + Onboarding
- [ ] Build `/landing` route with game overview
- [ ] Add how-to-play tutorial / onboarding modal
- [ ] Add testimonials or early scenario walkthrough

### 🚀 MVP Launch
- [ ] Deploy to Vercel with env setup
- [ ] Enable Firebase security rules
- [ ] Final scenario tuning & reward balancing
- [ ] Announce on socials, Buildspace, or Hacker News

---

## 🎯 MVP Feature Recap

| Feature                          | Status |
|----------------------------------|--------|
| User login                       | ☐      |
| Focus → Turn system              | ☐      |
| Task-to-Play mechanics           | ☐      |
| Province actions (Build, Dev...)| ☐      |
| Conquest logic                   | ☐      |
| Scenarios & progression          | ☐      |
| Save/load system                 | ☐      |
| Map interactions & popups        | ☐      |
| Visual polish & animations       | ☐      |
| Launch + promo                   | ☐      |

---

> Stay focused. Conquer goals. Shape history.
