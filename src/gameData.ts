// Game data for loot generation

export interface Rarity {
  name: string;
  color: string;
  glowColor: string;
  chance: number;
  multiplier: number;
  bgColor: string;
  borderColor: string;
}

export interface ItemSlot {
  name: string;
  icon: string;
  prefixes: string[];
  suffixes: string[];
}

export const RARITIES: Rarity[] = [
  { name: 'Common', color: '#9ca3af', glowColor: 'rgba(156,163,175,0.3)', chance: 45, multiplier: 1, bgColor: 'rgba(156,163,175,0.1)', borderColor: '#9ca3af' },
  { name: 'Uncommon', color: '#22c55e', glowColor: 'rgba(34,197,94,0.3)', chance: 25, multiplier: 3, bgColor: 'rgba(34,197,94,0.1)', borderColor: '#22c55e' },
  { name: 'Rare', color: '#3b82f6', glowColor: 'rgba(59,130,246,0.4)', chance: 15, multiplier: 8, bgColor: 'rgba(59,130,246,0.1)', borderColor: '#3b82f6' },
  { name: 'Epic', color: '#a855f7', glowColor: 'rgba(168,85,247,0.4)', chance: 8, multiplier: 20, bgColor: 'rgba(168,85,247,0.1)', borderColor: '#a855f7' },
  { name: 'Legendary', color: '#f59e0b', glowColor: 'rgba(245,158,11,0.5)', chance: 4, multiplier: 50, bgColor: 'rgba(245,158,11,0.1)', borderColor: '#f59e0b' },
  { name: 'Mythic', color: '#ef4444', glowColor: 'rgba(239,68,68,0.5)', chance: 2, multiplier: 150, bgColor: 'rgba(239,68,68,0.1)', borderColor: '#ef4444' },
  { name: 'Transcendent', color: '#ec4899', glowColor: 'rgba(236,72,153,0.6)', chance: 0.8, multiplier: 500, bgColor: 'rgba(236,72,153,0.1)', borderColor: '#ec4899' },
  { name: 'Ascended', color: '#06b6d4', glowColor: 'rgba(6,182,212,0.7)', chance: 0.15, multiplier: 2000, bgColor: 'rgba(6,182,212,0.1)', borderColor: '#06b6d4' },
  { name: 'Celestial', color: '#fbbf24', glowColor: 'rgba(251,191,36,0.8)', chance: 0.04, multiplier: 10000, bgColor: 'rgba(251,191,36,0.1)', borderColor: '#fbbf24' },
  { name: '∞ VOID', color: '#ffffff', glowColor: 'rgba(255,255,255,0.9)', chance: 0.01, multiplier: 100000, bgColor: 'rgba(255,255,255,0.05)', borderColor: '#ffffff' },
];

