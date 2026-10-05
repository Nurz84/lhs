// Game data for Diablo-style idle RPG

export interface Rarity {
  name: string;
  color: string;
  glowColor: string;
  chance: number;
  multiplier: number;
  bgColor: string;
  borderColor: string;
}

export const RARITIES: Rarity[] = [
  { name: 'Обычный', color: '#9ca3af', glowColor: 'rgba(156,163,175,0.3)', chance: 40, multiplier: 1, bgColor: 'rgba(156,163,175,0.1)', borderColor: '#9ca3af' },
  { name: 'Необычный', color: '#22c55e', glowColor: 'rgba(34,197,94,0.3)', chance: 25, multiplier: 2, bgColor: 'rgba(34,197,94,0.1)', borderColor: '#22c55e' },
  { name: 'Редкий', color: '#3b82f6', glowColor: 'rgba(59,130,246,0.4)', chance: 15, multiplier: 4, bgColor: 'rgba(59,130,246,0.1)', borderColor: '#3b82f6' },
  { name: 'Эпический', color: '#a855f7', glowColor: 'rgba(168,85,247,0.4)', chance: 10, multiplier: 8, bgColor: 'rgba(168,85,247,0.1)', borderColor: '#a855f7' },
  { name: 'Легендарный', color: '#f59e0b', glowColor: 'rgba(245,158,11,0.5)', chance: 5, multiplier: 15, bgColor: 'rgba(245,158,11,0.1)', borderColor: '#f59e0b' },
  { name: 'Мифический', color: '#ef4444', glowColor: 'rgba(239,68,68,0.5)', chance: 3, multiplier: 30, bgColor: 'rgba(239,68,68,0.1)', borderColor: '#ef4444' },
  { name: 'Трансцендентный', color: '#ec4899', glowColor: 'rgba(236,72,153,0.6)', chance: 1.5, multiplier: 75, bgColor: 'rgba(236,72,153,0.1)', borderColor: '#ec4899' },
  { name: 'Вознесённый', color: '#06b6d4', glowColor: 'rgba(6,182,212,0.7)', chance: 0.4, multiplier: 200, bgColor: 'rgba(6,182,212,0.1)', borderColor: '#06b6d4' },
  { name: 'Небесный', color: '#fbbf24', glowColor: 'rgba(251,191,36,0.8)', chance: 0.08, multiplier: 500, bgColor: 'rgba(251,191,36,0.1)', borderColor: '#fbbf24' },
  { name: '∞ БЕЗДНА', color: '#ffffff', glowColor: 'rgba(255,255,255,0.9)', chance: 0.02, multiplier: 2000, bgColor: 'rgba(255,255,255,0.05)', borderColor: '#ffffff' },
];

export interface EquipmentSlot {
  name: string;
  icon: string;
  statBonus: string[];
}

export const EQUIPMENT_SLOTS: EquipmentSlot[] = [
  { name: 'Оружие', icon: '⚔️', statBonus: ['ATK', 'CRIT'] },
  { name: 'Шлем', icon: '🪖', statBonus: ['DEF', 'HP'] },
  { name: 'Броня', icon: '🛡️', statBonus: ['DEF', 'HP'] },
  { name: 'Перчатки', icon: '🧤', statBonus: ['ATK', 'SPD'] },
  { name: 'Сапоги', icon: '👢', statBonus: ['SPD', 'DODGE'] },
  { name: 'Амулет', icon: '📿', statBonus: ['CRIT', 'LCK'] },
  { name: 'Кольцо', icon: '💍', statBonus: ['LCK', 'CRIT'] },
  { name: 'Артефакт', icon: '🔮', statBonus: ['ALL'] },
];

export interface Monster {
  name: string;
  icon: string;
  baseHP: number;
  baseATK: number;
  xpReward: number;
  goldReward: number;
}

