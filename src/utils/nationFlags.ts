export const getNationFlag = (nationTag: string | undefined): string => {
  switch (nationTag) {
    case 'FRA': return '🇫🇷';
    case 'GBR': return '🇬🇧';
    case 'PRU': return '🇩🇪'; // Using modern German flag as placeholder
    case 'BEL': return '🇧🇪';
    case 'BAV': return '🇩🇪'; // Placeholder
    case 'WUR': return '🇩🇪'; // Placeholder
    case 'BAD': return '🇩🇪'; // Placeholder
    case 'SAX': return '🇩🇪'; // Placeholder
    case 'HAN': return '🇩🇪'; // Placeholder
    case 'SPA': return '🇪🇸'; // Add Spain
    case 'RUS': return '🇷🇺'; // Add Russia
    case 'USA': return '🇺🇸';
    case 'AUS': return '🇦🇹';
    case 'ESP': return '🇪🇸';
    case 'POR': return '🇵🇹';
    case 'SWE': return '🇸🇪'; // Add Sweden
    case 'DEN': return '🇩🇰'; // Add Denmark
    case 'TUR': return '🇹🇷';
    case 'SAR': return '🇮🇹';
    case 'PAP': return '🇻🇦';
    case 'SIC': return '🇮🇹';
    case 'GRE': return '🇬🇷';
    case 'NET': return '🇳🇱'; // Add Netherlands
    case 'AUT': return '🇦🇹'; // Add Austria-Hungary (using AUT tag)
    default: return '🏳️'; // Default white flag
  }
}; 