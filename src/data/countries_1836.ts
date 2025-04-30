export interface Country1836 {
  id: string;
  name: string;
  flag: string;
  nationTag: string;
  capitalProvinceId?: string;
  description: string;
  backgroundImage: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
  populationM: number;
  industryM: number;
  goldM: number;
  armyM: number;
}

export const countries_1836: Country1836[] = [
  {
    id: 'france',
    name: 'France',
    flag: '🇫🇷',
    nationTag: 'FRA',
    capitalProvinceId: 'Ile_De_France',
    description: 'A rising industrial and military power',
    backgroundImage: '/countries/france_1836.png',
    difficulty: 'Easy',
    populationM: 35.2,
    industryM: 8.5,
    goldM: 12.3,
    armyM: 4.7
  },
  {
    id: 'prussia',
    name: 'Prussia',
    flag: '🇩🇪',
    nationTag: 'PRU',
    capitalProvinceId: 'Brandenburg',
    description: 'Emerging German powerhouse',
    backgroundImage: '/countries/prussia_1836.png',
    difficulty: 'Medium',
    populationM: 15.8,
    industryM: 6.2,
    goldM: 5.4,
    armyM: 3.9
  },
  {
    id: 'usa',
    name: 'United States',
    flag: '🇺🇸',
    nationTag: 'USA',
    capitalProvinceId: undefined,
    description: 'Young nation with great potential',
    backgroundImage: '/countries/usa_1836.png',
    difficulty: 'Easy',
    populationM: 17.1,
    industryM: 4.8,
    goldM: 7.2,
    armyM: 2.3
  },
  {
    id: 'belgium',
    name: 'Belgium',
    flag: '🇧🇪',
    nationTag: 'BEL',
    capitalProvinceId: 'Flanders',
    description: 'Newly independent industrial nation',
    backgroundImage: '/countries/belgium_1836.png',
    difficulty: 'Easy',
    populationM: 4.1,
    industryM: 3.5,
    goldM: 2.5,
    armyM: 1.5
  },
  {
    id: 'great_britain',
    name: 'Great Britain',
    flag: '🇬🇧',
    nationTag: 'GBR',
    capitalProvinceId: 'East_Anglia',
    description: 'Global empire, dominant naval power',
    backgroundImage: '/countries/great_britain_1836.png',
    difficulty: 'Easy',
    populationM: 26.7,
    industryM: 15.0,
    goldM: 20.0,
    armyM: 5.5
  }
]; 