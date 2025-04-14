import { Game } from '@/types/game';

export const dummyGame: Game = {
  id: 'game_1',
  gameName: 'Rise of Europe',
  date: '1836-01-01',
  playerNationTag: 'FRA',
  nations: [
    { nationTag: 'FRA' },
    { nationTag: 'ENG' },
    { nationTag: 'PRU' },
    { nationTag: 'RUS' },
    { nationTag: 'AUS' },
  ],
  mapName: 'world_states'
}; 