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

// British provinces with 1836 data
const britainProvinces: Province[] = [
  {
    id: 'Wales',
    name: 'Wales',
    path: '',
    population: 1234567,  // Industrializing but still rural
    goldIncome: 78,      // Coal and iron exports
    industry: 62,        // Early industrialization
    buildings: [],
    resourceType: 'coal' as ResourceType,
    army: 5123,
  },
  {
    id: 'Midlands',
    name: 'Midlands',
    path: '',
    population: 2512345,  // Heart of Industrial Revolution
    goldIncome: 198,     // Major industrial center
    industry: 182,       // Leading industrial region
    buildings: [],
    resourceType: 'coal' as ResourceType,
    army: 9876,
  },
  {
    id: 'East_Anglia',
    name: 'East Anglia',
    path: '',
    population: 1523456,  // Agricultural region
    goldIncome: 123,     // Agricultural exports
    industry: 42,        // Limited industry
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 4123,
  },
  {
    id: 'West_Country',
    name: 'West Country',
    path: '',
    population: 1823456,  // Mixed economy
    goldIncome: 98,      // Agriculture and mining
    industry: 52,        // Some industry
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 6123,
  },
  {
    id: 'Home_Counties',
    name: 'Home Counties',
    path: '',
    population: 2012345,  // London surroundings
    goldIncome: 182,     // Financial center
    industry: 72,        // Some industry
    buildings: [],
    resourceType: 'gold' as ResourceType,
    army: 8123,
  },
  {
    id: 'Yorkshire',
    name: 'Yorkshire',
    path: '',
    population: 2212345,  // Industrial region
    goldIncome: 162,     // Textile and coal
    industry: 152,       // Major industrial center
    buildings: [],
    resourceType: 'coal' as ResourceType,
    army: 9123,
  },
  {
    id: 'Lancashire',
    name: 'Lancashire',
    path: '',
    population: 2312345,  // Industrial heartland
    goldIncome: 192,     // Textile manufacturing
    industry: 172,       // Leading industrial region
    buildings: [],
    resourceType: 'coal' as ResourceType,
    army: 10123,
  },
  {
    id: 'Lowlands',
    name: 'Lowlands',
    path: '',
    population: 1623456,  // Industrializing Scotland
    goldIncome: 142,     // Textile and shipbuilding
    industry: 92,        // Growing industry
    buildings: [],
    resourceType: 'coal' as ResourceType,
    army: 7123,
  },
  {
    id: 'Highlands',
    name: 'Highlands',
    path: '',
    population: 823456,   // Rural Scotland
    goldIncome: 62,      // Limited economy
    industry: 32,        // Minimal industry
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 3123,
  },
  {
    id: 'Leinster',
    name: 'Leinster',
    path: '',
    population: 1523456,  // Dublin region
    goldIncome: 92,      // Agricultural
    industry: 42,        // Limited industry
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 5123,
  },
  {
    id: 'Ulster',
    name: 'Ulster',
    path: '',
    population: 1234567,  // Northern Ireland
    goldIncome: 82,      // Linen industry
    industry: 52,        // Some industry
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 4123,
  },
  {
    id: 'Connaught',
    name: 'Connaught',
    path: '',
    population: 923456,   // Rural Ireland
    goldIncome: 52,      // Agricultural
    industry: 22,        // Minimal industry
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 3123,
  },
  {
    id: 'Munster',
    name: 'Munster',
    path: '',
    population: 1123456,  // Southern Ireland
    goldIncome: 72,      // Agricultural
    industry: 32,        // Limited industry
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 4123,
  },
  {
    id: 'Malta',
    name: 'Malta',
    path: '',
    population: 123456,   // Mediterranean island
    goldIncome: 42,      // Naval base
    industry: 22,        // Limited industry
    buildings: [],
    resourceType: 'gold' as ResourceType,
    army: 2123,
  }
];

