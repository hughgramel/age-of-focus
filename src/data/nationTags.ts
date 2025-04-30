export interface NationData {
  name: string;
  capitalProvinceId?: string; // e.g., 'FRA_1' for Paris
}

export const nationDataMap: { [key: string]: NationData } = {
  'FRA': { 
    name: 'France',
    capitalProvinceId: 'FRA_1' // Assuming 'FRA_1' is Paris in your SVG
  },
  'BEL': { name: 'Belgium' }, // Add capital later if needed
  'PRU': { 
    name: 'Prussia',
    capitalProvinceId: 'PRU_5' // Assuming 'PRU_5' is Berlin
  },
  'USA': { name: 'United States' },
  'GBR': { name: 'Great Britain' },
  'RUS': { name: 'Russia' },
  'AUS': { name: 'Austria' },
  'ESP': { name: 'Spain' },
  'POR': { name: 'Portugal' },
  'SWE': { name: 'Sweden' },
  'DEN': { name: 'Denmark' },
  'TUR': { name: 'Ottoman Empire' },
  'SAR': { name: 'Sardinia-Piedmont' },
  'PAP': { name: 'Papal States' },
  'SIC': { name: 'Two Sicilies' },
  'GRE': { name: 'Greece' },
  'NET': { name: 'Netherlands' }
};

export const getNationName = (tag: string): string => {
  return nationDataMap[tag]?.name || tag;
}; 