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
