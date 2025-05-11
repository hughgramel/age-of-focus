import { Game, Nation, Province, ResourceType } from '@/types/game';
import { ScenarioDetails } from './scenarios/types'; // Assuming types.ts is in a scenarios subfolder

// Define all provinces with ownerTag for 1936
const allProvinces_1936: Province[] = [
  // == FRANCE ==
  {
    id: 'Ile_De_France', name: 'Île-de-France', ownerTag: 'FRA', path: '',
    population: Math.floor(3512347 * 1.5), goldIncome: 300, industry: 220, buildings: [], resourceType: 'gold' as ResourceType, army: 30000,
  },
  {
    id: 'Normandy', name: 'Normandy', ownerTag: 'FRA', path: '',
    population: Math.floor(2187432 * 1.5), goldIncome: 180, industry: 150, buildings: [], resourceType: 'food' as ResourceType, army: 18000,
  },
  {
    id: 'Brittany', name: 'Brittany', ownerTag: 'FRA', path: '',
    population: Math.floor(2134567 * 1.5), goldIncome: 150, industry: 110, buildings: [], resourceType: 'food' as ResourceType, army: 15000,
  },
  { // Alsace-Lorraine to FRANCE
    id: 'Alsace_Lorraine', name: 'Alsace-Lorraine', ownerTag: 'FRA', path: '',
    population: Math.floor(1876543 * 1.5), goldIncome: 140, industry: 150, buildings: [], resourceType: 'coal' as ResourceType, army: 20000,
  },
  {
    id: 'Rhone', name: 'Rhône', ownerTag: 'FRA', path: '',
    population: Math.floor(2045678 * 1.5), goldIncome: 200, industry: 190, buildings: [], resourceType: 'gold' as ResourceType, army: 22000,
  },
  {
    id: 'Provence', name: 'Provence', ownerTag: 'FRA', path: '',
    population: Math.floor(1723456 * 1.5), goldIncome: 180, industry: 120, buildings: [], resourceType: 'food' as ResourceType, army: 18000,
  },
  {
    id: 'Languedoc', name: 'Languedoc', ownerTag: 'FRA', path: '',
    population: Math.floor(1923456 * 1.5), goldIncome: 160, industry: 110, buildings: [], resourceType: 'food' as ResourceType, army: 15000,
  },
  {
    id: 'Guyenne', name: 'Guyenne', ownerTag: 'FRA', path: '',
    population: Math.floor(1845678 * 1.5), goldIncome: 170, industry: 120, buildings: [], resourceType: 'food' as ResourceType, army: 13000,
  },
  {
    id: 'Burgundy', name: 'Burgundy', ownerTag: 'FRA', path: '',
    population: Math.floor(1634567 * 1.5), goldIncome: 160, industry: 130, buildings: [], resourceType: 'food' as ResourceType, army: 15000,
  },
  {
    id: 'Champagne', name: 'Champagne', ownerTag: 'FRA', path: '',
    population: Math.floor(1523456 * 1.5), goldIncome: 170, industry: 120, buildings: [], resourceType: 'food' as ResourceType, army: 13000,
  },
  {
    id: 'French_Low_Countries', name: 'French Low Countries', ownerTag: 'FRA', path: '',
    population: Math.floor(2045678 * 1.5), goldIncome: 190, industry: 170, buildings: [], resourceType: 'coal' as ResourceType, army: 25000,
  },
  {
    id: 'Picardy', name: 'Picardy', ownerTag: 'FRA', path: '',
    population: Math.floor(1823456 * 1.5), goldIncome: 150, industry: 130, buildings: [], resourceType: 'food' as ResourceType, army: 18000,
  },
  {
    id: 'Orleans', name: 'Orléans', ownerTag: 'FRA', path: '',
    population: Math.floor(1634567 * 1.5), goldIncome: 140, industry: 110, buildings: [], resourceType: 'food' as ResourceType, army: 13000,
  },
  {
    id: 'Maine_Anjou', name: 'Maine-Anjou', ownerTag: 'FRA', path: '',
    population: Math.floor(1523456 * 1.5), goldIncome: 130, industry: 100, buildings: [], resourceType: 'food' as ResourceType, army: 10000,
  },
  {
    id: 'Poitou', name: 'Poitou', ownerTag: 'FRA', path: '',
    population: Math.floor(1423456 * 1.5), goldIncome: 120, industry: 90, buildings: [], resourceType: 'food' as ResourceType, army: 10000,
  },
  {
    id: 'Auvergne_Limousin', name: 'Auvergne-Limousin', ownerTag: 'FRA', path: '',
    population: Math.floor(1723456 * 1.5), goldIncome: 130, industry: 100, buildings: [], resourceType: 'coal' as ResourceType, army: 13000,
  },
  {
    id: 'Aquitaine', name: 'Aquitaine', ownerTag: 'FRA', path: '',
    population: Math.floor(1634567 * 1.5), goldIncome: 140, industry: 100, buildings: [], resourceType: 'food' as ResourceType, army: 15000,
  },
  {
    id: 'Franche_Comte', name: 'Franche-Comté', ownerTag: 'FRA', path: '',
    population: Math.floor(1423456 * 1.5), goldIncome: 130, industry: 110, buildings: [], resourceType: 'iron' as ResourceType, army: 18000,
  },
  {
    id: 'Lorraine', name: 'Lorraine', ownerTag: 'FRA', path: '',
    population: Math.floor(1423456 * 1.5), goldIncome: 130, industry: 120, buildings: [], resourceType: 'iron' as ResourceType, army: 20000,
  },

  // == BELGIUM ==
  {
    id: 'Flanders', name: 'Flanders', ownerTag: 'BEL', path: '',
    population: Math.floor(2234567 * 1.5), goldIncome: 110, industry: 100, buildings: [], resourceType: 'coal' as ResourceType, army: 18000,
  },
  {
    id: 'Wallonia', name: 'Wallonia', ownerTag: 'BEL', path: '',
    population: Math.floor(1823456 * 1.5), goldIncome: 100, industry: 95, buildings: [], resourceType: 'iron' as ResourceType, army: 12000,
  },

  // == GREAT BRITAIN ==
  {
    id: 'Wales', name: 'Wales', ownerTag: 'GBR', path: '',
    population: Math.floor(1234567 * 1.4), goldIncome: 100, industry: 90, buildings: [], resourceType: 'coal' as ResourceType, army: 8000,
  },
  {
    id: 'Midlands', name: 'Midlands', ownerTag: 'GBR', path: '',
    population: Math.floor(2512345 * 1.45), goldIncome: 240, industry: 220, buildings: [], resourceType: 'coal' as ResourceType, army: 14000,
  },
  {
    id: 'East_Anglia', name: 'East Anglia', ownerTag: 'GBR', path: '',
    population: Math.floor(1523456 * 1.4), goldIncome: 140, industry: 60, buildings: [], resourceType: 'food' as ResourceType, army: 6000,
  },
  {
    id: 'West_Country', name: 'West Country', ownerTag: 'GBR', path: '',
    population: Math.floor(1823456 * 1.4), goldIncome: 120, industry: 70, buildings: [], resourceType: 'food' as ResourceType, army: 8000,
  },
  {
    id: 'Home_Counties', name: 'Home Counties', ownerTag: 'GBR', path: '',
    population: Math.floor(2012345 * 1.5), goldIncome: 210, industry: 100, buildings: [], resourceType: 'gold' as ResourceType, army: 11000,
  },
  {
    id: 'Yorkshire', name: 'Yorkshire', ownerTag: 'GBR', path: '',
    population: Math.floor(2212345 * 1.45), goldIncome: 200, industry: 190, buildings: [], resourceType: 'coal' as ResourceType, army: 13000,
  },
  {
    id: 'Lancashire', name: 'Lancashire', ownerTag: 'GBR', path: '',
    population: Math.floor(2312345 * 1.45), goldIncome: 230, industry: 210, buildings: [], resourceType: 'coal' as ResourceType, army: 14000,
  },
  {
    id: 'Lowlands', name: 'Lowlands', ownerTag: 'GBR', path: '',
    population: Math.floor(1623456 * 1.4), goldIncome: 170, industry: 120, buildings: [], resourceType: 'coal' as ResourceType, army: 10000,
  },
  {
    id: 'Highlands', name: 'Highlands', ownerTag: 'GBR', path: '',
    population: Math.floor(823456 * 1.3), goldIncome: 80, industry: 50, buildings: [], resourceType: 'food' as ResourceType, army: 5000,
  },
  { // Irish provinces kept as GBR for now
    id: 'Leinster', name: 'Leinster', ownerTag: 'GBR', path: '',
    population: Math.floor(1523456 * 1.3), goldIncome: 110, industry: 60, buildings: [], resourceType: 'food' as ResourceType, army: 7000,
  },
   {
    id: 'Ulster', name: 'Ulster', ownerTag: 'GBR', path: '', // Northern Ireland
    population: Math.floor(1234567 * 1.35), goldIncome: 100, industry: 70, buildings: [], resourceType: 'food' as ResourceType, army: 6000,
  },
  {
    id: 'Connaught', name: 'Connaught', ownerTag: 'GBR', path: '',
    population: Math.floor(923456 * 1.2), goldIncome: 70, industry: 40, buildings: [], resourceType: 'food' as ResourceType, army: 4000,
  },
  {
    id: 'Munster', name: 'Munster', ownerTag: 'GBR', path: '',
    population: Math.floor(1123456 * 1.25), goldIncome: 90, industry: 50, buildings: [], resourceType: 'food' as ResourceType, army: 5000,
  },
  {
    id: 'Malta', name: 'Malta', ownerTag: 'GBR', path: '',
    population: Math.floor(123456 * 1.8), goldIncome: 60, industry: 40, buildings: [], resourceType: 'gold' as ResourceType, army: 3500,
  },

  // == GERMANY == (Existing German provinces from previous commit, adjusted for Alsace-Lorraine change)
  {
    id: 'Brandenburg', name: 'Brandenburg', ownerTag: 'GER', path: '',
    population: Math.floor(2123456 * 1.6), goldIncome: 280, industry: 250, buildings: [], resourceType: 'gold' as ResourceType, army: 40000,
  },
  {
    id: 'East_Prussia', name: 'East Prussia', ownerTag: 'GER', path: '',
    population: Math.floor(1523456 * 1.6), goldIncome: 160, industry: 110, buildings: [], resourceType: 'food' as ResourceType, army: 25000,
  },
  {
    id: 'West_Prussia', name: 'West Prussia', ownerTag: 'GER', path: '',
    population: Math.floor(1623456 * 1.6), goldIncome: 170, industry: 120, buildings: [], resourceType: 'food' as ResourceType, army: 28000,
  },
  {
    id: 'Pomerania', name: 'Pomerania', ownerTag: 'GER', path: '',
    population: Math.floor(1423456 * 1.6), goldIncome: 140, industry: 100, buildings: [], resourceType: 'food' as ResourceType, army: 20000,
  },
  {
    id: 'Silesia', name: 'Silesia', ownerTag: 'GER', path: '',
    population: Math.floor(2023456 * 1.7), goldIncome: 260, industry: 240, buildings: [], resourceType: 'coal' as ResourceType, army: 35000,
  },
  {
    id: 'Posen', name: 'Posen', ownerTag: 'GER', path: '', // Could be POL
    population: Math.floor(1323456 * 1.6), goldIncome: 130, industry: 80, buildings: [], resourceType: 'food' as ResourceType, army: 18000,
  },
  {
    id: 'Rhineland', name: 'Rhineland', ownerTag: 'GER', path: '',
    population: Math.floor(1923456 * 1.7), goldIncome: 270, industry: 260, buildings: [], resourceType: 'coal' as ResourceType, army: 38000,
  },
  {
    id: 'Westphalia', name: 'Westphalia', ownerTag: 'GER', path: '',
    population: Math.floor(1823456 * 1.7), goldIncome: 240, industry: 220, buildings: [], resourceType: 'coal' as ResourceType, army: 30000,
  },
  {
    id: 'Ruhr', name: 'Ruhr', ownerTag: 'GER', path: '',
    population: Math.floor(1723456 * 1.8), goldIncome: 300, industry: 300, buildings: [], resourceType: 'coal' as ResourceType, army: 28000,
  },
  {
    id: 'Bavaria', name: 'Bavaria', ownerTag: 'GER', path: '',
    population: Math.floor(2423456 * 1.6), goldIncome: 250, industry: 160, buildings: [], resourceType: 'food' as ResourceType, army: 30000,
  },
  {
    id: 'Franconia', name: 'Franconia', ownerTag: 'GER', path: '',
    population: Math.floor(1523456 * 1.6), goldIncome: 170, industry: 120, buildings: [], resourceType: 'food' as ResourceType, army: 25000,
  },
  {
    id: 'Wurttemberg', name: 'Württemberg', ownerTag: 'GER', path: '',
    population: Math.floor(1623456 * 1.6), goldIncome: 190, industry: 140, buildings: [], resourceType: 'food' as ResourceType, army: 20000,
  },
  {
    id: 'Baden', name: 'Baden', ownerTag: 'GER', path: '',
    population: Math.floor(1423456 * 1.6), goldIncome: 170, industry: 130, buildings: [], resourceType: 'food' as ResourceType, army: 18000,
  },
  {
    id: 'Saxony', name: 'Saxony', ownerTag: 'GER', path: '',
    population: Math.floor(1823456 * 1.65), goldIncome: 220, industry: 200, buildings: [], resourceType: 'coal' as ResourceType, army: 27000,
  },
  {
    id: 'Elbe', name: 'Elbe', ownerTag: 'GER', path: '',
    population: Math.floor(1123456 * 1.6), goldIncome: 150, industry: 130, buildings: [], resourceType: 'food' as ResourceType, army: 15000,
  },
  {
    id: 'North_Rhine', name: 'North Rhine', ownerTag: 'GER', path: '',
    population: Math.floor(1323456 * 1.7), goldIncome: 160, industry: 150, buildings: [], resourceType: 'coal' as ResourceType, army: 17000,
  },
  {
    id: 'Hesse', name: 'Hesse', ownerTag: 'GER', path: '',
    population: Math.floor(923456 * 1.6), goldIncome: 120, industry: 100, buildings: [], resourceType: 'food' as ResourceType, army: 10000,
  },
  {
    id: 'Hannover', name: 'Hannover', ownerTag: 'GER', path: '',
    population: Math.floor(1723456 * 1.6), goldIncome: 190, industry: 120, buildings: [], resourceType: 'food' as ResourceType, army: 20000,
  },
  {
    id: 'Brunswick', name: 'Brunswick', ownerTag: 'GER', path: '',
    population: Math.floor(823456 * 1.6), goldIncome: 110, industry: 90, buildings: [], resourceType: 'food' as ResourceType, army: 9000,
  },
  { // Schleswig-Holstein remains GER
    id: 'Schleswig_Holstein', name: 'Schleswig-Holstein', ownerTag: 'GER', path: '',
    population: Math.floor( (923456 + 600000) * 0.8 * 1.6), goldIncome: 140, industry: 100, buildings: [], resourceType: 'food' as ResourceType, army: 12000,
  },
  {
    id: 'Mecklenburg', name: 'Mecklenburg', ownerTag: 'GER', path: '',
    population: Math.floor(723456 * 1.6), goldIncome: 100, industry: 80, buildings: [], resourceType: 'food' as ResourceType, army: 8000,
  },
  {
    id: 'Anhalt', name: 'Anhalt', ownerTag: 'GER', path: '',
    population: Math.floor(523456 * 1.6), goldIncome: 80, industry: 70, buildings: [], resourceType: 'food' as ResourceType, army: 7000,
  },
  // Austria (Anschluss)
  {
    id: 'Austria', name: 'Austria (Ostmark)', ownerTag: 'GER', path: '',
    population: Math.floor(2500000 * 1.3), goldIncome: 200, industry: 140, buildings: [], resourceType: 'gold' as ResourceType, army: 25000,
  },
  {
    id: 'Styria', name: 'Styria', ownerTag: 'GER', path: '',
    population: Math.floor(1000000 * 1.3), goldIncome: 80, industry: 70, buildings: [], resourceType: 'iron' as ResourceType, army: 10000,
  },
   {
    id: 'Tyrol', name: 'Tyrol', ownerTag: 'GER', path: '',
    population: Math.floor(900000 * 1.3), goldIncome: 70, industry: 60, buildings: [], resourceType: 'iron' as ResourceType, army: 9000,
  },
  // Sudetenland (from Czechoslovakia)
  {
    id: 'Bohemia', name: 'Bohemia (Protectorate)', ownerTag: 'GER', path: '',
    population: Math.floor(4000000 * 1.2), goldIncome: 170, industry: 160, buildings: [], resourceType: 'coal' as ResourceType, army: 30000,
  },
  {
    id: 'Moravia', name: 'Moravia (Protectorate)', ownerTag: 'GER', path: '',
    population: Math.floor(2000000 * 1.2), goldIncome: 100, industry: 90, buildings: [], resourceType: 'coal' as ResourceType, army: 18000,
  },

  // == NETHERLANDS ==
  {
    id: 'Holland', name: 'Holland', ownerTag: 'NET', path: '',
    population: Math.floor(1500000 * 1.5), goldIncome: 180, industry: 120, buildings: [], resourceType: 'gold' as ResourceType, army: 12000,
  },
  {
    id: 'Gelre', name: 'Gelre', ownerTag: 'NET', path: '',
    population: Math.floor(800000 * 1.5), goldIncome: 80, industry: 60, buildings: [], resourceType: 'food' as ResourceType, army: 6000,
  },
  {
    id: 'Friesland', name: 'Friesland', ownerTag: 'NET', path: '',
    population: Math.floor(600000 * 1.5), goldIncome: 70, industry: 50, buildings: [], resourceType: 'food' as ResourceType, army: 5000,
  },
  // Dutch East Indies - Added/Updated
  {
    id: 'West_Java', name: 'West Java', ownerTag: 'NET', path: '',
    population: Math.floor(2500000 * 1.7), goldIncome: 70, industry: 50, buildings: [], resourceType: 'food' as ResourceType, army: 3500,
  },
  {
    id: 'Central_Java', name: 'Central Java', ownerTag: 'NET', path: '',
    population: Math.floor(3000000 * 1.7), goldIncome: 80, industry: 55, buildings: [], resourceType: 'food' as ResourceType, army: 4000,
  },
  {
    id: 'East_Java', name: 'East Java', ownerTag: 'NET', path: '',
    population: Math.floor(2800000 * 1.7), goldIncome: 75, industry: 52, buildings: [], resourceType: 'food' as ResourceType, army: 3800,
  },
   {
    id: 'South_Sumatra', name: 'South Sumatra', ownerTag: 'NET', path: '',
    population: Math.floor(900000*1.6), goldIncome: 40, industry: 30, buildings: [], resourceType: 'food' as ResourceType, army: 2000,
  },
  {
    id: 'North_Sumatra', name: 'North Sumatra', ownerTag: 'NET', path: '',
    population: Math.floor(800000*1.6), goldIncome: 38, industry: 28, buildings: [], resourceType: 'food' as ResourceType, army: 1900,
  },
   {
    id: 'Aceh', name: 'Aceh', ownerTag: 'NET', path: '',
    population: Math.floor(400000*1.5), goldIncome: 25, industry: 20, buildings: [], resourceType: 'food' as ResourceType, army: 1000,
  },
   {
    id: 'Sunda_Islands', name: 'Sunda Islands', ownerTag: 'NET', path: '',
    population: Math.floor(1500000*1.6), goldIncome: 45, industry: 35, buildings: [], resourceType: 'food' as ResourceType, army: 2200,
  },
  {
    id: 'Moluccas', name: 'Moluccas', ownerTag: 'NET', path: '',
    population: Math.floor(600000*1.5), goldIncome: 30, industry: 25, buildings: [], resourceType: 'gold' as ResourceType, army: 1200,
  },
  {
    id: 'Celebes', name: 'Celebes', ownerTag: 'NET', path: '',
    population: Math.floor(1200000*1.6), goldIncome: 40, industry: 30, buildings: [], resourceType: 'food' as ResourceType, army: 2000,
  },
  {
    id: 'Western_New_Guinea', name: 'Western New Guinea', ownerTag: 'NET', path: '',
    population: Math.floor(100000*1.5), goldIncome: 15, industry: 12, buildings: [], resourceType: 'food' as ResourceType, army: 500,
  },
  {
    id: 'West_Borneo', name: 'West Borneo', ownerTag: 'NET', path: '',
    population: Math.floor(500000*1.6), goldIncome: 25, industry: 20, buildings: [], resourceType: 'food' as ResourceType, army: 1000,
  },
  {
    id: 'East_Borneo', name: 'East Borneo', ownerTag: 'NET', path: '',
    population: Math.floor(400000*1.6), goldIncome: 22, industry: 18, buildings: [], resourceType: 'food' as ResourceType, army: 900,
  },


  // == SPAIN ==
  {
    id: 'Galicia', name: 'Galicia', ownerTag: 'SPA', path: '',
    population: Math.floor(1800000 * 1.4), goldIncome: 80, industry: 60, buildings: [], resourceType: 'food' as ResourceType, army: 8000,
  },
  {
    id: 'Castile', name: 'Castile', ownerTag: 'SPA', path: '',
    population: Math.floor(2500000 * 1.4), goldIncome: 120, industry: 90, buildings: [], resourceType: 'food' as ResourceType, army: 15000,
  },
  {
    id: 'Toledo', name: 'Toledo', ownerTag: 'SPA', path: '',
    population: Math.floor(1500000 * 1.4), goldIncome: 90, industry: 70, buildings: [], resourceType: 'food' as ResourceType, army: 9000,
  },
  {
    id: 'Asturias', name: 'Asturias', ownerTag: 'SPA', path: '',
    population: Math.floor(1200000 * 1.4), goldIncome: 70, industry: 80, buildings: [], resourceType: 'coal' as ResourceType, army: 6000,
  },
  {
    id: 'Navarra', name: 'Navarra', ownerTag: 'SPA', path: '',
    population: Math.floor(800000 * 1.4), goldIncome: 60, industry: 50, buildings: [], resourceType: 'iron' as ResourceType, army: 5000,
  },
  {
    id: 'Aragon', name: 'Aragon', ownerTag: 'SPA', path: '',
    population: Math.floor(1400000 * 1.4), goldIncome: 85, industry: 65, buildings: [], resourceType: 'food' as ResourceType, army: 7500,
  },
  {
    id: 'Catalonia', name: 'Catalonia', ownerTag: 'SPA', path: '',
    population: Math.floor(1900000 * 1.45), goldIncome: 110, industry: 100, buildings: [], resourceType: 'food' as ResourceType, army: 12000,
  },
  {
    id: 'Granada', name: 'Granada', ownerTag: 'SPA', path: '',
    population: Math.floor(1300000 * 1.4), goldIncome: 75, industry: 55, buildings: [], resourceType: 'food' as ResourceType, army: 7000,
  },
  {
    id: 'Andalusia', name: 'Andalusia', ownerTag: 'SPA', path: '',
    population: Math.floor(2200000 * 1.4), goldIncome: 100, industry: 75, buildings: [], resourceType: 'food' as ResourceType, army: 10000,
  },
  {
    id: 'Valencia', name: 'Valencia', ownerTag: 'SPA', path: '',
    population: Math.floor(1600000 * 1.4), goldIncome: 95, industry: 70, buildings: [], resourceType: 'food' as ResourceType, army: 8500,
  },
  {
    id: 'Badajoz', name: 'Badajoz', ownerTag: 'SPA', path: '',
    population: Math.floor(1100000 * 1.4), goldIncome: 65, industry: 45, buildings: [], resourceType: 'food' as ResourceType, army: 5500,
  },
  {
    id: 'Baleares', name: 'Baleares', ownerTag: 'SPA', path: '',
    population: Math.floor(300000 * 1.5), goldIncome: 40, industry: 20, buildings: [], resourceType: 'food' as ResourceType, army: 1500,
  },
  {
    id: 'Cuba', name: 'Cuba', ownerTag: 'SPA', path: '', // Or independent/USA by 1936, kept SPA for now
    population: Math.floor(1000000 * 1.8), goldIncome: 60, industry: 40, buildings: [], resourceType: 'gold' as ResourceType, army: 5000,
  },
  {
    id: 'Luzon', name: 'Luzon', ownerTag: 'SPA', path: '', // Or independent/USA, kept SPA for now
    population: Math.floor(2000000 * 1.7), goldIncome: 50, industry: 30, buildings: [], resourceType: 'food' as ResourceType, army: 4000,
  },
   {
    id: 'Visayas', name: 'Visayas', ownerTag: 'SPA', path: '',
    population: Math.floor(1500000*1.6), goldIncome: 40, industry: 25, buildings: [], resourceType: 'food' as ResourceType, army: 2500,
  },
  {
    id: 'Mindanao', name: 'Mindanao', ownerTag: 'SPA', path: '',
    population: Math.floor(800000*1.6), goldIncome: 25, industry: 20, buildings: [], resourceType: 'food' as ResourceType, army: 1500,
  },


  // == SOVIET UNION (formerly Russia) ==
  {
    id: 'Moscow', name: 'Moscow', ownerTag: 'SOV', path: '',
    population: Math.floor(2500000 * 1.7), goldIncome: 250, industry: 220, buildings: [], resourceType: 'gold' as ResourceType, army: 50000,
  },
  {
    id: 'Bessarabia', name: 'Bessarabia', ownerTag: 'SOV', path: '', // Contested with Romania
    population: Math.floor(900000 * 1.6), goldIncome: 50, industry: 40, buildings: [], resourceType: 'food' as ResourceType, army: 7000,
  },
  {
    id: 'Kiev', name: 'Kiev', ownerTag: 'SOV', path: '',
    population: Math.floor(1500000 * 1.7), goldIncome: 90, industry: 80, buildings: [], resourceType: 'food' as ResourceType, army: 15000,
  },
  {
    id: 'Cherson', name: 'Cherson', ownerTag: 'SOV', path: '',
    population: Math.floor(1200000 * 1.6), goldIncome: 70, industry: 60, buildings: [], resourceType: 'food' as ResourceType, army: 10000,
  },
  {
    id: 'Taurida', name: 'Taurida', ownerTag: 'SOV', path: '',
    population: Math.floor(800000 * 1.6), goldIncome: 60, industry: 50, buildings: [], resourceType: 'food' as ResourceType, army: 8000,
  },
  {
    id: 'Crimea', name: 'Crimea', ownerTag: 'SOV', path: '',
    population: Math.floor(500000 * 1.7), goldIncome: 50, industry: 40, buildings: [], resourceType: 'food' as ResourceType, army: 6000,
  },
  {
    id: 'Kuban', name: 'Kuban', ownerTag: 'SOV', path: '',
    population: Math.floor(1000000 * 1.6), goldIncome: 60, industry: 50, buildings: [], resourceType: 'food' as ResourceType, army: 9000,
  },
  {
    id: 'Elizavetpol', name: 'Elizavetpol (Ganja)', ownerTag: 'SOV', path: '', // Part of Azerbaijan SSR
    population: Math.floor(600000 * 1.6), goldIncome: 40, industry: 30, buildings: [], resourceType: 'iron' as ResourceType, army: 4000,
  },
  {
    id: 'Armenia', name: 'Armenia (SSR)', ownerTag: 'SOV', path: '',
    population: Math.floor(700000 * 1.6), goldIncome: 45, industry: 35, buildings: [], resourceType: 'iron' as ResourceType, army: 4500,
  },
  {
    id: 'Greater_Caucasus', name: 'Greater Caucasus', ownerTag: 'SOV', path: '',
    population: Math.floor(400000 * 1.5), goldIncome: 25, industry: 20, buildings: [], resourceType: 'iron' as ResourceType, army: 3000,
  },
  {
    id: 'Azerbaijan', name: 'Azerbaijan (Baku)', ownerTag: 'SOV', path: '', // Oil!
    population: Math.floor(900000 * 1.8), goldIncome: 100, industry: 80, buildings: [], resourceType: 'gold' as ResourceType, army: 7000,
  },
  {
    id: 'Stavropol', name: 'Stavropol', ownerTag: 'SOV', path: '',
    population: Math.floor(1100000 * 1.6), goldIncome: 65, industry: 55, buildings: [], resourceType: 'food' as ResourceType, army: 9500,
  },
  {
    id: 'Astrakhan', name: 'Astrakhan', ownerTag: 'SOV', path: '',
    population: Math.floor(800000 * 1.6), goldIncome: 50, industry: 40, buildings: [], resourceType: 'food' as ResourceType, army: 7000,
  },
  {
    id: 'Rostov', name: 'Rostov', ownerTag: 'SOV', path: '',
    population: Math.floor(1300000 * 1.7), goldIncome: 80, industry: 70, buildings: [], resourceType: 'coal' as ResourceType, army: 12000,
  },
  {
    id: 'Kharkov', name: 'Kharkov', ownerTag: 'SOV', path: '',
    population: Math.floor(1400000 * 1.7), goldIncome: 90, industry: 80, buildings: [], resourceType: 'coal' as ResourceType, army: 13000,
  },
  {
    id: 'Kursk', name: 'Kursk', ownerTag: 'SOV', path: '',
    population: Math.floor(1600000 * 1.6), goldIncome: 90, industry: 80, buildings: [], resourceType: 'iron' as ResourceType, army: 14000,
  },
  {
    id: 'Chernihiv', name: 'Chernihiv', ownerTag: 'SOV', path: '',
    population: Math.floor(1200000 * 1.6), goldIncome: 70, industry: 60, buildings: [], resourceType: 'food' as ResourceType, army: 10000,
  },
  {
    id: 'Mogilev', name: 'Mogilev', ownerTag: 'SOV', path: '',
    population: Math.floor(1100000 * 1.6), goldIncome: 65, industry: 55, buildings: [], resourceType: 'food' as ResourceType, army: 9000,
  },
  {
    id: 'Minsk', name: 'Minsk', ownerTag: 'SOV', path: '',
    population: Math.floor(1300000 * 1.7), goldIncome: 80, industry: 70, buildings: [], resourceType: 'food' as ResourceType, army: 11000,
  },
  {
    id: 'Brest', name: 'Brest', ownerTag: 'SOV', path: '', // Border with Poland
    population: Math.floor(1000000 * 1.6), goldIncome: 60, industry: 50, buildings: [], resourceType: 'food' as ResourceType, army: 8000,
  },
  {
    id: 'Volhynia', name: 'Volhynia', ownerTag: 'SOV', path: '', // Border with Poland
    population: Math.floor(1400000 * 1.6), goldIncome: 80, industry: 70, buildings: [], resourceType: 'food' as ResourceType, army: 11000,
  },
  // Polish areas from 1836 Russia are now POL or GER/SOV contested
  // Lesser_Poland, Greater_Poland, Mazovia are already POL
  {
    id: 'Vilnius', name: 'Vilnius', ownerTag: 'POL', path: '', // Historically Polish in 1936
    population: Math.floor(900000 * 1.5), goldIncome: 55, industry: 45, buildings: [], resourceType: 'food' as ResourceType, army: 7000,
  },
  {
    id: 'Kaunas', name: 'Kaunas', ownerTag: 'LIT', path: '', // Lithuania independent, placeholder
    population: Math.floor(800000 * 1.5), goldIncome: 50, industry: 40, buildings: [], resourceType: 'food' as ResourceType, army: 6000,
  },
  {
    id: 'Courland', name: 'Courland', ownerTag: 'LAT', path: '', // Latvia independent, placeholder
    population: Math.floor(600000 * 1.5), goldIncome: 40, industry: 30, buildings: [], resourceType: 'food' as ResourceType, army: 5000,
  },
  {
    id: 'Tartu', name: 'Tartu', ownerTag: 'EST', path: '', // Estonia independent, placeholder
    population: Math.floor(400000 * 1.5), goldIncome: 30, industry: 20, buildings: [], resourceType: 'food' as ResourceType, army: 4000,
  },
  {
    id: 'Talinn', name: 'Talinn', ownerTag: 'EST', path: '', // Estonia
    population: Math.floor(300000 * 1.6), goldIncome: 35, industry: 25, buildings: [], resourceType: 'food' as ResourceType, army: 3500,
  },
  {
    id: 'Riga', name: 'Riga', ownerTag: 'LAT', path: '', // Latvia
    population: Math.floor(700000 * 1.6), goldIncome: 60, industry: 50, buildings: [], resourceType: 'food' as ResourceType, army: 6000,
  },
  {
    id: 'Vitebsk', name: 'Vitebsk', ownerTag: 'SOV', path: '',
    population: Math.floor(900000 * 1.6), goldIncome: 55, industry: 45, buildings: [], resourceType: 'food' as ResourceType, army: 7000,
  },
  {
    id: 'Pskov', name: 'Pskov', ownerTag: 'SOV', path: '',
    population: Math.floor(700000 * 1.6), goldIncome: 45, industry: 40, buildings: [], resourceType: 'food' as ResourceType, army: 6000,
  },
  {
    id: 'Novgorod', name: 'Novgorod', ownerTag: 'SOV', path: '',
    population: Math.floor(800000 * 1.6), goldIncome: 50, industry: 45, buildings: [], resourceType: 'food' as ResourceType, army: 6500,
  },
  {
    id: 'Ingria', name: 'Ingria (Leningrad)', ownerTag: 'SOV', path: '',
    population: Math.floor(1000000 * 1.8), goldIncome: 100, industry: 90, buildings: [], resourceType: 'iron' as ResourceType, army: 10000,
  },
  { // Finland independent, these are Finnish provinces
    id: 'West_Karelia', name: 'West Karelia', ownerTag: 'FIN', path: '',
    population: Math.floor(300000 * 1.5), goldIncome: 20, industry: 15, buildings: [], resourceType: 'food' as ResourceType, army: 3000,
  },
  {
    id: 'Kuopio', name: 'Kuopio', ownerTag: 'FIN', path: '',
    population: Math.floor(400000 * 1.5), goldIncome: 25, industry: 20, buildings: [], resourceType: 'food' as ResourceType, army: 3500,
  },
  {
    id: 'Uusimaa', name: 'Uusimaa (Helsinki)', ownerTag: 'FIN', path: '',
    population: Math.floor(500000 * 1.7), goldIncome: 50, industry: 40, buildings: [], resourceType: 'food' as ResourceType, army: 5000,
  },
  {
    id: 'Ostrobothnia', name: 'Ostrobothnia', ownerTag: 'FIN', path: '',
    population: Math.floor(600000 * 1.5), goldIncome: 35, industry: 25, buildings: [], resourceType: 'food' as ResourceType, army: 4000,
  },
  {
    id: 'Oulu', name: 'Oulu', ownerTag: 'FIN', path: '',
    population: Math.floor(200000 * 1.5), goldIncome: 15, industry: 10, buildings: [], resourceType: 'food' as ResourceType, army: 1500,
  },
  {
    id: 'East_Karelia', name: 'East Karelia', ownerTag: 'SOV', path: '', // Contested with Finland
    population: Math.floor(400000 * 1.5), goldIncome: 25, industry: 20, buildings: [], resourceType: 'food' as ResourceType, army: 3000,
  },
  {
    id: 'Oryol', name: 'Oryol', ownerTag: 'SOV', path: '',
    population: Math.floor(1700000 * 1.6), goldIncome: 95, industry: 85, buildings: [], resourceType: 'food' as ResourceType, army: 14000,
  },
  {
    id: 'Smolensk', name: 'Smolensk', ownerTag: 'SOV', path: '',
    population: Math.floor(1400000 * 1.6), goldIncome: 80, industry: 70, buildings: [], resourceType: 'food' as ResourceType, army: 11000,
  },
  {
    id: 'Tver', name: 'Tver (Kalinin)', ownerTag: 'SOV', path: '',
    population: Math.floor(1000000 * 1.6), goldIncome: 60, industry: 50, buildings: [], resourceType: 'food' as ResourceType, army: 8000,
  },
  {
    id: 'Yaroslavl', name: 'Yaroslavl', ownerTag: 'SOV', path: '',
    population: Math.floor(1100000 * 1.6), goldIncome: 65, industry: 55, buildings: [], resourceType: 'food' as ResourceType, army: 8500,
  },
  {
    id: 'Nizhny_Novgorod', name: 'Nizhny Novgorod (Gorky)', ownerTag: 'SOV', path: '',
    population: Math.floor(1300000 * 1.7), goldIncome: 80, industry: 70, buildings: [], resourceType: 'iron' as ResourceType, army: 10000,
  },
  {
    id: 'Tambov', name: 'Tambov', ownerTag: 'SOV', path: '',
    population: Math.floor(1500000 * 1.6), goldIncome: 85, industry: 75, buildings: [], resourceType: 'food' as ResourceType, army: 12000,
  },
  {
    id: 'Ryazan', name: 'Ryazan', ownerTag: 'SOV', path: '',
    population: Math.floor(1200000 * 1.6), goldIncome: 70, industry: 60, buildings: [], resourceType: 'food' as ResourceType, army: 9000,
  },
  {
    id: 'Kazan', name: 'Kazan', ownerTag: 'SOV', path: '',
    population: Math.floor(1400000 * 1.6), goldIncome: 80, industry: 70, buildings: [], resourceType: 'food' as ResourceType, army: 11000,
  },
  {
    id: 'Ufa', name: 'Ufa', ownerTag: 'SOV', path: '',
    population: Math.floor(1100000 * 1.7), goldIncome: 65, industry: 55, buildings: [], resourceType: 'iron' as ResourceType, army: 8000,
  },
  {
    id: 'Samara', name: 'Samara (Kuybyshev)', ownerTag: 'SOV', path: '',
    population: Math.floor(900000 * 1.7), goldIncome: 55, industry: 45, buildings: [], resourceType: 'food' as ResourceType, army: 7000,
  },
  {
    id: 'Vyatka', name: 'Vyatka (Kirov)', ownerTag: 'SOV', path: '',
    population: Math.floor(1200000 * 1.6), goldIncome: 70, industry: 60, buildings: [], resourceType: 'food' as ResourceType, army: 8500,
  },
  {
    id: 'Perm', name: 'Perm (Molotov)', ownerTag: 'SOV', path: '',
    population: Math.floor(1000000 * 1.7), goldIncome: 60, industry: 70, buildings: [], resourceType: 'iron' as ResourceType, army: 7500,
  },
  {
    id: 'Arkhangelsk', name: 'Arkhangelsk', ownerTag: 'SOV', path: '',
    population: Math.floor(500000 * 1.5), goldIncome: 30, industry: 25, buildings: [], resourceType: 'food' as ResourceType, army: 4000,
  },
  // Asian Russian provinces omitted for brevity but would follow similar pattern with SOV tag

  // == POLAND == (Existing + Vilnius)
  {
    id: 'Lesser_Poland', name: 'Lesser Poland', ownerTag: 'POL', path: '',
    population: Math.floor(2000000*1.5), goldIncome: 120, industry: 100, buildings: [], resourceType: 'coal' as ResourceType, army: 20000,
  },
  {
    id: 'Greater_Poland', name: 'Greater Poland', ownerTag: 'POL', path: '',
    population: Math.floor(1800000*1.5), goldIncome: 110, industry: 90, buildings: [], resourceType: 'food' as ResourceType, army: 18000,
  },
  {
    id: 'Mazovia', name: 'Mazovia (Warsaw)', ownerTag: 'POL', path: '',
    population: Math.floor(2200000*1.6), goldIncome: 130, industry: 110, buildings: [], resourceType: 'food' as ResourceType, army: 22000,
  },
  // Vilnius already added to POL above

  // == ITALY ==
  {
    id: 'Venetia', name: 'Venetia', ownerTag: 'ITA', path: '',
    population: Math.floor(2200000*1.4), goldIncome: 120, industry: 100, buildings: [], resourceType: 'gold' as ResourceType, army: 15000,
  },
  {
    id: 'Lombardy', name: 'Lombardy', ownerTag: 'ITA', path: '',
    population: Math.floor(2500000*1.4), goldIncome: 140, industry: 120, buildings: [], resourceType: 'food' as ResourceType, army: 18000,
  },
   {
    id: 'South_Tyrol', name: 'South Tyrol', ownerTag: 'ITA', path: '',
    population: Math.floor(600000 * 1.3), goldIncome: 50, industry: 40, buildings: [], resourceType: 'food' as ResourceType, army: 5000,
  },
  {
    id: 'Piedmont', name: 'Piedmont', ownerTag: 'ITA', path: '',
    population: Math.floor(2000000 * 1.4), goldIncome: 130, industry: 110, buildings: [], resourceType: 'iron' as ResourceType, army: 16000,
  },
  {
    id: 'Tuscany', name: 'Tuscany', ownerTag: 'ITA', path: '',
    population: Math.floor(1800000 * 1.4), goldIncome: 110, industry: 90, buildings: [], resourceType: 'food' as ResourceType, army: 13000,
  },
  {
    id: 'Latium', name: 'Latium (Rome)', ownerTag: 'ITA', path: '',
    population: Math.floor(1500000 * 1.5), goldIncome: 100, industry: 80, buildings: [], resourceType: 'gold' as ResourceType, army: 12000,
  },
  {
    id: 'Campania', name: 'Campania (Naples)', ownerTag: 'ITA', path: '',
    population: Math.floor(2800000 * 1.4), goldIncome: 120, industry: 70, buildings: [], resourceType: 'food' as ResourceType, army: 15000,
  },
  {
    id: 'Sicily', name: 'Sicily', ownerTag: 'ITA', path: '',
    population: Math.floor(2000000 * 1.3), goldIncome: 90, industry: 50, buildings: [], resourceType: 'food' as ResourceType, army: 10000,
  },
  {
    id: 'Sardinia', name: 'Sardinia', ownerTag: 'ITA', path: '',
    population: Math.floor(500000 * 1.3), goldIncome: 40, industry: 20, buildings: [], resourceType: 'food' as ResourceType, army: 4000,
  },
];


