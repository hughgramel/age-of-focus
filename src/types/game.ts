export type ResourceType = "gold" | "coal" | "iron" | "food" | "none";

export type QueuedBuild = {
  buildingType: string;
  provinceId: string;
  timeStart: number;
  timeFinish: number;
};

export type Building = {
  id: string;
  name: string;
  industryBonus: number;
  goldBonus: number;
  requiredResource?: ResourceType;
};

export type Province = {
  id: string;
  name: string;
  path: string;
  population: number;
  goldIncome: number;
  industry: number;
  buildings: Building[];
  resourceType: ResourceType;
  army: number;  // Number of troops stationed in province
};

export type Nation = {
  nationTag: string;
  name: string;
  color: string;
  hexColor: string;  // Hex color tag for the nation
  provinces: Province[];
  borderProvinces: Province[] | null;

  // Resources / Stats
  gold: number;
  researchPoints: number;
  currentResearchId: string | null;
  currentResearchProgress: number;

  // Queue
  buildQueue: QueuedBuild[] | null;

  isAI: boolean;
};

export type Game = {
  id: string;
  gameName: string;
  date: string;
  mapName: string;
  playerNationTag: string;
  nations: Nation[];
}; 