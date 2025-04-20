export const nationTagToName: { [key: string]: string } = {
  'FRA': 'France',
  'BEL': 'Belgium',
  'PRU': 'Prussia',
  'USA': 'United States',
  'GBR': 'Great Britain',
  'RUS': 'Russia',
  'AUS': 'Austria',
  'ESP': 'Spain',
  'POR': 'Portugal',
  'SWE': 'Sweden',
  'DEN': 'Denmark',
  'TUR': 'Ottoman Empire',
  'SAR': 'Sardinia-Piedmont',
  'PAP': 'Papal States',
  'SIC': 'Two Sicilies',
  'GRE': 'Greece',
  'NET': 'Netherlands'
};

export const getNationName = (tag: string): string => {
  return nationTagToName[tag] || tag;
}; 