export const ITEM_SLOTS: ItemSlot[] = [
  {
    name: 'Neural Implant',
    icon: '🧠',
    prefixes: ['Synaptic', 'Cortex', 'Neural', 'Psycho', 'Cerebral', 'Mind', 'Neuro', 'Quantum', 'Holo', 'Void'],
    suffixes: ['of Thought', 'of Perception', 'of Memory', 'of Cognition', 'of Dreams', 'of Insight', 'of Focus', 'of Clarity'],
  },
  {
    name: 'Cyber Arm',
    icon: '🦾',
    prefixes: ['Chrome', 'Titanium', 'Nano', 'Plasma', 'Quantum', 'Dark', 'Neon', 'Stealth', 'Razor', 'Pulse'],
    suffixes: ['of Power', 'of Destruction', 'of Speed', 'of Precision', 'of Force', 'of Annihilation', 'of Fury', 'of Might'],
  },
  {
    name: 'Optic Visor',
    icon: '👁️',
    prefixes: ['Holo', 'Spectral', 'Infrared', 'Quantum', 'Shadow', 'Prism', 'Photon', 'Void', 'Arc', 'Cyber'],
    suffixes: ['of Sight', 'of Vision', 'of Detection', 'of Scanning', 'of Awareness', 'of Truth', 'of Perception', 'of Clarity'],
  },
  {
    name: 'Exo-Suit',
    icon: '🛡️',
    prefixes: ['Nano', 'Carbon', 'Plasma', 'Chrome', 'Stealth', 'Heavy', 'Light', 'Quantum', 'Adaptive', 'Reactive'],
    suffixes: ['of Protection', 'of Resilience', 'of Defense', 'of Armor', 'of Fortitude', 'of Endurance', 'of Shielding', 'of Invulnerability'],
  },
  {
    name: 'Plasma Blade',
    icon: '⚔️',
    prefixes: ['Mono', 'Thermal', 'Ion', 'Vibro', 'Laser', 'Photon', 'Dark', 'Void', 'Neon', 'Arc'],
    suffixes: ['of Cutting', 'of Slicing', 'of Severing', 'of Destruction', 'of Annihilation', 'of Death', 'of Eternity', 'of the Void'],
  },
  {
    name: 'Smart Pistol',
    icon: '🔫',
    prefixes: ['Auto', 'Smart', 'Tech', 'Silent', 'Rapid', 'Plasma', 'EMP', 'Cryo', 'Volt', 'Toxic'],
    suffixes: ['of Accuracy', 'of Speed', 'of Precision', 'of Devastation', 'of Carnage', 'of Oblivion', 'of the Storm', 'of Ruin'],
  },
  {
    name: 'Data Deck',
    icon: '💾',
    prefixes: ['Quantum', 'Neural', 'Black', 'Ghost', 'Shadow', 'Ice', 'Daemon', 'Rogue', 'Zero', 'Omega'],
    suffixes: ['of Hacking', 'of Intrusion', 'of Decryption', 'of Control', 'of Domination', 'of the Net', 'of Data', 'of the Grid'],
  },
  {
    name: 'Nano Med',
    icon: '💉',
    prefixes: ['Bio', 'Nano', 'Stim', 'Regen', 'Cell', 'Gene', 'Synth', 'Organic', 'Cryo', 'Viral'],
    suffixes: ['of Healing', 'of Recovery', 'of Regeneration', 'of Vitality', 'of Life', 'of Restoration', 'of Rebirth', 'of Immortality'],
  },
  {
    name: 'Jet Boots',
    icon: '👢',
    prefixes: ['Mag', 'Grav', 'Ion', 'Pulse', 'Turbo', 'Hyper', 'Quantum', 'Void', 'Phantom', 'Blitz'],
    suffixes: ['of Speed', 'of Flight', 'of Agility', 'of Swiftness', 'of Motion', 'of Velocity', 'of the Wind', 'of Lightning'],
  },
  {
    name: 'Power Core',
    icon: '⚡',
    prefixes: ['Fusion', 'Anti', 'Dark', 'Quantum', 'Stellar', 'Void', 'Infinite', 'Primal', 'Arc', 'Nova'],
    suffixes: ['of Energy', 'of Power', 'of Reactivity', 'of Fusion', 'of the Core', 'of Eternity', 'of Infinity', 'of the Cosmos'],
  },
  {
    name: 'Holo Cloak',
    icon: '🌫️',
    prefixes: ['Phantom', 'Ghost', 'Shadow', 'Mirage', 'Void', 'Dark', 'Stealth', 'Phase', 'Shift', 'Null'],
    suffixes: ['of Invisibility', 'of Stealth', 'of Shadows', 'of the Void', 'of Deception', 'of Illusion', 'of Darkness', 'of the Unknown'],
  },
  {
    name: 'Combat Drone',
    icon: '🛸',
    prefixes: ['Hunter', 'Killer', 'Swarm', 'Storm', 'Razor', 'Fury', 'Omega', 'Alpha', 'Delta', 'Zero'],
    suffixes: ['of War', 'of Battle', 'of Destruction', 'of Annihilation', 'of the Skies', 'of the Swarm', 'of Chaos', 'of the End'],
  },
];

