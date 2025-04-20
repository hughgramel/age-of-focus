export function getNationFlag(tag: string): string {
  switch(tag) {
    case 'FRA': return '🇫🇷';
    case 'PRU': return '🇩🇪';
    case 'USA': return '🇺🇸';
    case 'GBR': return '🇬🇧';
    case 'RUS': return '🇷🇺';
    case 'AUS': return '🇦🇹';
    case 'ESP': return '🇪🇸';
    case 'POR': return '🇵🇹';
    case 'SWE': return '🇸🇪';
    case 'DEN': return '🇩🇰';
    case 'TUR': return '🇹🇷';
    case 'SAR': return '🇮🇹';
    case 'PAP': return '🇻🇦';
    case 'SIC': return '🇮🇹';
    case 'GRE': return '🇬🇷';
    case 'NET': return '🇳🇱';
    case 'BEL': return '🇧🇪';
    default: return '🏳️';
  }
} 