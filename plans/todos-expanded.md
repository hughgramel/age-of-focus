As you complete tasks and reference relevant files update this file as our memory to help with future tasks. 

# [TODAYS_TASK]

# Today's Tasks: Country Creation 🏰

## Core Setup
- [ ] Create country initialization function
  - Define base country stats (population, resources, etc.)
  - Add initialization logic in game creation flow
  
- [X] Set default country stats (Done for France and Belgium)
  - Implement starting values for treasury, industry, etc.
  - Add validation for stat ranges

## Province Management
- [ ] Create initial provinces
  - Define province generation algorithm
  - Set balanced starting resources
  - Create province relationships/connections

## Data Persistence
- [X] Save country to Firestore
  - Create country collection structure
  - Add proper indexing for queries
  - Implement save/update functions

- [X] Load country on user login
  - Add country loading to auth flow
  - Handle loading states
  - Add error recovery

## Testing
- [ ] Create basic test cases for country creation
- [X] Verify data persistence works correctly


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
- [X] Define User interface
- [X] Define Game interface
- [X] Define Province interface
- [ ] Define FocusSession interface
- [ ] Define Action interface
- [ ] Create Firestore collections structure

## 👤 Authentication & User Management

### User Authentication
- [X] Implement Google OAuth login
- [X] Create login page
- [X] Create logout functionality
- [X] Handle auth state changes
- [X] Create protected routes

### User Profile
- [X] Create user profile page
- [X] Store user preferences
- [X] Implement profile update functionality
- [X] Add user settings (e.g., timer duration)

## 🎮 Game Core Features

### Country Creation
- [X] Create country initialization function
- [X] Set default country stats
- [X] Create initial provinces
- [X] Save country to Firestore
- [X] Load country on user login

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