export const MONSTERS: Monster[] = [
  { name: 'Слайм', icon: '🟢', baseHP: 10, baseATK: 2, xpReward: 5, goldReward: 3 },
  { name: 'Гоблин', icon: '👺', baseHP: 20, baseATK: 4, xpReward: 10, goldReward: 6 },
  { name: 'Скелет', icon: '💀', baseHP: 35, baseATK: 7, xpReward: 18, goldReward: 12 },
  { name: 'Орк', icon: '👹', baseHP: 60, baseATK: 12, xpReward: 30, goldReward: 20 },
  { name: 'Тролль', icon: '🧌', baseHP: 100, baseATK: 18, xpReward: 50, goldReward: 35 },
  { name: 'Демон', icon: '😈', baseHP: 160, baseATK: 28, xpReward: 80, goldReward: 55 },
  { name: 'Дракон', icon: '🐉', baseHP: 250, baseATK: 45, xpReward: 130, goldReward: 90 },
  { name: 'Лич', icon: '🧟', baseHP: 400, baseATK: 70, xpReward: 210, goldReward: 145 },
  { name: 'Титан', icon: '🗿', baseHP: 650, baseATK: 110, xpReward: 340, goldReward: 235 },
  { name: 'Бог Хаоса', icon: '👁️', baseHP: 1000, baseATK: 170, xpReward: 550, goldReward: 380 },
];

export interface Boss extends Monster {
  specialAbility: string;
  guaranteedLoot: boolean;
}

export const BOSSES: Boss[] = [
  { name: 'Король Слизней', icon: '👑', baseHP: 150, baseATK: 15, xpReward: 200, goldReward: 150, specialAbility: 'Делится на слаймов', guaranteedLoot: true },
  { name: 'Гоблин-Шаман', icon: '🧙', baseHP: 300, baseATK: 30, xpReward: 400, goldReward: 300, specialAbility: 'Призывает духов', guaranteedLoot: true },
  { name: 'Некромант', icon: '☠️', baseHP: 500, baseATK: 50, xpReward: 700, goldReward: 500, specialAbility: 'Воскрешает мёртвых', guaranteedLoot: true },
  { name: 'Орк-Вождь', icon: '🦍', baseHP: 800, baseATK: 80, xpReward: 1200, goldReward: 800, specialAbility: 'Берсерк', guaranteedLoot: true },
  { name: 'Каменный Голем', icon: '🗿', baseHP: 1200, baseATK: 120, xpReward: 2000, goldReward: 1300, specialAbility: 'Каменная кожа', guaranteedLoot: true },
  { name: 'Повелитель Демонов', icon: '👿', baseHP: 1800, baseATK: 180, xpReward: 3500, goldReward: 2200, specialAbility: 'Огненное дыхание', guaranteedLoot: true },
  { name: 'Древний Дракон', icon: '🐲', baseHP: 2800, baseATK: 280, xpReward: 6000, goldReward: 3800, specialAbility: 'Ледяной шторм', guaranteedLoot: true },
  { name: 'Архимаг Тьмы', icon: '🧙‍♂️', baseHP: 4500, baseATK: 450, xpReward: 10000, goldReward: 6500, specialAbility: 'Тёмная магия', guaranteedLoot: true },
  { name: 'Падший Ангел', icon: '😇', baseHP: 7000, baseATK: 700, xpReward: 17000, goldReward: 11000, specialAbility: 'Божественный гнев', guaranteedLoot: true },
  { name: 'Владыка Бездны', icon: '🌑', baseHP: 11000, baseATK: 1100, xpReward: 30000, goldReward: 20000, specialAbility: 'Поглощение души', guaranteedLoot: true },
];

export interface SetBonus {
  name: string;
  color: string;
  pieces: number;
  bonuses: { count: number; effect: string; value: number }[];
}

export const SETS: SetBonus[] = [
  { name: 'Доспехи Берсерка', color: '#ef4444', pieces: 4, bonuses: [{ count: 2, effect: 'ATK', value: 15 }, { count: 4, effect: 'CRIT', value: 10 }] },
  { name: 'Мантия Архимага', color: '#a855f7', pieces: 4, bonuses: [{ count: 2, effect: 'LCK', value: 20 }, { count: 4, effect: 'ALL', value: 10 }] },
  { name: 'Латы Паладина', color: '#fbbf24', pieces: 4, bonuses: [{ count: 2, effect: 'DEF', value: 25 }, { count: 4, effect: 'HP', value: 100 }] },
  { name: 'Одеяние Тени', color: '#6b7280', pieces: 4, bonuses: [{ count: 2, effect: 'DODGE', value: 15 }, { count: 4, effect: 'SPD', value: 20 }] },
  { name: 'Регалии Дракона', color: '#f59e0b', pieces: 4, bonuses: [{ count: 2, effect: 'ATK', value: 30 }, { count: 4, effect: 'HP', value: 200 }] },
];

