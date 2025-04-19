export interface Country1836 {
  id: string;
  name: string;
  flag: string;
  description: string;
  backgroundImage: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
}

export const countries_1836: Country1836[] = [
  {
    id: 'france',
    name: 'France',
    flag: '🇫🇷',
    description: 'A rising industrial and military power',
    backgroundImage: '/countries/france_1836.png',
    difficulty: 'Easy'
  },
  {
    id: 'prussia',
    name: 'Prussia',
    flag: '🇩🇪',
    description: 'Emerging German powerhouse',
    backgroundImage: '/countries/prussia_1836.png',
    difficulty: 'Medium'
  },
  {
    id: 'usa',
    name: 'United States',
    flag: '🇺🇸',
    description: 'Young nation with great potential',
    backgroundImage: '/countries/usa_1836.png',
    difficulty: 'Easy'
  }
]; 