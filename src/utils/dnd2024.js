// utilidades D&D 2024 (One D&D)
export const abilities = ['STR','DEX','CON','INT','WIS','CHA'];

export function abilityMod(score) {
  const n = Number(score ?? 10);
  return Math.floor((n - 10) / 2);
}

// D&D 2024 mantém as faixas clássicas de proficiência
export function proficiencyBonus(level) {
  const L = Number(level ?? 1);
  if (L >= 17) return 6;
  if (L >= 13) return 5;
  if (L >= 9)  return 4;
  if (L >= 5)  return 3;
  return 2; // 1–4
}

// lista de perícias e habilidade associada (2024)
export const skills = [
  { key: 'acrobatics',      name: 'Acrobatics',      abil: 'DEX' },
  { key: 'animalHandling',  name: 'Animal Handling', abil: 'WIS' },
  { key: 'arcana',          name: 'Arcana',          abil: 'INT' },
  { key: 'athletics',       name: 'Athletics',       abil: 'STR' },
  { key: 'deception',       name: 'Deception',       abil: 'CHA' },
  { key: 'history',         name: 'History',         abil: 'INT' },
  { key: 'insight',         name: 'Insight',         abil: 'WIS' },
  { key: 'intimidation',    name: 'Intimidation',    abil: 'CHA' },
  { key: 'investigation',   name: 'Investigation',   abil: 'INT' },
  { key: 'medicine',        name: 'Medicine',        abil: 'WIS' },
  { key: 'nature',          name: 'Nature',          abil: 'INT' },
  { key: 'perception',      name: 'Perception',      abil: 'WIS' },
  { key: 'performance',     name: 'Performance',     abil: 'CHA' },
  { key: 'persuasion',      name: 'Persuasion',      abil: 'CHA' },
  { key: 'religion',        name: 'Religion',        abil: 'INT' },
  { key: 'sleightOfHand',   name: 'Sleight of Hand', abil: 'DEX' },
  { key: 'stealth',         name: 'Stealth',         abil: 'DEX' },
  { key: 'survival',        name: 'Survival',        abil: 'WIS' },
];

export function defaultDnD2024Sheet(id) {
  const attrs = { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 };
  const baseSkills = {};
  for (const s of skills) baseSkills[s.key] = false; // proficiência desligada
  const baseSaves = { STR:false, DEX:false, CON:false, INT:false, WIS:false, CHA:false };

  return {
    id,
    name: '',
    className: '',
    level: 1,
    attributes: attrs,
    saves: baseSaves,        // proficiências de salvaguarda
    skills: baseSkills,      // proficiências de perícia
    ac: 10,
    initiativeMisc: 0,       // bônus extra além do DEX
    speed: 9,                // metros (ou 30 ft)
    hp: { current: 10, max: 10 },
    hitDice: { size: 8, total: 1 }, // ex.: d8 para muitas classes
    notes: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