export interface UniqueItem {
  name: string;
  icon: string;
  slot: string;
  description: string;
  fixedStats: { name: string; value: number }[];
  specialEffect?: string;
}

export const UNIQUE_ITEMS: UniqueItem[] = [
  { name: 'Клинок Вечной Ночи', icon: '🗡️', slot: 'Оружие', description: 'Легендарный меч, выкованный в бездне', fixedStats: [{ name: 'ATK', value: 500 }, { name: 'CRIT', value: 25 }], specialEffect: 'Шанс нанести тройной урон' },
  { name: 'Щит Небесного Стража', icon: '🛡️', slot: 'Броня', description: 'Божественный щит, защищающий от зла', fixedStats: [{ name: 'DEF', value: 400 }, { name: 'HP', value: 500 }], specialEffect: 'Блокирует 20% урона' },
  { name: 'Шлем Повелителя Бурь', icon: '⛑️', slot: 'Шлем', description: 'Венец древнего короля стихий', fixedStats: [{ name: 'DEF', value: 200 }, { name: 'SPD', value: 30 }], specialEffect: '+15% к скорости атаки' },
  { name: 'Кольцо Бесконечности', icon: '💎', slot: 'Кольцо', description: 'Артефакт из другого измерения', fixedStats: [{ name: 'ALL', value: 100 }], specialEffect: 'Удваивает шанс критического удара' },
  { name: 'Амулет Душ', icon: '🔮', slot: 'Амулет', description: 'Содержит тысячи пленённых душ', fixedStats: [{ name: 'LCK', value: 50 }, { name: 'CRIT', value: 20 }], specialEffect: '+30% к шансу выпадения редких предметов' },
  { name: 'Сапоги Ветра', icon: '👟', slot: 'Сапоги', description: 'Обувь бога скорости', fixedStats: [{ name: 'SPD', value: 100 }, { name: 'DODGE', value: 25 }], specialEffect: 'Невозможно оглушить' },
  { name: 'Перчатки Титана', icon: '🧤', slot: 'Перчатки', description: 'Рукавицы древнего гиганта', fixedStats: [{ name: 'ATK', value: 300 }, { name: 'DEF', value: 150 }], specialEffect: 'Каждый 5-й удар наносит двойной урон' },
];

export interface Trader {
  id: string;
  name: string;
  icon: string;
  description: string;
  service: string;
  cost: number;
  cooldown: number; // in seconds
}

export const TRADERS: Trader[] = [
  { id: 'scavenger', name: 'Сборщик', icon: '🧹', description: 'Разбирает все предметы ниже Rare', service: 'Массовый разбор', cost: 0, cooldown: 60 },
  { id: 'enchanter', name: 'Зачарователь', icon: '🔮', description: 'Улучшает случайный предмет на +1 уровень', service: 'Улучшение предмета', cost: 500, cooldown: 30 },
  { id: 'mystic', name: 'Мистик', icon: '🎲', description: 'Превращает 3 предмета в 1 случайный более редкий', service: 'Трансмутация', cost: 200, cooldown: 45 },
  { id: 'merchant', name: 'Торговец', icon: '💰', description: 'Продаёт случайный Rare+ предмет за золото', service: 'Покупка предмета', cost: 1000, cooldown: 120 },
  { id: 'alchemist', name: 'Алхимик', icon: '⚗️', description: 'Конвертирует золото в опыт (1:1)', service: 'Конвертация золота в XP', cost: 100, cooldown: 10 },
  { id: 'fortune_teller', name: 'Гадалка', icon: '🔮', description: 'Увеличивает удачу на 1 час', service: 'Бонус удачи +50%', cost: 300, cooldown: 3600 },
];

export interface Season {
  id: string;
  name: string;
  icon: string;
  description: string;
  modifiers: { stat: string; value: number; description: string }[];
  duration: number; // in days
  color: string;
}

