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
    try {
      // Create a deep copy of the game to work with
      const updatedGame = JSON.parse(JSON.stringify(game));

      // Process each action
      for (const action of actions) {
          const { target, updates } = action;
          
          if (target.type === 'province') {
            // Find the nation that owns this province
            const nationWithProvince = updatedGame.nations.find((nation: Nation) => 
              nation.provinces.some((p: Province) => p.id === target.id)
            );
            
            if (!nationWithProvince) {
              console.warn(`Province ${target.id} not found in any nation`);
              continue;
            }

            // Find and update the province
            const provinceIndex = nationWithProvince.provinces.findIndex((p: Province) => p.id === target.id);
            if (provinceIndex === -1) continue;

            const province = nationWithProvince.provinces[provinceIndex];
            (updates as ResourceUpdate[]).forEach(update => {
              const newValue = Math.max(0, province[update.resource] + update.amount);
              province[update.resource] = newValue;
            });

          } else if (target.type === 'nation') {
            // Find and update the nation
            const nationIndex = updatedGame.nations.findIndex((n: Nation) => n.nationTag === target.id);
            if (nationIndex === -1) {
              console.warn(`Nation ${target.id} not found`);
              continue;
            }

            (updates as NationResourceUpdate[]).forEach(update => {
              const nation = updatedGame.nations[nationIndex];
              const newValue = Math.max(0, nation[update.resource] + update.amount);
              nation[update.resource] = newValue;
            });
          }
    //       const { transfer } = action;
          
    //       // If there's a source nation, remove the province from it
    //       if (transfer.fromNationTag) {
    //         const fromNationIndex = updatedGame.nations.findIndex((n: Nation) => n.nationTag === transfer.fromNationTag);
    //         if (fromNationIndex !== -1) {
    //           const fromNation = updatedGame.nations[fromNationIndex];
    //           const provinceIndex = fromNation.provinces.findIndex((p: Province) => p.id === transfer.provinceId);
    //           if (provinceIndex !== -1) {
    //             const province = fromNation.provinces[provinceIndex];
    //             fromNation.provinces.splice(provinceIndex, 1);
                
    //             // Add province to target nation
    //             const toNationIndex = updatedGame.nations.findIndex((n: Nation) => n.nationTag === transfer.toNationTag);
    //             if (toNationIndex !== -1) {
    //               updatedGame.nations[toNationIndex].provinces.push(province);
    //             }
    //           }
    //         }
    //       }
    //     }
    //   }
        }
      // Save the updated game
      await GameService.saveGame(userId, slotNumber, updatedGame, 'action-update');
      
      console.log('Successfully processed actions');
      return updatedGame;
    } catch (error) {
      console.error('Error processing actions:', error);
      throw error;
    }
  }
} 