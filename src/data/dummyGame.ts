import { Game, Nation, Province, ResourceType } from '@/types/game';

// French provinces with 1836 data
const franceProvinces: Province[] = [
  {
    id: 'Ile_De_France',
    name: 'Île-de-France',
    path: '',  // Will be populated from SVG
    population: 3512347,  // Paris and surroundings
    goldIncome: 250,     // Financial and administrative center
    industry: 180,       // Most industrialized
    buildings: [],
    resourceType: 'gold' as ResourceType,
    army: 25172,  // Major garrison in Paris
  },
  {
    id: 'Normandy',
    name: 'Normandy',
    path: '',
    population: 2187432,  // Rich agricultural region
    goldIncome: 150,
    industry: 120,       // Textile industry
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 15234,
  },
  {
    id: 'Brittany',
    name: 'Brittany',
    path: '',
    population: 2134567,  // Maritime region
    goldIncome: 120,     // Naval trade
    industry: 90,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 12345,  // Naval presence
  },
  {
    id: 'Alsace_Lorraine',
    name: 'Alsace-Lorraine',
    path: '',
    population: 1876543,
    goldIncome: 140,
    industry: 150,       // Early industrialization
    buildings: [],
    resourceType: 'coal' as ResourceType,
    army: 20123,  // Border region
  },
  {
    id: 'Rhone',
    name: 'Rhône',
    path: '',
    population: 2045678,  // Lyon and surroundings
    goldIncome: 180,     // Silk industry
    industry: 160,
    buildings: [],
    resourceType: 'gold' as ResourceType,
    army: 18456,
  },
  {
    id: 'Provence',
    name: 'Provence',
    path: '',
    population: 1723456,  // Mediterranean coast
    goldIncome: 160,     // Maritime trade
    industry: 100,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 15678,  // Mediterranean presence
  },
  {
    id: 'Languedoc',
    name: 'Languedoc',
    path: '',
    population: 1923456,
    goldIncome: 130,
    industry: 90,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 12345,
  },
  {
    id: 'Guyenne',
    name: 'Guyenne',
    path: '',
    population: 1845678,  // Bordeaux region
    goldIncome: 140,     // Wine trade
    industry: 100,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 10234,
  },
  {
    id: 'Burgundy',
    name: 'Burgundy',
    path: '',
    population: 1634567,
    goldIncome: 130,
    industry: 110,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 12345,
  },
  {
    id: 'Champagne',
    name: 'Champagne',
    path: '',
    population: 1523456,
    goldIncome: 140,
    industry: 100,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 10123,
  },
  {
    id: 'French_Low_Countries',
    name: 'French Low Countries',
    path: '',
    population: 2045678,  // Industrial north
    goldIncome: 160,
    industry: 140,
    buildings: [],
    resourceType: 'coal' as ResourceType,
    army: 20456,  // Border region
  },
  {
    id: 'Picardy',
    name: 'Picardy',
    path: '',
    population: 1823456,
    goldIncome: 120,
    industry: 110,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 15234,
  },
  {
    id: 'Orleans',
    name: 'Orléans',
    path: '',
    population: 1634567,
    goldIncome: 110,
    industry: 90,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 10123,
  },
  {
    id: 'Maine_Anjou',
    name: 'Maine-Anjou',
    path: '',
    population: 1523456,
    goldIncome: 100,
    industry: 80,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 8234,
  },
  {
    id: 'Poitou',
    name: 'Poitou',
    path: '',
    population: 1423456,
    goldIncome: 90,
    industry: 70,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 8123,
  },
  {
    id: 'Auvergne_Limousin',
    name: 'Auvergne-Limousin',
    path: '',
    population: 1723456,
    goldIncome: 100,
    industry: 80,
    buildings: [],
    resourceType: 'coal' as ResourceType,
    army: 10234,
  },
  {
    id: 'Aquitaine',
    name: 'Aquitaine',
    path: '',
    population: 1634567,
    goldIncome: 110,
    industry: 85,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 12345,
  },
  {
    id: 'Franche_Comte',
    name: 'Franche-Comté',
    path: '',
    population: 1423456,
    goldIncome: 100,
    industry: 95,
    buildings: [],
    resourceType: 'iron' as ResourceType,
    army: 15234,
  },
  {
    id: 'Lorraine',
    name: 'Lorraine',
    path: '',
    population: 1423456,
    goldIncome: 110,
    industry: 100,
    buildings: [],
    resourceType: 'iron' as ResourceType,
    army: 18456,  // Border region
  }
];

// Example provinces for Belgium
const belgiumProvinces: Province[] = [
  {
    id: 'Flanders',
    name: 'Flanders',
    path: 'M300...',  // This will be replaced with actual SVG path data
    population: 2234567,   // More populated than Wallonia
    goldIncome: 100,      // Strong textile industry
    industry: 90,         // Early industrialization
    buildings: [],
    resourceType: 'coal' as ResourceType,  // Coal mining was important
    army: 15234,  // Main Belgian force
  },
  {
    id: 'Wallonia',
    name: 'Wallonia',
    path: 'M400...',  // This will be replaced with actual SVG path data
    population: 1823456,   // Industrial but less populated
    goldIncome: 90,       // Heavy industry focus
    industry: 85,         // Steel and coal industries
    buildings: [],
    resourceType: 'iron' as ResourceType,  // Major iron deposits
    army: 10123,
  }
];

// Create France nation
const france: Nation = {
  nationTag: 'FRA',
  name: 'France',
  color: '#2e3a49',
  hexColor: '#2e3a49',
  provinces: franceProvinces,
  borderProvinces: null,
  
  // Resources / Stats
  gold: 2000,            // Wealthy nation
  researchPoints: 100,   // Leading in sciences
  currentResearchId: 'steam_power',
  currentResearchProgress: 25,
  
  // Queue
  buildQueue: [],
  isAI: false
};

// Create Belgium nation
const belgium: Nation = {
  nationTag: 'BEL',
  name: 'Belgium',
  color: '#9c7a3d',
  hexColor: '#9c7a3d',
  provinces: belgiumProvinces,
  borderProvinces: null,
  
  // Resources / Stats
  gold: 1000,           // Newly independent but industrialized
  researchPoints: 50,   // Developing scientific base
  currentResearchId: null,
  currentResearchProgress: 0,
  
  // Queue
  buildQueue: null,     // null because it's AI controlled
  isAI: true
};

// Create the dummy game
export const dummyGame: Game = {
  id: 'game_1',
  gameName: 'Test Game 1',
  date: '1836-01-01',
  mapName: 'world_states',
  playerNationTag: 'FRA',
  nations: [france, belgium]
}; 