export const SEASONS: Season[] = [
  {
    id: 'lunatic',
    name: 'Лунатик',
    icon: '🌙',
    description: 'Сила лунного света усиливает критические удары',
    modifiers: [
      { stat: 'CRIT', value: 25, description: '+25% шанс крита' },
      { stat: 'ATK', value: 10, description: '+10% к урону' },
    ],
    duration: 7,
    color: '#a855f7',
  },
  {
    id: 'iron_fist',
    name: 'Железный Кулак',
    icon: '👊',
    description: 'Эпоха неукротимой силы и несокрушимой защиты',
    modifiers: [
      { stat: 'DEF', value: 30, description: '+30% к защите' },
      { stat: 'HP', value: 20, description: '+20% к здоровью' },
      { stat: 'ATK', value: 15, description: '+15% к атаке' },
    ],
    duration: 7,
    color: '#6b7280',
  },
  {
    id: 'swift_wind',
    name: 'Быстрый Ветер',
    icon: '💨',
    description: 'Время ускоряется, движения становятся молниеносными',
    modifiers: [
      { stat: 'SPD', value: 40, description: '+40% к скорости' },
      { stat: 'DODGE', value: 20, description: '+20% к уклонению' },
    ],
    duration: 7,
    color: '#06b6d4',
  },
  {
    id: 'fortune',
    name: 'Золотая Лихорадка',
    icon: '💰',
    description: 'Удача улыбается каждому, сокровища текут рекой',
    modifiers: [
      { stat: 'LCK', value: 50, description: '+50% к удаче' },
      { stat: 'GOLD', value: 100, description: '+100% к золоту' },
      { stat: 'LOOT', value: 25, description: '+25% к луту' },
    ],
    duration: 7,
    color: '#fbbf24',
  },
  {
    id: 'blood_moon',
    name: 'Кровавая Луна',
    icon: '🩸',
    description: 'Ночь охоты - каждый удар смертоносен',
    modifiers: [
      { stat: 'ATK', value: 50, description: '+50% к атаке' },
      { stat: 'CRIT', value: 15, description: '+15% к криту' },
      { stat: 'DEF', value: -20, description: '-20% к защите' },
    ],
    duration: 7,
    color: '#ef4444',
  },
  {
    id: 'eternal',
    name: 'Вечность',
    icon: '∞',
    description: 'Время остановилось, все характеристики усилены',
    modifiers: [
      { stat: 'ALL', value: 25, description: '+25% ко всем характеристикам' },
    ],
    duration: 7,
    color: '#ec4899',
  },
];

export interface Skill {
  id: string;
  name: string;
  icon: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  effect: 'atk' | 'def' | 'hp' | 'spd' | 'crit' | 'dodge' | 'lck' | 'xp' | 'gold' | 'loot';
  effectPerLevel: number;
}

export const SKILLS: Skill[] = [
  { id: 'power_strike', name: 'Мощный Удар', icon: '💪', description: '+5 ATK за уровень', maxLevel: 100, baseCost: 10, costMultiplier: 1.15, effect: 'atk', effectPerLevel: 5 },
  { id: 'iron_skin', name: 'Железная Кожа', icon: '🛡️', description: '+3 DEF за уровень', maxLevel: 100, baseCost: 10, costMultiplier: 1.15, effect: 'def', effectPerLevel: 3 },
  { id: 'vitality', name: 'Живучесть', icon: '❤️', description: '+20 HP за уровень', maxLevel: 100, baseCost: 10, costMultiplier: 1.15, effect: 'hp', effectPerLevel: 20 },
  { id: 'swiftness', name: 'Стремительность', icon: '⚡', description: '+2 SPD за уровень', maxLevel: 50, baseCost: 15, costMultiplier: 1.2, effect: 'spd', effectPerLevel: 2 },
  { id: 'precision', name: 'Точность', icon: '🎯', description: '+1% CRIT за уровень', maxLevel: 50, baseCost: 20, costMultiplier: 1.25, effect: 'crit', effectPerLevel: 1 },
  { id: 'evasion', name: 'Уклонение', icon: '💨', description: '+1% DODGE за уровень', maxLevel: 50, baseCost: 20, costMultiplier: 1.25, effect: 'dodge', effectPerLevel: 1 },
  { id: 'fortune', name: 'Удача', icon: '🍀', description: '+2 LCK за уровень', maxLevel: 50, baseCost: 25, costMultiplier: 1.3, effect: 'lck', effectPerLevel: 2 },
  { id: 'scholar', name: 'Учёный', icon: '📚', description: '+5% XP за уровень', maxLevel: 30, baseCost: 50, costMultiplier: 1.4, effect: 'xp', effectPerLevel: 5 },
  { id: 'merchant', name: 'Торговец', icon: '💰', description: '+5% Gold за уровень', maxLevel: 30, baseCost: 50, costMultiplier: 1.4, effect: 'gold', effectPerLevel: 5 },
  { id: 'treasure_hunter', name: 'Охотник за Сокровищами', icon: '🎁', description: '+3% Loot за уровень', maxLevel: 30, baseCost: 100, costMultiplier: 1.5, effect: 'loot', effectPerLevel: 3 },
];

