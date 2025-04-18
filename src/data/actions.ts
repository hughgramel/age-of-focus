// Available focus actions for the Age of Focus game
export type ActionType = 'build' | 'invest' | 'expand' | 'auto';

// Define interface for action options
export interface FocusAction {
  id: ActionType;
  name: string;
  description: string;
  execute: () => void;
}

// Create the list of available actions
export const FOCUS_ACTIONS: FocusAction[] = [
  {
    id: 'build',
    name: 'Build in Galicia',
    description: 'Build infrastructure in your territories',
    execute: () => {
      console.log('Executing build action');
    }
  },
  {
    id: 'invest',
    name: 'Invest in Lusatia',
    description: 'Invest in economy and production',
    execute: () => {
      console.log('Executing invest action');
    }
  },
  {
    id: 'expand',
    name: 'Expand in Brittany',
    description: 'Expand your influence and territories',
    execute: () => {
      console.log('Executing expand action');
    }
  }
];

// Helper function to get a random action
export const getRandomAction = (): FocusAction => {
  const actionOptions = FOCUS_ACTIONS.filter(a => a.id !== 'auto');
  const randomIndex = Math.floor(Math.random() * actionOptions.length);
  return actionOptions[randomIndex];
};

// Calculate number of actions based on session duration
export const calculateActionsFromDuration = (durationMinutes: number): number => {
  // 2 actions per hour, minimum 1, maximum 8
  const actionCount = Math.floor(durationMinutes / 30);
  return Math.max(1, Math.min(8, actionCount));
};

// Execute focus actions
export const executeActions = (actions: FocusAction[], completedFully: boolean): void => {
  if (completedFully) {
    // Execute all actions
    actions.forEach(action => action.execute());
  } else {
    // Execute only the first action
    if (actions.length > 0) {
      actions[0].execute();
    }
  }
}; 