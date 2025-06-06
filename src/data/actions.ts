import { Game } from "@/types/game";
import { ActionUpdate } from "@/services/actionService";
// Available focus actions for the Age of Focus game
export type ActionType = 'develop' | 'invest' | 'expand' | 'improve_army' | 'population_growth' | 'auto';

// Define interface for action options
export interface FocusAction {
  id: ActionType;
  name: string;
  description: string;
  execute: (executeActionUpdate: (action: Omit<ActionUpdate, 'target'>) => void, playerNationResourceTotals: playerNationResourceTotals) => void;
}


interface playerNationResourceTotals {
  playerGold: number;
  playerIndustry: number;
  playerPopulation: number;
  playerArmy: number;
}

// Create the list of available actions
export const FOCUS_ACTIONS: FocusAction[] = [
  {
    id: 'invest',
    name: 'Invest in the Economy',
    description: 'Invest in the economy and production',
    execute: (executeActionUpdate: (action: Omit<ActionUpdate, 'target'>) => void, playerNationResourceTotals: playerNationResourceTotals) => {
      const goldToInvest = 1000 + Math.floor(playerNationResourceTotals.playerIndustry * 0.15);

      // Invest in the Economy adds (gold * 0.15) gold to the player's gold
      const action = {
        type: 'resources',
        updates: [
          { resource: 'gold', amount: goldToInvest }
        ]
      };
      executeActionUpdate(action as Omit<ActionUpdate, 'target'>);
    }
  },
  {
    id: 'develop',
    name: 'Develop Industry',
    description: 'Develop industry and production',
    execute: (executeActionUpdate: (action: Omit<ActionUpdate, 'target'>) => void, playerNationResourceTotals: playerNationResourceTotals) => {
      console.log('Executing develop action');
      // -  develop industry adds (industry * 0.1) industry and (gold * 0.03) gold. 
      const industryToInvest = 200 + Math.floor(playerNationResourceTotals.playerIndustry * 0.1);

      const action = {
        type: 'resources',
        updates: [
          { resource: 'industry', amount: industryToInvest }
        ]
      };
      executeActionUpdate(action as Omit<ActionUpdate, 'target'>);

    }
  },
  // {
  //   id: 'expand',
  //   name: 'Expand to a new province',
  //   description: 'Expand your influence and territories',
  //   execute: (game: Game) => {
  //     console.log('Executing expand action');
  //   }
  // },
  {
    id: 'improve_army',
    name: 'Improve the Army',
    description: 'Improve the army and military',
    execute: (executeActionUpdate: (action: Omit<ActionUpdate, 'target'>) => void, playerNationResourceTotals: playerNationResourceTotals) => {
      console.log('Executing improve army action');
      // - Expand the army will add (total population * 0.0024) soldiers to the players tag
      console.log('playerNationResourceTotals', playerNationResourceTotals);
      const armyToInvest = Math.floor(playerNationResourceTotals.playerPopulation * 0.0006);
      console.log('armyToInvest', armyToInvest);
      const action = {
        type: 'resources',
        updates: [
          { resource: 'army', amount: armyToInvest }
        ]
      };
      executeActionUpdate(action as Omit<ActionUpdate, 'target'>);
    }
  },
  {
    id: 'population_growth',
    name: 'Encourage Population Growth',
    description: 'Encourage population growth in a province',
    execute: (executeActionUpdate: (action: Omit<ActionUpdate, 'target'>) => void, playerNationResourceTotals: playerNationResourceTotals) => {
      console.log('Executing population growth action');
      // - Encourage population growth will add (total population * 0.005) population to the players tag
      const action = {
        type: 'resources',
        updates: [
          { resource: 'population', amount: Math.floor(playerNationResourceTotals.playerPopulation * 0.0020) }
        ]
      };
      executeActionUpdate(action as Omit<ActionUpdate, 'target'>);
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
export const executeActions = (actions: FocusAction[], completedFully: boolean, executeActionUpdate: (action: Omit<ActionUpdate, 'target'>) => void, playerNationResourceTotals: playerNationResourceTotals): void => {
  console.log('Executing actions:', actions);
  console.log('Completed fully:', completedFully);
  if (completedFully) {
    // Execute all actions
    actions.forEach(action => action.execute(executeActionUpdate, playerNationResourceTotals));
  } else {
    // Execute only the first action
    if (actions.length > 0) {
      actions[0].execute(executeActionUpdate, playerNationResourceTotals);
    }
  }
}; 