export interface Item {
  id: string;
  name: string;
  slot: string;
  icon: string;
  rarityIndex: number;
  level: number;
  stats: { name: string; value: number }[];
  value: number;
  setName?: string;
  isUnique?: boolean;
  specialEffect?: string;
}

export interface Character {
  level: number;
  xp: number;
  xpToNext: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  crit: number;
  dodge: number;
  lck: number;
  gold: number;
  skillPoints: number;
}

export const STAT_NAMES = ['ATK', 'DEF', 'HP', 'SPD', 'CRIT', 'DODGE', 'LCK'];

export function rollRarity(luckBonus: number): number {
  const roll = Math.random() * 100;
  let cumulative = 0;
  
  for (let i = 0; i < RARITIES.length; i++) {
    let adjustedChance = RARITIES[i].chance;
    if (i >= 2) {
      adjustedChance *= (1 + luckBonus / 100);
    }
    cumulative += adjustedChance;
    if (roll <= cumulative) return i;
  }
  return 0;
}

export function generateItemName(slot: EquipmentSlot, rarityIndex: number): string {
  const prefixes = ['Проклятый', 'Древний', 'Кровавый', 'Теневой', 'Огненный', 'Ледяной', 'Громовой', 'Ядовитый', 'Святой', 'Безумный'];
  const suffixes = ['Разрушения', 'Вечности', 'Бездны', 'Хаоса', 'Судьбы', 'Смерти', 'Тьмы', 'Света', 'Бури', 'Забвения'];
  
  const prefix = rarityIndex >= 3 ? prefixes[Math.floor(Math.random() * prefixes.length)] + ' ' : '';
  const suffix = rarityIndex >= 2 ? ' ' + suffixes[Math.floor(Math.random() * suffixes.length)] : '';
  
  return `${prefix}${slot.name}${suffix}`;
}

export function generateItemStats(rarityIndex: number, slot: EquipmentSlot, itemLevel: number): { name: string; value: number }[] {
  const numStats = Math.min(1 + Math.floor(rarityIndex / 2), 4);
  const stats: { name: string; value: number }[] = [];
  const multiplier = RARITIES[rarityIndex].multiplier;
  
  for (let i = 0; i < numStats; i++) {
    const statName = slot.statBonus[Math.floor(Math.random() * slot.statBonus.length)];
    const baseValue = Math.floor((Math.random() * 5 + 3) * multiplier * (1 + itemLevel / 10));
    stats.push({ name: statName, value: baseValue });
  }
  
  return stats;
}

export function getMonsterStats(monster: Monster, zone: number): { hp: number; atk: number; xp: number; gold: number } {
  const scaling = 1 + (zone - 1) * 0.5;
  return {
    hp: Math.floor(monster.baseHP * scaling),
    atk: Math.floor(monster.baseATK * scaling),
    xp: Math.floor(monster.xpReward * scaling),
    gold: Math.floor(monster.goldReward * scaling),
  };
}

export function getXpForLevel(level: number): number {
  return Math.floor(50 * Math.pow(1.2, level - 1));
}

export function formatNumber(n: number): string {
  if (n >= 1e15) return (n / 1e15).toFixed(2) + 'Q';
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  return Math.floor(n).toString();
}

export function getSkillCost(skill: Skill, level: number): number {
  return Math.floor(skill.baseCost * Math.pow(skill.costMultiplier, level));
}

export function calculateItemPower(item: Item): number {
  return item.stats.reduce((sum, stat) => sum + stat.value, 0);
}