// Prussian provinces with 1836 data
const prussiaProvinces: Province[] = [
  {
    id: 'Brandenburg',
    name: 'Brandenburg',
    path: '',
    population: 2123456,  // Berlin and surroundings
    goldIncome: 180,     // Administrative center
    industry: 150,       // Growing industrial center
    buildings: [],
    resourceType: 'gold' as ResourceType,
    army: 25172,  // Major garrison in Berlin
  },
  {
    id: 'East_Prussia',
    name: 'East Prussia',
    path: '',
    population: 1523456,
    goldIncome: 100,
    industry: 70,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 15000,
  },
  {
    id: 'West_Prussia',
    name: 'West Prussia',
    path: '',
    population: 1623456,
    goldIncome: 110,
    industry: 80,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 18000,
  },
  {
    id: 'Pomerania',
    name: 'Pomerania',
    path: '',
    population: 1423456,
    goldIncome: 90,
    industry: 60,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 12000,
  },
  {
    id: 'Silesia',
    name: 'Silesia',
    path: '',
    population: 2023456,
    goldIncome: 160,
    industry: 140,
    buildings: [],
    resourceType: 'coal' as ResourceType,
    army: 20000,
  },
  {
    id: 'Posen',
    name: 'Posen',
    path: '',
    population: 1323456,
    goldIncome: 80,
    industry: 50,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 10000,
  },
  {
    id: 'Rhineland',
    name: 'Rhineland',
    path: '',
    population: 1923456,
    goldIncome: 170,
    industry: 160,
    buildings: [],
    resourceType: 'coal' as ResourceType,
    army: 22000,
  },
  {
    id: 'Westphalia',
    name: 'Westphalia',
    path: '',
    population: 1823456,
    goldIncome: 150,
    industry: 130,
    buildings: [],
    resourceType: 'coal' as ResourceType,
    army: 18000,
  },
  {
    id: 'Ruhr',
    name: 'Ruhr',
    path: '',
    population: 1723456,
    goldIncome: 190,
    industry: 180,
    buildings: [],
    resourceType: 'coal' as ResourceType,
    army: 16500,
  }
];

// Bavarian provinces with 1836 data
const bavariaProvinces: Province[] = [
  {
    id: 'Bavaria',
    name: 'Bavaria',
    path: '',
    population: 2423456,  // Munich and surroundings
    goldIncome: 160,     // Rich agricultural region
    industry: 100,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 20000,
  },
  {
    id: 'Franconia',
    name: 'Franconia',
    path: '',
    population: 1523456,
    goldIncome: 110,
    industry: 80,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 15000,
  }
];

// Württemberg provinces with 1836 data
const wurttembergProvinces: Province[] = [
  {
    id: 'Wurttemberg',
    name: 'Württemberg',
    path: '',
    population: 1623456,
    goldIncome: 120,
    industry: 90,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 12000,
  }
];

// Baden provinces with 1836 data
const badenProvinces: Province[] = [
  {
    id: 'Baden',
    name: 'Baden',
    path: '',
    population: 1423456,
    goldIncome: 110,
    industry: 85,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 10000,
  }
];

// Saxony provinces with 1836 data
const saxonyProvinces: Province[] = [
  {
    id: 'Saxony',
    name: 'Saxony',
    path: '',
    population: 1823456,
    goldIncome: 140,
    industry: 120,
    buildings: [],
    resourceType: 'coal' as ResourceType,
    army: 15000,
  },
  {
    id: 'Elbe',
    name: 'Elbe',
    path: '',
    population: 1123456,
    goldIncome: 95,
    industry: 85,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 8234,
  },
  {
    id: 'North_Rhine',
    name: 'North Rhine',
    path: '',
    population: 1323456,
    goldIncome: 105,
    industry: 95,
    buildings: [],
    resourceType: 'coal' as ResourceType,
    army: 9234,
  },
  {
    id: 'Hesse',
    name: 'Hesse',
    path: '',
    population: 923456,
    goldIncome: 75,
    industry: 65,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 6123,
  }
];

