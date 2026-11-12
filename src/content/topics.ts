/**
 * Leaving Certificate Chemistry topics.
 *
 * To add a topic: append an entry. `id` is what question banks reference
 * (topic *names* are also accepted on import and mapped to ids).
 * `symbol` is the 1–2 letter "element tile" badge shown in the UI.
 * `subtopics` feed the suggestions in the question editor and bank-request form.
 */
export interface Topic {
  id: string;
  name: string;
  short: string;
  symbol: string;
  /** Badge colour (hex). Keep mid-tone so it works in light and dark themes. */
  colour: string;
  subtopics: string[];
}

export const topics: Topic[] = [
  {
    id: 'atomic-structure',
    name: 'Atomic structure & periodic table',
    short: 'Atomic structure',
    symbol: 'At',
    colour: '#3b82c4',
    subtopics: ['History of the atom', 'Subatomic particles', 'Isotopes & Ar', 'Energy levels & spectra', 'Electron configuration', 'Periodic trends', 'Radioactivity'],
  },
  {
    id: 'bonding',
    name: 'Bonding',
    short: 'Bonding',
    symbol: 'Bo',
    colour: '#7c5cc4',
    subtopics: ['Ionic bonding', 'Covalent bonding', 'Electronegativity', 'Shapes of molecules (VSEPR)', 'Intermolecular forces', 'Oxidation numbers'],
  },
  {
    id: 'stoichiometry',
    name: 'Stoichiometry',
    short: 'Stoichiometry',
    symbol: 'St',
    colour: '#d4882a',
    subtopics: ['The mole', 'Molar volume', 'Empirical & molecular formulae', 'Balancing equations', 'Reacting masses', 'Percentage yield'],
  },
  {
    id: 'volumetric-analysis',
    name: 'Volumetric analysis',
    short: 'Volumetric',
    symbol: 'Va',
    colour: '#2a9d8f',
    subtopics: ['Concentration', 'Primary standards', 'Acid–base titrations', 'Redox titrations', 'Iodine/thiosulfate', 'pH'],
  },
  {
    id: 'fuels',
    name: 'Fuels & heats of reaction',
    short: 'Fuels & heats',
    symbol: 'Fu',
    colour: '#d1603d',
    subtopics: ['Hydrocarbons', 'Octane number', 'Oil refining', 'Heats of reaction', 'Hess’s law', 'Bond energies'],
  },
  {
    id: 'rates',
    name: 'Rates of reaction',
    short: 'Rates',
    symbol: 'Ra',
    colour: '#c4486b',
    subtopics: ['Measuring rate', 'Factors affecting rate', 'Collision theory', 'Catalysis', 'Activation energy'],
  },
  {
    id: 'organic',
    name: 'Organic chemistry',
    short: 'Organic',
    symbol: 'Or',
    colour: '#4c9a3a',
    subtopics: ['Homologous series', 'Naming (IUPAC)', 'Functional groups', 'Reaction types', 'Mechanisms', 'Polymers', 'Organic synthesis'],
  },
  {
    id: 'equilibrium',
    name: 'Chemical equilibrium',
    short: 'Equilibrium',
    symbol: 'Eq',
    colour: '#5a6fd6',
    subtopics: ['Dynamic equilibrium', 'Le Chatelier’s principle', 'Kc calculations', 'Industrial processes'],
  },
  {
    id: 'environmental',
    name: 'Environmental chemistry (water)',
    short: 'Water',
    symbol: 'En',
    colour: '#2b8bb3',
    subtopics: ['Hardness', 'Water treatment', 'Sewage treatment', 'Dissolved oxygen & BOD', 'Heavy metals', 'Analysis techniques'],
  },
  {
    id: 'options',
    name: 'Options',
    short: 'Options',
    symbol: 'Op',
    colour: '#8a6d3b',
    subtopics: ['Industrial chemistry', 'Atmospheric chemistry', 'Materials', 'Electrochemistry & extraction of metals'],
  },
  {
    id: 'experiments',
    name: 'Mandatory experiments',
    short: 'Experiments',
    symbol: 'Ex',
    colour: '#6b7a8f',
    subtopics: ['Volumetric experiments', 'Organic preparations', 'Rates experiments', 'Water analysis', 'Heat of reaction', 'Equilibrium'],
  },
];

export const topicById = (id: string): Topic | undefined => topics.find((t) => t.id === id);
