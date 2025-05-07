import { scenario1836 } from './1836';
import { ScenarioDetails, ScenarioCountryInfo } from './types';

const scenarios: Record<string, ScenarioDetails> = {
  '1836': scenario1836,
  // Add other scenarios here as they are created, e.g.:
  // '1914': scenario1914,
};

export function getScenarioDetails(scenarioId: string): ScenarioDetails | undefined {
  return scenarios[scenarioId];
}

export const AllScenarioDetails: ScenarioDetails[] = Object.values(scenarios);

export type { ScenarioDetails, ScenarioCountryInfo }; 