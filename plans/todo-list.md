# ✅ 6-Week Production Roadmap: Age of Focus

> Goal: Launch a functional, polished MVP of **Age of Focus** that ties real-world tasks to in-game actions with scenario-based progression, Firebase integration, and a fully navigable UI.

---

## 🧠 Pre-Week: Promo Landing Page & Validation (Optional but Strategic)

### 🔥 Pre-MVP Marketing
- [ ] Create a 1-page landing site with:
  - [ ] Logo + game tagline
  - [ ] 1–2 sentence product pitch
  - [ ] Email capture form (Supabase or Mailchimp)
  - [ ] Thank-you page or success message
- [ ] Share with 5–10 friends or in niche communities
- [ ] Add a waitlist counter (optional but engaging)

---

## 📅 Week 1: Core Setup, Auth, and Country Creation

### 🔧 Firebase/Supabase Setup
- [X] Initialize frontend project (Next.js, Tailwind, TS)
- [X] Set up Supabase or Firebase (Auth + Firestore)
- [X] Create shared types/interfaces for user, country, and focus session

### 👤 User & Game System
- [ ] Implement OAuth login (e.g., Google)
- [ ] On first login: generate new country with default stats
- [ ] Store user profile and game data in Firestore

### 🗂️ Data Modeling
- [ ] Create Firestore collections:
  - `/users/{uid}`
  - `/games/{gameId}`
  - `/todos/{todoId}`
- [ ] Define schema for:
  - Country (treasury, population, industry, military)
  - Provinces (if applicable)
  - Focus session records
  - Action log

---

## 📅 Week 2: Focus Core Loop + Actions

### 🎯 Focus Session Core
- [ ] "Start Focus Session" button (25-min Pomodoro or custom)
- [ ] Timer UI (basic functionality)
- [ ] When session ends:
  - [ ] Record session in DB
  - [ ] Increment country stats (e.g., gold, industry, XP)
  - [ ] Save rewards to DB
  - [ ] 🎉 Trigger sound or animation reward

### 🛠️ Actions & AP System
- [ ] Player gets 2 Action Points (AP) per focus session
- [ ] Add 3 core plays:
  - [ ] Build Factory (costs gold, boosts industry)
  - [ ] Train Army (costs gold, boosts military)
  - [ ] Research Tech (boosts future efficiency)
- [ ] Ensure plays are locked unless user completes session
- [ ] Action effects update country state and persist to DB

---

## 📅 Week 3: Game Interface & Stats Display

### 🖼️ UI (Functional First)
- [ ] Dashboard layout:
  - [ ] Header with nation name/date
  - [ ] Stats bar: population, treasury, industry, military
  - [ ] Action panel (buttons, tooltips)
  - [ ] Focus timer section
- [ ] Add basic sidebar or overlay panel for:
  - [ ] Nation summary
  - [ ] Remaining AP
  - [ ] Recent actions history

### 📱 Mobile Support (MVP Scope)
- [ ] Ensure main UI components are readable on mobile
- [ ] Responsive layout for timer, buttons, and stats

---

## 📅 Week 4: Task → Play Mapping + Scenarios

### ✅ Task System (Todo → Game)
- [ ] Add task form:
  - [ ] Title
  - [ ] Assign province (optional)
  - [ ] Assign play (e.g., "Develop Economy")
- [ ] On task completion:
  - [ ] Trigger assigned play
  - [ ] Update province or nation stats
  - [ ] Consume AP
  - [ ] Log play and session in history

### 🗺️ Scenario Framework
- [ ] Define scenarios like:
  - "Waterloo"
  - "The Sacred War"
  - "Doom: 1789"
- [ ] Each has:
  - [ ] Name, start conditions, goals
  - [ ] Unique visual or reward (badge, flag, etc.)
  - [ ] DB record to track completion

---

## 📅 Week 5: Syncing, Save System & Session Logic

### ☁️ Cloud Persistence
- [ ] Save full game state to Firestore after each turn
- [ ] Allow game resumption on login
- [ ] Auto-load last session

### 🔁 Todo & Focus History
- [ ] Store todos and sessions per user
- [ ] Sync session completion to game logic
- [ ] Handle client reconnect (resync state if needed)

### 🧪 Testing & Recovery
- [ ] Logout, re-login flow
- [ ] Game reset button (for testing/debug)
- [ ] Test for edge cases in syncing & AP usage

---

## 📅 Week 6: Final Polish & Public Launch

### ✨ Visual & UX Polish
- [ ] Finalize visual feedback for focus success (💥)
- [ ] Style AP bar and locked buttons
- [ ] Add soft animations for:
  - [ ] Stat changes
  - [ ] Building upgrades
  - [ ] Completed turns
- [ ] Add keyboard accessibility (if possible)

### 📢 MVP Promo + Landing Integration
- [ ] Connect login → game → dashboard
- [ ] Link landing page → signup → onboarding
- [ ] Add `/how-to-play` tutorial modal or route

### 🚀 Deploy & Launch
- [ ] Deploy on Vercel
- [ ] Set Firebase/Supabase env vars
- [ ] Enable security rules
- [ ] Announce launch via:
  - [ ] Buildspace
  - [ ] Twitter/X
  - [ ] Discords, Reddit, niche forums

---

## 🧩 Post-MVP Roadmap (V2+ Expansion)

### 🗺️ Advanced Map Mechanics
- [ ] Add SVG world map (province ownership)
- [ ] Color territories based on player progress
- [ ] Hover/click province to show stats popup

### 🧱 Advanced Strategy Layer
- [ ] Building tiers and production chains
- [ ] Morale/happiness systems
- [ ] Tech trees and branches

### 🎮 Multiplayer & Social
- [ ] Leaderboards (total focus hours, GDP, etc.)
- [ ] View other players’ nations
- [ ] Trade resources or tech with neighbors

### 💰 Monetization (Premium)
- [ ] Cosmetic upgrades (flags, map skins)
- [ ] Premium plan: unlock extra scenarios, analytics
- [ ] Daily streak boosts

### 📈 Progress Insights
- [ ] Focus trends over time
- [ ] Weekly email summary
- [ ] Achievement system (e.g., 5-day streak)

---

> Stay focused. Grow your empire. Shape history.
