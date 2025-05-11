# Core MVP Tasks: Age of Focus

## 🔧 Setup & Infrastructure

### Firebase/Supabase Setup
- [X] Set up Firebase project
- [X] Configure Firebase Authentication
- [X] Set up Firestore database
- [ ] Create security rules for Firestore
- [ ] Set up Firebase hosting
- [X] Configure environment variables

### Data Models
- [ ] Define User interface
- [X] Define Game interface (`src/types/game.ts`)
- [X] Define Province interface (`src/types/game.ts`)
- [ ] Define FocusSession interface
- [ ] Define Action interface
- [ ] Create Firestore collections structure

## 👤 Authentication & User Management

### User Authentication
- [ ] Implement Google OAuth login
- [ ] Create login page
- [ ] Create logout functionality
- [ ] Handle auth state changes
- [ ] Create protected routes

### User Profile
- [ ] Create user profile page
- [ ] Store user preferences
- [ ] Implement profile update functionality
- [ ] Add user settings (e.g., timer duration)

## 🎮 Game Core Features

### Country Creation
- [ ] Create country initialization function
- [ ] Set default country stats
- [ ] Create initial provinces
- [ ] Save country to Firestore
- [ ] Load country on user login

### Focus Session System
- [ ] Create timer component
- [ ] Implement 25-minute Pomodoro timer
- [ ] Add timer controls (start, pause, reset)
- [ ] Create session completion handler
- [ ] Implement session rewards calculation
- [ ] Save session to Firestore
- [ ] Add session history view

### Action Points System
- [ ] Create AP tracking system
- [ ] Implement AP generation (2 per session)
- [ ] Create AP spending validation
- [ ] Add AP display component
- [ ] Implement AP refresh logic

### Core Actions
- [ ] Create Build Factory action
  - [ ] Define cost and effects
  - [ ] Implement validation
  - [ ] Create success handler
- [ ] Create Train Army action
  - [ ] Define cost and effects
  - [ ] Implement validation
  - [ ] Create success handler
- [ ] Create Research Tech action
  - [ ] Define cost and effects
  - [ ] Implement validation
  - [ ] Create success handler

## 📊 Game Interface

### Dashboard
- [ ] Create main dashboard layout
- [ ] Implement stats display
  - [ ] Population counter
  - [ ] Treasury display
  - [ ] Industry level
  - [ ] Military strength
- [ ] Create action buttons panel
- [ ] Add tooltips for actions
- [ ] Implement action cooldowns

### Province Management
- [ ] Create province list view
- [ ] Add province details panel
- [ ] Implement province selection
- [ ] Create province stats display
- [ ] Add province action buttons

## 📱 Mobile Support

### Responsive Design
- [ ] Make dashboard responsive
- [ ] Optimize timer for mobile
- [ ] Adjust stats display for small screens
- [ ] Create mobile-friendly action buttons
- [ ] Test on various screen sizes

## 🔄 Data Sync & Persistence

### Game State Management
- [ ] Implement game state reducer
- [ ] Create state persistence logic
- [ ] Add auto-save functionality
- [ ] Implement state recovery on reload
- [ ] Add error handling for sync failures

### Session History
- [ ] Create session history component
- [ ] Implement session data fetching
- [ ] Add session filtering
- [ ] Create session details view
- [ ] Add session statistics

## 🧪 Testing & Quality Assurance

### Core Testing
- [ ] Test authentication flows
- [ ] Test focus session completion
- [ ] Test action point system
- [ ] Test game state persistence
- [ ] Test mobile responsiveness

### Edge Cases
- [ ] Test offline behavior
- [ ] Test session interruption
- [ ] Test concurrent actions
- [ ] Test data recovery
- [ ] Test error states

## 🚀 Deployment

### Production Setup
- [ ] Configure production environment
- [ ] Set up CI/CD pipeline
- [ ] Configure production Firebase
- [ ] Add error tracking
- [ ] Set up monitoring

### Launch Preparation
- [ ] Final security review
- [ ] Performance optimization
- [ ] Load testing
- [ ] Documentation review
- [ ] Backup system setup

---
## Notes on Recent Work:
- **1936 Scenario Implementation:**
  - Created `src/data/world_1936.ts` with initial nation and province data.
  - Updated `src/app/(authenticated)/scenario_select/page.tsx` to include the 1936 scenario.
  - Refactored `src/app/(authenticated)/country_select/page.tsx` for dynamic scenario loading, using data from `world_1836.ts`, `world_1936.ts`, and their respective `scenarioDetails` objects. Fixed related linter errors.
  - Ensured `ScenarioDetails` type in `src/data/scenarios/types.ts` and `scenarioDetails_1836` in `src/data/world_1836.ts` are correctly defined and exported. 