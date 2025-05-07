export interface ScenarioCountryInfo {
  tag: string;
  name: string;
  flag: string;
  description?: string; // Optional, as not all countries might have detailed descriptions initially
  powerRank: number;
  startingGold: number;
  startingPopulation: number;
  startingIndustry: number;
  startingArmy: number;
}

export interface ScenarioDetails {
  id: string;
  name: string;
  year: number;
  description: string;
  icon: string;
  greatPowers: string[]; // Array of nation tags
  otherPlayableNations: string[]; // Array of nation tags
  mapDataFile: string; // Reference to the world data file, e.g., "world_1836"
  // countryDataFile: string; // We can derive this from nationTags and countries_xxxx for now
} 