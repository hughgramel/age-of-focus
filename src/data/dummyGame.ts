import { Game, Nation, Province, ResourceType } from '@/types/game';

// French provinces with 1836 data
const franceProvinces: Province[] = [
  {
    id: 'ile_de_france',
    name: 'Île-de-France',
    path: '',  // Will be populated from SVG
    population: 3500000,  // Paris and surroundings
    goldIncome: 250,     // Financial and administrative center
    industry: 180,       // Most industrialized
    buildings: [],
    resourceType: 'gold' as ResourceType,
    army: 25000,  // Major garrison in Paris
  },
  {
    id: 'normandy',
    name: 'Normandy',
    path: '',
    population: 2200000,  // Rich agricultural region
    goldIncome: 150,
    industry: 120,       // Textile industry
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 15000,
  },
  {
    id: 'brittany',
    name: 'Brittany',
    path: '',
    population: 2100000,  // Maritime region
    goldIncome: 120,     // Naval trade
    industry: 90,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 12000,  // Naval presence
  },
  {
    id: 'alsace_lorraine',
    name: 'Alsace-Lorraine',
    path: '',
    population: 1800000,
    goldIncome: 140,
    industry: 150,       // Early industrialization
    buildings: [],
    resourceType: 'coal' as ResourceType,
    army: 20000,  // Border region
  },
  {
    id: 'rhone',
    name: 'Rhône',
    path: '',
    population: 2000000,  // Lyon and surroundings
    goldIncome: 180,     // Silk industry
    industry: 160,
    buildings: [],
    resourceType: 'gold' as ResourceType,
    army: 18000,
  },
  {
    id: 'provence',
    name: 'Provence',
    path: '',
    population: 1700000,  // Mediterranean coast
    goldIncome: 160,     // Maritime trade
    industry: 100,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 15000,  // Mediterranean presence
  },
  {
    id: 'languedoc',
    name: 'Languedoc',
    path: '',
    population: 1900000,
    goldIncome: 130,
    industry: 90,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 12000,
  },
  {
    id: 'guyenne',
    name: 'Guyenne',
    path: '',
    population: 1800000,  // Bordeaux region
    goldIncome: 140,     // Wine trade
    industry: 100,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 10000,
  },
  {
    id: 'burgundy',
    name: 'Burgundy',
    path: '',
    population: 1600000,
    goldIncome: 130,
    industry: 110,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 12000,
  },
  {
    id: 'champagne',
    name: 'Champagne',
    path: '',
    population: 1500000,
    goldIncome: 140,
    industry: 100,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 10000,
  },
  {
    id: 'french_low_countries',
    name: 'French Low Countries',
    path: '',
    population: 2000000,  // Industrial north
    goldIncome: 160,
    industry: 140,
    buildings: [],
    resourceType: 'coal' as ResourceType,
    army: 20000,  // Border region
  },
  {
    id: 'picardy',
    name: 'Picardy',
    path: '',
    population: 1800000,
    goldIncome: 120,
    industry: 110,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 15000,
  },
  {
    id: 'orleans',
    name: 'Orléans',
    path: '',
    population: 1600000,
    goldIncome: 110,
    industry: 90,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 10000,
  },
  {
    id: 'maine_anjou',
    name: 'Maine-Anjou',
    path: '',
    population: 1500000,
    goldIncome: 100,
    industry: 80,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 8000,
  },
  {
    id: 'poitou',
    name: 'Poitou',
    path: '',
    population: 1400000,
    goldIncome: 90,
    industry: 70,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 8000,
  },
  {
    id: 'auvergne_limousin',
    name: 'Auvergne-Limousin',
    path: '',
    population: 1700000,
    goldIncome: 100,
    industry: 80,
    buildings: [],
    resourceType: 'coal' as ResourceType,
    army: 10000,
  },
  {
    id: 'aquitaine',
    name: 'Aquitaine',
    path: '',
    population: 1600000,
    goldIncome: 110,
    industry: 85,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 12000,
  },
  {
    id: 'franche_comte',
    name: 'Franche-Comté',
    path: '',
    population: 1400000,
    goldIncome: 100,
    industry: 95,
    buildings: [],
    resourceType: 'iron' as ResourceType,
    army: 15000,
  },
  {
    id: 'lorraine',
    name: 'Lorraine',
    path: '',
    population: 1400000,
    goldIncome: 110,
    industry: 100,
    buildings: [],
    resourceType: 'iron' as ResourceType,
    army: 18000,  // Border region
  }
];

// Example provinces for Belgium
const belgiumProvinces: Province[] = [
  {
    id: 'flanders',
    name: 'Flanders',
    path: 'M300...',  // This will be replaced with actual SVG path data
    population: 2200000,   // More populated than Wallonia
    goldIncome: 100,      // Strong textile industry
    industry: 90,         // Early industrialization
    buildings: [],
    resourceType: 'coal' as ResourceType,  // Coal mining was important
    army: 15000,  // Main Belgian force
  },
  {
    id: 'wallonia',
    name: 'Wallonia',
    path: 'M400...',  // This will be replaced with actual SVG path data
    population: 1800000,   // Industrial but less populated
    goldIncome: 90,       // Heavy industry focus
    industry: 85,         // Steel and coal industries
    buildings: [],
    resourceType: 'iron' as ResourceType,  // Major iron deposits
    army: 10000,
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
  industry: 2050,         // Sum of province industry
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
  industry: 175,        // Sum of province industry
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