export const STAT_NAMES = [
  'ATK', 'DEF', 'HP', 'SPD', 'CRIT', 'HACK', 'NEURO', 'SYNC', 'DODGE', 'LCK',
  'ARMOR', 'RESIST', 'REGEN', 'DRAIN', 'OVERCLOCK', 'QUANTUM', 'VOID', 'FLUX'
];

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  baseCost: number;
  costMultiplier: number;
  effect: 'speed' | 'luck' | 'value' | 'autoScrap' | 'capacity';
  effectValue: number;
}

export const UPGRADES: Upgrade[] = [
  { id: 'cpu', name: 'CPU Upgrade', description: '+1 loot/sec', icon: '🖥️', baseCost: 10, costMultiplier: 1.15, effect: 'speed', effectValue: 1 },
  { id: 'quantum_proc', name: 'Quantum Processor', description: '+5 loot/sec', icon: '⚛️', baseCost: 500, costMultiplier: 1.18, effect: 'speed', effectValue: 5 },
  { id: 'neural_net', name: 'Neural Network', description: '+25 loot/sec', icon: '🧬', baseCost: 5000, costMultiplier: 1.2, effect: 'speed', effectValue: 25 },
  { id: 'luck_chip', name: 'Luck Chip', description: '+2% rare chance', icon: '🍀', baseCost: 200, costMultiplier: 1.5, effect: 'luck', effectValue: 2 },
  { id: 'fortune_ai', name: 'Fortune AI', description: '+5% rare chance', icon: '🎰', baseCost: 5000, costMultiplier: 1.6, effect: 'luck', effectValue: 5 },
  { id: 'market_link', name: 'Market Link', description: '+25% scrap value', icon: '💰', baseCost: 300, costMultiplier: 1.4, effect: 'value', effectValue: 25 },
  { id: 'black_market', name: 'Black Market', description: '+100% scrap value', icon: '🏴', baseCost: 10000, costMultiplier: 1.5, effect: 'value', effectValue: 100 },
  { id: 'auto_scrap', name: 'Auto-Scrap Bot', description: 'Auto-scrap Common items', icon: '🤖', baseCost: 1000, costMultiplier: 2.0, effect: 'autoScrap', effectValue: 1 },
  { id: 'adv_scrap', name: 'Adv. Scrap Bot', description: 'Auto-scrap Uncommon items', icon: '🦿', baseCost: 50000, costMultiplier: 2.5, effect: 'autoScrap', effectValue: 2 },
  { id: 'storage', name: 'Storage Expansion', description: '+50 inventory slots', icon: '📦', baseCost: 100, costMultiplier: 1.3, effect: 'capacity', effectValue: 50 },
];

export function getUpgradeCost(upgrade: Upgrade, level: number): number {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level));
}

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

export function generateItemName(slot: ItemSlot): string {
  const prefix = slot.prefixes[Math.floor(Math.random() * slot.prefixes.length)];
  const suffix = slot.suffixes[Math.floor(Math.random() * slot.suffixes.length)];
  return `${prefix} ${slot.name} ${suffix}`;
}

export function generateStats(rarityIndex: number): { name: string; value: number }[] {
  const numStats = Math.min(2 + rarityIndex, 6);
  const stats: { name: string; value: number }[] = [];
  const usedStats = new Set<string>();
  const multiplier = RARITIES[rarityIndex].multiplier;
  
  for (let i = 0; i < numStats; i++) {
    let statName: string;
    do {
      statName = STAT_NAMES[Math.floor(Math.random() * STAT_NAMES.length)];
    } while (usedStats.has(statName));
    usedStats.add(statName);
    
    const baseValue = Math.floor(Math.random() * 10 + 1);
    const value = Math.floor(baseValue * multiplier * (0.8 + Math.random() * 0.4));
    stats.push({ name: statName, value });
  }
  
  return stats;
}

export function getItemValue(rarityIndex: number): number {
  const base = Math.floor(Math.random() * 5 + 1);
  return base * RARITIES[rarityIndex].multiplier;
}

export function formatNumber(n: number): string {
  if (n >= 1e15) return (n / 1e15).toFixed(2) + 'Q';
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  return Math.floor(n).toString();
}