// Hannover provinces with 1836 data
const hannoverProvinces: Province[] = [
  {
    id: 'Hannover',
    name: 'Hannover',
    path: '',
    population: 1723456,
    goldIncome: 120,
    industry: 80,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 12000,
  },
  {
    id: 'Brunswick',
    name: 'Brunswick',
    path: '',
    population: 823456,
    goldIncome: 70,
    industry: 60,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 6000,
  },
  {
    id: 'Schleswig_Holstein',
    name: 'Schleswig-Holstein',
    path: '',
    population: 923456,
    goldIncome: 85,
    industry: 65,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 7123,
  },
  {
    id: 'Mecklenburg',
    name: 'Mecklenburg',
    path: '',
    population: 723456,
    goldIncome: 65,
    industry: 55,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 5123,
  },
  {
    id: 'Anhalt',
    name: 'Anhalt',
    path: '',
    population: 523456,
    goldIncome: 55,
    industry: 45,
    buildings: [],
    resourceType: 'food' as ResourceType,
    army: 4123,
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

// Create Great Britain nation
const greatBritain: Nation = {
  nationTag: 'ENG',
  name: 'Great Britain',
  color: '#693a2a',
  hexColor: '#693a2a',
  provinces: britainProvinces,
  borderProvinces: null,
  
  // Resources / Stats
  gold: 5000,            // Wealthiest nation
  researchPoints: 150,  // Leading in sciences
  currentResearchId: 'steam_power',
  currentResearchProgress: 50,
  
  // Queue
  buildQueue: [],
  isAI: false
};

// Create Prussia nation
const prussia: Nation = {
  nationTag: 'PRU',
  name: 'Prussia',
  color: '#2a4163',  // Dark Prussian blue
  hexColor: '#2a4163',
  provinces: prussiaProvinces,
  borderProvinces: null,
  
  // Resources / Stats
  gold: 3000,            // Wealthy and industrialized
  researchPoints: 120,   // Leading in sciences
  currentResearchId: 'military_science',
  currentResearchProgress: 40,
  
  // Queue
  buildQueue: [],
  isAI: false
};

// Create Bavaria nation
const bavaria: Nation = {
  nationTag: 'BAV',
  name: 'Bavaria',
  color: '#4a7a9c',  // Light blue
  hexColor: '#4a7a9c',
  provinces: bavariaProvinces,
  borderProvinces: null,
  
  gold: 1500,
  researchPoints: 60,
  currentResearchId: null,
  currentResearchProgress: 0,
  
  buildQueue: null,
  isAI: true
};

// Create Württemberg nation
const wurttemberg: Nation = {
  nationTag: 'WUR',
  name: 'Württemberg',
  color: '#8b2d3d',  // Maroon
  hexColor: '#8b2d3d',
  provinces: wurttembergProvinces,
  borderProvinces: null,
  
  gold: 800,
  researchPoints: 40,
  currentResearchId: null,
  currentResearchProgress: 0,
  
  buildQueue: null,
  isAI: true
};

// Create Baden nation
const baden: Nation = {
  nationTag: 'BAD',
  name: 'Baden',
  color: '#1a4a4d',  // Dark blue-green
  hexColor: '#1a4a4d',
  provinces: badenProvinces,
  borderProvinces: null,
  
  gold: 700,
  researchPoints: 35,
  currentResearchId: null,
  currentResearchProgress: 0,
  
  buildQueue: null,
  isAI: true
};

// Create Saxony nation
const saxony: Nation = {
  nationTag: 'SAX',
  name: 'Saxony',
  color: '#2d5a27',  // Green
  hexColor: '#2d5a27',
  provinces: saxonyProvinces,
  borderProvinces: null,
  
  gold: 1000,
  researchPoints: 50,
  currentResearchId: null,
  currentResearchProgress: 0,
  
  buildQueue: null,
  isAI: true
};

// Create Hannover nation
const hannover: Nation = {
  nationTag: 'HAN',
  name: 'Hannover',
  color: '#7d6c55',  // Light brown parchment
  hexColor: '#7d6c55',
  provinces: hannoverProvinces,
  borderProvinces: null,
  
  gold: 900,
  researchPoints: 45,
  currentResearchId: null,
  currentResearchProgress: 0,
  
  buildQueue: null,
  isAI: true
};

// Create the dummy game
export const world_1836: Game = {
  id: 'game_1',
  gameName: 'Test Game 1',
  date: '1836-01-01',
  mapName: 'world_states',
  playerNationTag: 'FRA',
  nations: [france, belgium, greatBritain, prussia, bavaria, wurttemberg, baden, saxony, hannover]
}; 