// Define Nations for 1936
const germany_1936: Nation = {
  nationTag: 'GER', name: 'Germany', color: '#5A5A5A', hexColor: '#5A5A5A', borderProvinces: null,
  gold: 7000, researchPoints: 200, currentResearchId: 'mechanized_infantry', currentResearchProgress: 0, buildQueue: [], isAI: false,
};
const france_1936: Nation = {
  nationTag: 'FRA', name: 'France', color: '#8397d0', hexColor: '#8397d0', borderProvinces: null,
  gold: 6500, researchPoints: 190, currentResearchId: 'fortification_doctrine', currentResearchProgress: 10, buildQueue: [], isAI: true,
};
const greatBritain_1936: Nation = {
  nationTag: 'GBR', name: 'Great Britain', color: '#dd8d91', hexColor: '#dd8d91', borderProvinces: null,
  gold: 8500, researchPoints: 230, currentResearchId: 'naval_aviation', currentResearchProgress: 20, buildQueue: [], isAI: true,
};
const sovietUnion_1936: Nation = {
  nationTag: 'SOV', name: 'Soviet Union', color: '#FF0000', hexColor: '#FF0000', borderProvinces: null,
  gold: 6000, researchPoints: 180, currentResearchId: 'mass_assault_doctrine', currentResearchProgress: 0, buildQueue: [], isAI: true,
};
const italy_1936: Nation = {
  nationTag: 'ITA', name: 'Italy', color: '#009246', hexColor: '#009246', borderProvinces: null,
  gold: 4500, researchPoints: 140, currentResearchId: 'light_tanks', currentResearchProgress: 0, buildQueue: [], isAI: true,
};
const poland_1936: Nation = {
  nationTag: 'POL', name: 'Poland', color: '#DC143C', hexColor: '#DC143C', borderProvinces: null,
  gold: 2500, researchPoints: 100, currentResearchId: null, currentResearchProgress: 0, buildQueue: [], isAI: true,
};
const belgium_1936: Nation = {
  nationTag: 'BEL', name: 'Belgium', color: '#e0dfaf', hexColor: '#e0dfaf', borderProvinces: null,
  gold: 1500, researchPoints: 70, currentResearchId: null, currentResearchProgress: 0, buildQueue: null, isAI: true,
};
const netherlands_1936: Nation = {
  nationTag: 'NET', name: 'Netherlands', color: '#d7a669', hexColor: '#d7a669', borderProvinces: null,
  gold: 2800, researchPoints: 100, currentResearchId: 'trade_interdiction', currentResearchProgress: 0, buildQueue: null, isAI: true,
};
const spain_1936: Nation = {
  nationTag: 'SPA', name: 'Spain', color: '#d9b400', hexColor: '#d9b400', borderProvinces: null,
  gold: 2000, researchPoints: 90, currentResearchId: null, currentResearchProgress: 0, buildQueue: null, isAI: true,
};
const lithuania_1936: Nation = { nationTag: 'LIT', name: 'Lithuania', color: '#006A4E', hexColor: '#006A4E', gold: 500, researchPoints: 30, isAI: true, borderProvinces:null, currentResearchId: null, currentResearchProgress:0, buildQueue:null };
const latvia_1936: Nation = { nationTag: 'LAT', name: 'Latvia', color: '#9E1B32', hexColor: '#9E1B32', gold: 500, researchPoints: 30, isAI: true, borderProvinces:null, currentResearchId: null, currentResearchProgress:0, buildQueue:null };
const estonia_1936: Nation = { nationTag: 'EST', name: 'Estonia', color: '#4A77B4', hexColor: '#4A77B4', gold: 400, researchPoints: 25, isAI: true, borderProvinces:null, currentResearchId: null, currentResearchProgress:0, buildQueue:null };
const finland_1936: Nation = { nationTag: 'FIN', name: 'Finland', color: '#002F6C', hexColor: '#002F6C', gold: 1000, researchPoints: 60, isAI: true, borderProvinces:null, currentResearchId: null, currentResearchProgress:0, buildQueue:null };