export function generateSetItem(rarityIndex: number, slot: EquipmentSlot, level: number, setName: string): Item {
  const setInfo = SETS.find(s => s.name === setName)!;
  const stats = generateItemStats(rarityIndex, slot, level);
  
  return {
    id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
    name: `${slot.name} ${setInfo.name.split(' ')[0]}`,
    slot: slot.name,
    icon: slot.icon,
    rarityIndex: Math.max(rarityIndex, 3), // Sets are at least Epic
    level,
    stats,
    value: Math.floor((20 + Math.random() * 30) * RARITIES[rarityIndex].multiplier * (1 + level / 5)),
    setName: setInfo.name,
  };
}

export function generateUniqueItem(level: number): Item {
  const uniqueTemplate = UNIQUE_ITEMS[Math.floor(Math.random() * UNIQUE_ITEMS.length)];
  const scaling = 1 + level / 10;
  
  const stats = uniqueTemplate.fixedStats.map(s => ({
    name: s.name,
    value: Math.floor(s.value * scaling)
  }));

  return {
    id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
    name: uniqueTemplate.name,
    slot: uniqueTemplate.slot,
    icon: uniqueTemplate.icon,
    rarityIndex: 8, // Celestial
    level,
    stats,
    value: Math.floor(1000 * scaling),
    isUnique: true,
    specialEffect: uniqueTemplate.specialEffect,
  };
}

export function getActiveSetBonuses(equipment: Record<string, Item | null>): { setName: string; count: number; activeBonuses: { count: number; effect: string; value: number }[] }[] {
  const setCounts: Record<string, number> = {};
  
  Object.values(equipment).forEach(item => {
    if (item && item.setName) {
      setCounts[item.setName] = (setCounts[item.setName] || 0) + 1;
    }
  });

  return Object.entries(setCounts).map(([setName, count]) => {
    const setInfo = SETS.find(s => s.name === setName)!;
    const activeBonuses = setInfo.bonuses.filter(b => count >= b.count);
    return { setName, count, activeBonuses };
  }).filter(s => s.count >= 2);
}

export function getTotalSetBonus(equipment: Record<string, Item | null>): { ATK: number; DEF: number; HP: number; SPD: number; CRIT: number; DODGE: number; LCK: number; ALL: number } {
  const bonuses = { ATK: 0, DEF: 0, HP: 0, SPD: 0, CRIT: 0, DODGE: 0, LCK: 0, ALL: 0 };
  const activeSets = getActiveSetBonuses(equipment);
  
  activeSets.forEach(set => {
    set.activeBonuses.forEach(bonus => {
      if (bonus.effect in bonuses) {
        bonuses[bonus.effect as keyof typeof bonuses] += bonus.value;
      }
    });
  });

  return bonuses;
}

export function compareItems(current: Item | null, newItem: Item): { better: boolean; difference: number; statChanges: { name: string; value: number }[] } {
  if (!current) {
    return {
      better: true,
      difference: calculateItemPower(newItem),
      statChanges: newItem.stats.map(s => ({ name: s.name, value: s.value }))
    };
  }

  const currentPower = calculateItemPower(current);
  const newPower = calculateItemPower(newItem);
  const difference = newPower - currentPower;

  // Calculate stat-by-stat comparison
  const currentStats: Record<string, number> = {};
  current.stats.forEach(s => {
    if (s.name === 'ALL') {
      ['ATK', 'DEF', 'HP', 'SPD', 'CRIT', 'DODGE', 'LCK'].forEach(k => {
        currentStats[k] = (currentStats[k] || 0) + s.value;
      });
    } else {
      currentStats[s.name] = (currentStats[s.name] || 0) + s.value;
    }
  });

  const newStats: Record<string, number> = {};
  newItem.stats.forEach(s => {
    if (s.name === 'ALL') {
      ['ATK', 'DEF', 'HP', 'SPD', 'CRIT', 'DODGE', 'LCK'].forEach(k => {
        newStats[k] = (newStats[k] || 0) + s.value;
      });
    } else {
      newStats[s.name] = (newStats[s.name] || 0) + s.value;
    }
  });

  const allStatNames = new Set([...Object.keys(currentStats), ...Object.keys(newStats)]);
  const statChanges: { name: string; value: number }[] = [];
  
  allStatNames.forEach(statName => {
    const change = (newStats[statName] || 0) - (currentStats[statName] || 0);
    if (change !== 0) {
      statChanges.push({ name: statName, value: change });
    }
  });

  return {
    better: difference > 0,
    difference,
    statChanges
  };
}
