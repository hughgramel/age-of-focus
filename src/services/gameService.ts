import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Game } from '@/types/game';

export interface SaveGame {
  game: Game;
  metadata: {
    savedAt: string;
    scenarioId: string;
    playerNation: string;
  };
}

export class GameService {
  private static COLLECTION = 'saveGames';

  static async getSaveGame(userId: string, slotNumber: number): Promise<SaveGame | null> {
    const saveDoc = doc(db, 'users', userId, this.COLLECTION, `slot${slotNumber}`);
    console.log(`Getting save game from path: users/${userId}/${this.COLLECTION}/slot${slotNumber}`);
    
    const docSnap = await getDoc(saveDoc);
    
    if (!docSnap.exists()) {
      console.log('Save game not found');
      return null;
    }

    const data = docSnap.data() as SaveGame;
    console.log('Retrieved save game:', data);
    return data;
  }

  static async saveGame(userId: string, slotNumber: number, game: Game, scenarioId: string): Promise<void> {
    const saveDoc = doc(db, 'users', userId, this.COLLECTION, `slot${slotNumber}`);
    console.log(`Saving game to path: users/${userId}/${this.COLLECTION}/slot${slotNumber}`);
    
    const saveGame: SaveGame = {
      game,
      metadata: {
        savedAt: new Date().toISOString(),
        scenarioId,
        playerNation: game.playerNationTag
      }
    };

    console.log('Saving game data:', saveGame);
    await setDoc(saveDoc, saveGame);
    console.log('Game saved successfully');
  }

  static async deleteSaveGame(userId: string, slotNumber: number): Promise<void> {
    const saveDoc = doc(db, 'users', userId, this.COLLECTION, `slot${slotNumber}`);
    console.log(`Deleting save game from path: users/${userId}/${this.COLLECTION}/slot${slotNumber}`);
    await deleteDoc(saveDoc);
    console.log('Save game deleted successfully');
  }

  static async getSaveGames(userId: string): Promise<Record<number, SaveGame | null>> {
    console.log(`Getting all save games for user: ${userId}`);
    const saves: Record<number, SaveGame | null> = {
      1: null,
      2: null,
      3: null,
      4: null,
      5: null
    };

    for (let i = 1; i <= 5; i++) {
      saves[i] = await this.getSaveGame(userId, i);
    }

    console.log('Retrieved all save games:', saves);
    return saves;
  }
} 