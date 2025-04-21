import { db } from '@/lib/firebase';
import { doc, runTransaction } from 'firebase/firestore';
import { Game, Nation, Province } from '@/types/game';
import { GameService } from '@/services/gameService';

export interface ResourceUpdate {
  resource: 'goldIncome' | 'industry' | 'army' | 'population';
  amount: number;
}

export interface NationResourceUpdate {
  resource: 'gold' | 'researchPoints';
  amount: number;
}

export type ActionUpdate = {
  type: 'resources';
  target: {
    type: 'province' | 'nation';
    id: string;
  };
  updates: ResourceUpdate[] | NationResourceUpdate[];
}

export class ActionService {
  static async processActions(userId: string, slotNumber: number, game: Game, actions: ActionUpdate[]): Promise<Game> {
    
    console.log('processing actions', actions);
    console.log('game', game);
    console.log('userId', userId);
    console.log('slotNumber', slotNumber);
    
    try {
      // Create a deep copy of the game to work with
      const updatedGame = JSON.parse(JSON.stringify(game));
      console.log('Created deep copy of game', updatedGame);

      // Process each action
      for (const action of actions) {
          console.log('Processing action:', action);
          const { target, updates } = action;
          console.log('Action target:', target);
          console.log('Action updates:', updates);
          
          if (target.type === 'province') {
            console.log('Processing province target:', target.id);
            // Find the nation that owns this province
            const nationWithProvince = updatedGame.nations.find((nation: Nation) => 
              nation.provinces.some((p: Province) => p.id === target.id)
            );
            
            if (!nationWithProvince) {
              console.warn(`Province ${target.id} not found in any nation`);
              continue;
            }
            console.log('Found nation with province:', nationWithProvince.nationTag);

            // Find and update the province
            const provinceIndex = nationWithProvince.provinces.findIndex((p: Province) => p.id === target.id);
            if (provinceIndex === -1) {
              console.warn(`Province ${target.id} not found in nation ${nationWithProvince.nationTag}`);
              continue;
            }
            console.log('Found province at index:', provinceIndex);

            const province = nationWithProvince.provinces[provinceIndex];
            console.log('Province before update:', province);
            
            (updates as ResourceUpdate[]).forEach(update => {
              console.log(`Updating province ${update.resource} from ${province[update.resource]} by ${update.amount}`);
              const newValue = Math.max(0, province[update.resource] + update.amount);
              province[update.resource] = newValue;
              console.log(`New ${update.resource} value: ${newValue}`);
            });
            console.log('Province after update:', province);

          } else if (target.type === 'nation') {
            console.log('Processing nation target:', target.id);
            // Find and update the nation
            const nationIndex = updatedGame.nations.findIndex((n: Nation) => n.nationTag === target.id);
            if (nationIndex === -1) {
              console.warn(`Nation ${target.id} not found`);
              continue;
            }
            console.log('Found nation at index:', nationIndex);

            (updates as NationResourceUpdate[]).forEach(update => {
              const nation = updatedGame.nations[nationIndex];
              console.log(`Updating nation ${update.resource} from ${nation[update.resource]} by ${update.amount}`);
              const newValue = Math.max(0, nation[update.resource] + update.amount);
              nation[update.resource] = newValue;
              console.log(`New ${update.resource} value: ${newValue}`);
            });
            console.log('Nation after update:', updatedGame.nations[nationIndex]);
          }
        }

      console.log('Saving updated game to Firebase');
      await GameService.saveGame(userId, slotNumber, updatedGame, 'action-update');
      
      console.log('Successfully processed actions');
      return updatedGame;
    } catch (error) {
      console.error('Error processing actions:', error);
      throw error;
    }
  }
} 