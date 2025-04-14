export interface Nation {
  nationTag: string; // 3 char identifier e.g., 'FRA', 'ENG'
  // More fields to be added later
}

export interface Game {
  id: string;
  gameName: string;
  date: string; // yyyy-mm-dd
  playerNationTag: string;
  nations: Nation[];
  mapName: string;
} 