Here’s a detailed, **priority-based project to-do list** for building your gamified productivity-strategy game app. The structure below focuses on shipping a functional **MVP** quickly, followed by a roadmap of **post-MVP polish and expansion**. It’s designed to help you avoid perfectionism on things like SVG details too early and focus instead on core loop and mechanics.

---

# 🧱 MVP To-Do List – Core Features Only

## 🔑 Pre-MVP Marketing (Optional but Strategic)
- [ ] Create a 1-page landing site with:
    - [ ] Logo + tagline
    - [ ] 1–2 sentence product pitch
    - [ ] Email capture form (connected to Supabase or Mailchimp)
    - [ ] Thank-you page or success message
- [ ] Share with 5–10 friends or post in niche forums/Discords
- [ ] Add a waitlist counter if possible (“37 people waiting!”)

## 1. 🌐 Project Setup
- [X] **Initialize frontend project** with Next.js + Tailwind CSS + TypeScript
- [ ] **Set up backend** using Supabase (auth, DB) or Firebase
- [ ] **Create shared types/interfaces** for user, country, and focus sessions

## 2. 👤 User System
- [ ] Implement OAuth login (e.g., Google)
- [ ] On first login: generate a new country with default stats
- [ ] Store user profile + country data in DB

## 3. 🎯 Focus Session Core Loop
- [ ] "Start focus session" button (e.g., 25min Pomodoro)
- [ ] Timer UI (basic functionality only)
- [ ] When session ends:
  - [ ] Record session
  - [ ] Increment country stats (e.g., income, production, XP)
  - [ ] Save session + rewards to DB
- [ ] Optional: Sound/visual reward on session end

## 4. 🌍 Country System (Minimal)
- [ ] Country has basic stats:
  - [ ] Population
  - [ ] Treasury (currency)
  - [ ] Industry Level
  - [ ] Military Level
- [ ] Display stats on dashboard

## 5. 🏭 In-Game Actions (Minimal)
- [ ] Allow 1-3 actions *only during a focus session*, e.g.:
  - [ ] Build factory (costs currency, increases industry)
  - [ ] Train army (costs, increases military)
  - [ ] Research tech (takes time, boosts efficiency)
- [ ] Simple cooldowns or focus-gated conditions for actions

## 6. 🖼️ UI (Functional, Not Polished)
- [ ] Clean, readable dashboard layout
- [ ] Focus timer interface
- [ ] Country stat display
- [ ] Simple "Action" panel (buttons only)

## 7. 🧪 MVP Testing & Polish
- [ ] Test login/session flow
- [ ] Test focus-to-reward logic
- [ ] Test DB sync (user state, actions, updates)
- [ ] Minimal mobile responsiveness

---

# 🚀 Post-MVP Roadmap (V2+)

## 🎨 Visuals & Map
- [ ] Add SVG world map (one country per user)
- [ ] Color territories based on ownership/progress
- [ ] Clickable provinces (skip path merging for now)
- [ ] Show info panel when hovering/clicking a region

## 🧱 Advanced Game Mechanics
- [ ] Add building tiers and production chains
- [ ] Introduce morale/happiness mechanics
- [ ] Introduce tech trees or unlocks

## 🤝 Multiplayer / Social
- [ ] Leaderboard based on GDP/focus time
- [ ] See other players' countries
- [ ] Visit neighbors / trade resources

## 💰 Monetization
- [ ] Add cosmetic upgrades for countries
- [ ] Premium plan: Advanced buildings, analytics, etc.

## 📈 Analytics & Insights
- [ ] Charts of user focus history
- [ ] Weekly progress summary email

## 🪄 Design Polish
- [ ] Animate focus timer
- [ ] Add sound effects or music
- [ ] SVG smoothing and border merging
- [ ] Interactive transitions when upgrading

---

If you’d like, I can also turn this list into a Notion board or GitHub issues format. Would that help? Or do you want help breaking down one of these tasks into subtasks?