export const world_1936: Game = {
  id: 'world_data_1936', // Changed ID for clarity
  gameName: 'The Storm Gathers - 1936',
  date: '1936-01-01',
  mapName: 'world_states',
  playerNationTag: 'GER',
  nations: [
    germany_1936, france_1936, greatBritain_1936, sovietUnion_1936, italy_1936, poland_1936,
    belgium_1936, netherlands_1936, spain_1936,
    lithuania_1936, latvia_1936, estonia_1936, finland_1936,
  ],
  provinces: allProvinces_1936.map(p => {
      // Ensure all provinces listed for GER ownership are correctly assigned
      // Alsace-Lorraine removed from this list as it's now French
      const germanOwnedIds = ["Franconia","Saxony","Brunswick","Bavaria","Wurttemberg","Baden","Rhineland","Hesse","Westphalia","Ruhr","North_Rhine","Hannover","Elbe","Schleswig_Holstein","Mecklenburg","Brandenburg","Anhalt","Pomerania","Silesia","East_Prussia", "West_Prussia", "Posen", "Austria", "Styria", "Tyrol", "Bohemia", "Moravia"];
      if (germanOwnedIds.includes(p.id)) {
          return { ...p, ownerTag: 'GER' };
      }
      const polishOwnedIds = ["Lesser_Poland", "Greater_Poland", "Mazovia", "Vilnius"]; // Vilnius added
      if (polishOwnedIds.includes(p.id)) {
          return { ...p, ownerTag: 'POL'};
      }
      const italianOwnedIds = ["Venetia", "Lombardy", "South_Tyrol", "Piedmont", "Tuscany", "Latium", "Campania", "Sicily", "Sardinia"];
      if (italianOwnedIds.includes(p.id)) {
          return { ...p, ownerTag: 'ITA'};
      }
      // Ensure French ownership of Alsace-Lorraine is explicitly set if not already
      if (p.id === 'Alsace_Lorraine') {
          return { ...p, ownerTag: 'FRA' };
      }
      // If a province was previously AUT (Austria-Hungary) and isn't now GER or ITA, it might belong to Hungary, Czechoslovakia etc.
      // Ensure Baltic States and Finland ownership
      if (p.ownerTag === 'LIT' || p.ownerTag === 'LAT' || p.ownerTag === 'EST' || p.ownerTag === 'FIN') {
        return p; // Keep their assigned ownerTag
      }

      return p;
  })
};

export const scenarioDetails_1936: ScenarioDetails = {
  id: "1936",
  name: "1936 - The Storm Gathers",
  year: 1936,
  description: "Europe stands on the brink. Lead your nation in a new era of ambition and conflict.",
  icon: "🇩🇪",
  greatPowers: ["GER", "FRA", "GBR", "SOV", "ITA"],
  otherPlayableNations: ["POL", "BEL", "NET", "SPA", "FIN"], // Added FIN back
  mapDataFile: "world_1936",
  playerNationTag: "GER",
}; 