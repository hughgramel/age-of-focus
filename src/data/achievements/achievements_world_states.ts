export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirements: {
    minGold?: number;
    minIndustry?: number;
    minArmy?: number;
    minPopulation?: number;
    requiredProvinces?: string[];
    minProvinces?: number;
    tag?: string; // nationTag filter
  };
}

export const achievements: Achievement[] = [
  {
    id: 'rich_nation',
    name: 'Wealthy Nation',
    description: 'Establish your nation as an economic powerhouse by accumulating vast wealth.',
    icon: '💰',
    requirements: { minGold: 1000 },
  },
  {
    id: 'industrial_power',
    name: 'Industrial Revolution',
    description: 'Lead your nation through the industrial revolution by developing a strong manufacturing base.',
    icon: '🏭',
    requirements: { minIndustry: 500 },
  },
  {
    id: 'military_might',
    name: 'Military Might',
    description: 'Build a formidable army capable of defending your borders and projecting power abroad.',
    icon: '⚔️',
    requirements: { minArmy: 300 },
  },
  {
    id: 'population_boom',
    name: 'Population Boom',
    description: 'Witness unprecedented population growth as your nation becomes a major demographic power.',
    icon: '👥',
    requirements: { minPopulation: 1000000 },
  },
  {
    id: 'conqueror',
    name: 'Conqueror',
    description: 'Expand your territory through conquest, establishing a vast empire across multiple provinces.',
    icon: '🏰',
    requirements: { requiredProvinces: [], minProvinces: 10 },
  },
  {
    id: 'prussian_glory',
    name: 'Prussian Glory',
    description: 'As Prussia, establish military dominance and control the strategic city of Berlin.',
    icon: '🦅',
    requirements: { tag: 'PRU', requiredProvinces: ['Brandenburg'], minArmy: 500 },
  },
  {
    id: 'french_empire',
    name: 'Napoleonic Legacy',
    description: 'As France, recreate the glory of the Napoleonic era with a powerful military and control of Paris.',
    icon: '🎖️',
    requirements: { tag: 'FRA', requiredProvinces: ['Ile_De_France'], minArmy: 1000 },
  },
  {
    id: 'british_empire',
    name: 'Rule Britannia',
    description: 'As Britain, establish naval supremacy and control key strategic ports across the globe.',
    icon: '⚓',
    requirements: { tag: 'GBR', minProvinces: 15, minGold: 2000 },
  },
  {
    id: 'russian_empire',
    name: 'Russian Bear',
    description: 'As Russia, expand your territory across the vast Eurasian steppe and build a massive army.',
    icon: '🐻',
    requirements: { tag: 'RUS', minProvinces: 20, minArmy: 2000 },
  },
  {
    id: 'ottoman_empire',
    name: 'Ottoman Renaissance',
    description: 'As the Ottoman Empire, modernize your military and maintain control of Constantinople.',
    icon: '🌙',
    requirements: { tag: 'TUR', requiredProvinces: ['constantinople'], minIndustry: 800 },
  },
  {
    id: 'austrian_empire',
    name: 'Habsburg Legacy',
    description: 'As Austria, maintain control of Vienna and establish a strong industrial base.',
    icon: '👑',
    requirements: { tag: 'AUS', requiredProvinces: ['vienna'], minIndustry: 600 },
  },
  {
    id: 'united_states',
    name: 'Manifest Destiny',
    description: 'As the United States, expand westward and establish a strong industrial economy.',
    icon: '🦅',
    requirements: { tag: 'USA', minProvinces: 12, minIndustry: 1000 },
  },
  {
    id: 'german_unification',
    name: 'German Unification',
    description: 'As Prussia, unite the German states and establish a powerful industrial-military complex.',
    icon: '⚡',
    requirements: { tag: 'PRU', minProvinces: 8, minIndustry: 1200, minArmy: 1500 },
  },
  {
    id: 'italian_unification',
    name: 'Risorgimento',
    description: 'As Sardinia-Piedmont, unite the Italian peninsula and establish a modern nation-state.',
    icon: '🍕',
    requirements: { tag: 'SAR', minProvinces: 6, minIndustry: 800, minArmy: 1000 },
  },
  {
    id: 'japanese_modernization',
    name: 'Meiji Restoration',
    description: 'As Japan, modernize your nation and build a powerful industrial and military base.',
    icon: '🗾',
    requirements: { tag: 'JAP', minIndustry: 1500, minArmy: 2000 },
  }
]; 