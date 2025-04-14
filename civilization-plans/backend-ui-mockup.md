# Visual Mockup + Backend Plan + Balancing for Focus-Based Civ Game

---

## 🎨 Visual Mockup (UI Flow)

### 1. **Focus Timer Page (Pre-Turn)**
```
+-----------------------------------+
|  🌟 FOCUS TO PLAY 🌟                  |
|                                   |
|  [ Start Focus Session ]         |
|  (25:00 countdown)               |
|                                   |
|  Turns Earned: 3                 |
|  Cities: 4   | Tech: "Writing"    |
+-----------------------------------+
```
- Big "Start Focus" button
- Countdown shows active session
- Small panel with current game stats (just enough to motivate you)

---

### 2. **Break / Turn Execution Screen**
```
+-----------------------------------+
|  ✅ TURN READY - SPEND YOUR EARNED TURN  |
|                                   |
|  📍 City: Athens                  |
|     - Build: Granary (4 turns)     |
|     - Assign Citizens              |
|                                   |
|  🏛️ Unit: Warrior (Move)         |
|                                   |
|  🔢 Tech: Writing (2 turns left)     |
|                                   |
|  [ END TURN ]                     |
+-----------------------------------+
```
- All turn decisions made here
- One "Turn Credit" is spent
- Afterward, you're prompted to focus again

---

## 📊 Backend Plan

### Tech Stack Suggestion
- **Frontend**: Next.js + TailwindCSS
- **Backend**: Supabase or Firebase (easy auth, real-time, and DB)
- **DB Model**: PostgreSQL (if using Supabase)

### User Model
```ts
User {
  id: UUID,
  username: string,
  focus_streak: number,
  total_focus_time: number,
  turns_available: integer,
  last_focus_session: timestamp,
}
```

### Game State Model
```ts
Game {
  user_id: UUID,
  turn_number: integer,
  cities: [City],
  units: [Unit],
  tech_tree: [Tech],
  current_research: Tech,
  in_progress_builds: [BuildQueue],
  map_state: JSON,
}
```

### API Endpoints
| Route | Description |
|-------|-------------|
| `POST /focus/start` | Starts a session, stores timestamp |
| `POST /focus/end` | Ends session, adds turn credit if complete |
| `GET /game/state` | Returns current game state |
| `POST /game/turn` | Executes a turn using 1 credit |

---

## ⚖️ Game Balancing Strategy

### Turn = Focus Session
- **1 Focus Session (25 min) = 1 Turn Credit**
- **Turn Credit** = Player can perform 1 full turn's worth of decisions
- Each city/unit/tech executes its logic once per turn

### Optional: Action Point Model
- **1 Focus Session = 3 Action Points**
  - Moving a unit = 1 point
  - Building = 1 point
  - Starting tech = 1 point
- Gives more granularity & flexibility

### Progression Balance Ideas
| Mechanic | Balance Strategy |
|----------|------------------|
| Tech Tree | Higher techs require more turns, or consecutive streaks |
| Units | Stronger units cost more turns or must be unlocked after a focus streak |
| Wonders | Require streak focus (e.g., 3 turns earned without missing a day) |
| Expansion | Add soft cap: only 1 new city per 2 focus sessions |

### Anti-Exploit Measures
- No way to "buy" turns — must be earned
- Focus session must be uninterrupted (or ≥ 90% complete)
- Add cooldowns or enforce break timers to prevent burnout

---

## 🤖 Suggestions for User Retention
- Daily Streak Bonus = bonus turn credit or instant boost
- "Golden Focus Age" if 5 sessions completed in one day
- Friends leaderboard for turns earned
- Visual growth: civilization glows, expands, or develops visually on each session

---

Would you like help scaffolding this in code (Next.js + Supabase), or designing the first few tech tree and unit elements?

