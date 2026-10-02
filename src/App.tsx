import { useState, useEffect, useRef, useCallback } from 'react';
import {
  RARITIES, EQUIPMENT_SLOTS, MONSTERS, SKILLS,
  rollRarity, generateItemName, generateItemStats,
  getMonsterStats, getXpForLevel, formatNumber, getSkillCost,
  type Item, type Character
} from './gameData';

type Tab = 'battle' | 'character' | 'inventory' | 'skills';

function App() {
  const [character, setCharacter] = useState<Character>({
    level: 1, xp: 0, xpToNext: 50,
    hp: 100, maxHp: 100,
    atk: 10, def: 5, spd: 5, crit: 5, dodge: 5, lck: 5,
    gold: 20, skillPoints: 0,
  });

  const [zone, setZone] = useState(1);
  const [monsterIdx, setMonsterIdx] = useState(0);
  const [monsterHp, setMonsterHp] = useState(0);
  const [monsterMaxHp, setMonsterMaxHp] = useState(0);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [equipment, setEquipment] = useState<Record<string, Item | null>>({});
  const [skills, setSkills] = useState<Record<string, number>>({});
  const [lastDrop, setLastDrop] = useState<Item | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('battle');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [killCount, setKillCount] = useState(0);
  const [showDamage, setShowDamage] = useState<{ amount: number; isCrit: boolean } | null>(null);
  const [monstersKilledInZone, setMonstersKilledInZone] = useState(0);

  // Refs for game loop
  const characterRef = useRef(character);
  const monsterHpRef = useRef(monsterHp);
  const inventoryRef = useRef(inventory);
  const monstersKilledRef = useRef(monstersKilledInZone);
  const zoneRef = useRef(zone);
  const monsterIdxRef = useRef(monsterIdx);
  const equipmentRef = useRef(equipment);
  const skillsRef = useRef(skills);

  useEffect(() => { characterRef.current = character; }, [character]);
  useEffect(() => { monsterHpRef.current = monsterHp; }, [monsterHp]);
  useEffect(() => { inventoryRef.current = inventory; }, [inventory]);
  useEffect(() => { monstersKilledRef.current = monstersKilledInZone; }, [monstersKilledInZone]);
  useEffect(() => { zoneRef.current = zone; }, [zone]);
  useEffect(() => { monsterIdxRef.current = monsterIdx; }, [monsterIdx]);
  useEffect(() => { equipmentRef.current = equipment; }, [equipment]);
  useEffect(() => { skillsRef.current = skills; }, [skills]);

  const getEquipmentStats = useCallback(() => {
    const stats = { ATK: 0, DEF: 0, HP: 0, SPD: 0, CRIT: 0, DODGE: 0, LCK: 0 };
    Object.values(equipmentRef.current).forEach(item => {
      if (item) {
        item.stats.forEach(s => {
          if (s.name === 'ALL') {
            Object.keys(stats).forEach(key => { stats[key as keyof typeof stats] += s.value; });
          } else if (s.name in stats) {
            stats[s.name as keyof typeof stats] += s.value;
          }
        });
      }
    });
    return stats;
  }, []);

  const getSkillBonuses = useCallback(() => {
    const bonuses = { atk: 0, def: 0, hp: 0, spd: 0, crit: 0, dodge: 0, lck: 0, xp: 0, gold: 0, loot: 0 };
    SKILLS.forEach(skill => {
      const level = skillsRef.current[skill.id] || 0;
      if (level > 0) {
        const value = skill.effectPerLevel * level;
        if (skill.effect in bonuses) {
          bonuses[skill.effect as keyof typeof bonuses] += value;
        }
      }
    });
    return bonuses;
  }, []);

  const getTotalStats = useCallback(() => {
    const eqStats = getEquipmentStats();
    const skillBonuses = getSkillBonuses();
    const char = characterRef.current;
    return {
      atk: char.atk + eqStats.ATK + skillBonuses.atk,
      def: char.def + eqStats.DEF + skillBonuses.def,
      maxHp: char.maxHp + eqStats.HP + skillBonuses.hp,
      spd: char.spd + eqStats.SPD + skillBonuses.spd,
      crit: char.crit + eqStats.CRIT + skillBonuses.crit,
      dodge: char.dodge + eqStats.DODGE + skillBonuses.dodge,
      lck: char.lck + eqStats.LCK + skillBonuses.lck,
      xpBonus: skillBonuses.xp,
      goldBonus: skillBonuses.gold,
      lootBonus: skillBonuses.loot,
    };
  }, [getEquipmentStats, getSkillBonuses]);

  const spawnMonster = useCallback(() => {
    const idx = monsterIdxRef.current;
    const z = zoneRef.current;
    const monster = MONSTERS[idx];
    const stats = getMonsterStats(monster, z);
    setMonsterHp(stats.hp);
    setMonsterMaxHp(stats.hp);
    setBattleLog(prev => [...prev.slice(-9), `Появился ${monster.icon} ${monster.name} (Ур.${z})!`]);
  }, []);

  // Initialize first monster
  useEffect(() => {
    spawnMonster();
  }, [spawnMonster]);

  // Battle loop
  useEffect(() => {
    const interval = setInterval(() => {
      const totalStats = getTotalStats();
      const mIdx = monsterIdxRef.current;
      const z = zoneRef.current;
      const monster = MONSTERS[mIdx];
      const monsterStats = getMonsterStats(monster, z);

      // Player attacks
      const isCrit = Math.random() * 100 < totalStats.crit;
      let damage = Math.max(1, totalStats.atk - monsterStats.atk * 0.1);
      if (isCrit) damage *= 2;
      damage = Math.floor(damage * (0.9 + Math.random() * 0.2));

      const newMonsterHp = Math.max(0, monsterHpRef.current - damage);
      setMonsterHp(newMonsterHp);

      setShowDamage({ amount: damage, isCrit });
      setTimeout(() => setShowDamage(null), 300);

      if (newMonsterHp <= 0) {
        // Monster killed
        const xpMultiplier = 1 + totalStats.xpBonus / 100;
        const goldMultiplier = 1 + totalStats.goldBonus / 100;
        const xpGain = Math.floor(monsterStats.xp * xpMultiplier);
        const goldGain = Math.floor(monsterStats.gold * goldMultiplier);

        setCharacter(prev => {
          let newXp = prev.xp + xpGain;
          let newLevel = prev.level;
          let newXpToNext = prev.xpToNext;
          let newMaxHp = prev.maxHp;
          let newAtk = prev.atk;
          let newDef = prev.def;
          let newSkillPoints = prev.skillPoints;

          while (newXp >= newXpToNext) {
            newXp -= newXpToNext;
            newLevel++;
            newXpToNext = getXpForLevel(newLevel);
            newMaxHp += 10;
            newAtk += 2;
            newDef += 1;
            newSkillPoints += 1;
          }

          return {
            ...prev,
            xp: newXp,
            level: newLevel,
            xpToNext: newXpToNext,
            maxHp: newMaxHp,
            hp: newMaxHp,
            atk: newAtk,
            def: newDef,
            gold: prev.gold + goldGain,
            skillPoints: newSkillPoints,
          };
        });

        setKillCount(prev => prev + 1);
        setMonstersKilledInZone(prev => prev + 1);
        setBattleLog(prev => [...prev.slice(-9), `${monster.icon} ${monster.name} побеждён! +${xpGain} XP, +${goldGain} 💰`]);

        // Loot drop
        const lootChance = 30 + totalStats.lootBonus;
        if (Math.random() * 100 < lootChance) {
          const rarityIndex = rollRarity(totalStats.lck);
          const slot = EQUIPMENT_SLOTS[Math.floor(Math.random() * EQUIPMENT_SLOTS.length)];
          const item: Item = {
            id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
            name: generateItemName(slot, rarityIndex),
            slot: slot.name,
            icon: slot.icon,
            rarityIndex,
            level: z,
            stats: generateItemStats(rarityIndex, slot, z),
            value: Math.floor((5 + Math.random() * 10) * RARITIES[rarityIndex].multiplier * (1 + z / 5)),
          };
          setLastDrop(item);
          if (inventoryRef.current.length < 100) {
            setInventory(prev => [...prev, item]);
          }
        }

        // Next monster or zone
        const killed = monstersKilledRef.current + 1;
        if (killed >= 5) {
          setZone(prev => prev + 1);
          setMonstersKilledInZone(0);
          setMonsterIdx((mIdx + 1) % MONSTERS.length);
        } else {
          setMonsterIdx(Math.floor(Math.random() * Math.min(mIdx + 2, MONSTERS.length)));
        }

        setTimeout(() => spawnMonster(), 100);
      } else {
        // Monster attacks
        const isDodge = Math.random() * 100 < totalStats.dodge;
        if (!isDodge) {
          const monsterDmg = Math.max(1, Math.floor(monsterStats.atk * (0.8 + Math.random() * 0.4) - totalStats.def * 0.5));
          setCharacter(prev => ({
            ...prev,
            hp: Math.max(0, prev.hp - monsterDmg),
          }));
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [getTotalStats, spawnMonster]);

  // Auto heal
  useEffect(() => {
    const interval = setInterval(() => {
      const totalStats = getTotalStats();
      setCharacter(prev => ({
        ...prev,
        hp: Math.min(totalStats.maxHp, prev.hp + Math.floor(totalStats.maxHp * 0.05)),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [getTotalStats]);

  const equipItem = (item: Item) => {
    const currentEquipped = equipment[item.slot];
    setEquipment(prev => ({ ...prev, [item.slot]: item }));
    setInventory(prev => {
      const filtered = prev.filter(i => i.id !== item.id);
      if (currentEquipped) return [...filtered, currentEquipped];
      return filtered;
    });
    setSelectedItem(null);
  };

  const unequipItem = (slot: string) => {
    const item = equipment[slot];
    if (item) {
      setEquipment(prev => ({ ...prev, [slot]: null }));
      setInventory(prev => [...prev, item]);
    }
  };

  const scrapItem = (item: Item) => {
    setInventory(prev => prev.filter(i => i.id !== item.id));
    setCharacter(prev => ({ ...prev, gold: prev.gold + item.value }));
    if (selectedItem?.id === item.id) setSelectedItem(null);
  };

  const learnSkill = (skillId: string) => {
    const skill = SKILLS.find(s => s.id === skillId)!;
    const level = skills[skillId] || 0;
    if (level >= skill.maxLevel) return;
    const cost = getSkillCost(skill, level);
    if (character.gold >= cost && character.skillPoints > 0) {
      setCharacter(prev => ({ ...prev, gold: prev.gold - cost, skillPoints: prev.skillPoints - 1 }));
      setSkills(prev => ({ ...prev, [skillId]: level + 1 }));
    }
  };

  const totalStats = getTotalStats();
  const monster = MONSTERS[monsterIdx];

  return (
    <div className="min-h-screen bg-gray-950 text-white font-mono">
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              ⚔️ NEON SLAYER
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <div className="text-xs text-gray-500">Уровень</div>
                <div className="text-lg font-bold text-cyan-400">{character.level}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Зона</div>
                <div className="text-lg font-bold text-purple-400">{zone}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">💰 Золото</div>
                <div className="text-lg font-bold text-yellow-400">{formatNumber(character.gold)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">🎯 Очки навыков</div>
                <div className="text-lg font-bold text-green-400">{character.skillPoints}</div>
              </div>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>XP: {formatNumber(character.xp)} / {formatNumber(character.xpToNext)}</span>
              <span>{((character.xp / character.xpToNext) * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all"
                style={{ width: `${(character.xp / character.xpToNext) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b border-gray-800 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {([
            { id: 'battle' as Tab, label: '⚔️ Бой' },
            { id: 'character' as Tab, label: '👤 Персонаж' },
            { id: 'inventory' as Tab, label: '🎒 Инвентарь' },
            { id: 'skills' as Tab, label: '📖 Навыки' },
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-3 text-sm font-medium border-b-2 transition-all"
              style={{
                borderBottomColor: activeTab === tab.id ? '#22d3ee' : 'transparent',
                color: activeTab === tab.id ? '#22d3ee' : '#6b7280',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'battle' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                <div className="text-center mb-4">
                  <div className="text-sm text-gray-500 mb-2">Зона {zone} • Убито: {monstersKilledInZone}/5</div>
                  <div className="text-6xl mb-2 relative inline-block">
                    {monster.icon}
                    {showDamage && (
                      <div
                        className="absolute -top-4 -right-8 text-2xl font-bold animate-bounce"
                        style={{ color: showDamage.isCrit ? '#fbbf24' : '#ef4444' }}
                      >
                        -{formatNumber(showDamage.amount)}{showDamage.isCrit ? '!' : ''}
                      </div>
                    )}
                  </div>
                  <div className="text-xl font-bold text-gray-200">{monster.name}</div>
                  <div className="text-sm text-gray-500">Уровень {zone}</div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>HP: {formatNumber(monsterHp)} / {formatNumber(monsterMaxHp)}</span>
                    <span>{((monsterHp / monsterMaxHp) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all"
                      style={{ width: `${(monsterHp / monsterMaxHp) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Ваше HP: {formatNumber(character.hp)} / {formatNumber(totalStats.maxHp)}</span>
                    <span>{((character.hp / totalStats.maxHp) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all"
                      style={{ width: `${(character.hp / totalStats.maxHp) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
                <h3 className="text-sm font-bold text-gray-400 mb-2">Журнал боя</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto text-sm">
                  {battleLog.slice().reverse().map((log, i) => (
                    <div key={i} className="text-gray-500">{log}</div>
                  ))}
                </div>
              </div>

              {lastDrop && (
                <div
                  className="rounded-xl border-2 p-4"
                  style={{
                    borderColor: RARITIES[lastDrop.rarityIndex].borderColor,
                    backgroundColor: RARITIES[lastDrop.rarityIndex].bgColor,
                    boxShadow: `0 0 20px ${RARITIES[lastDrop.rarityIndex].glowColor}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{lastDrop.icon}</span>
                    <div className="flex-1">
                      <div className="text-xs uppercase" style={{ color: RARITIES[lastDrop.rarityIndex].color }}>
                        {RARITIES[lastDrop.rarityIndex].name}
                      </div>
                      <div className="font-bold" style={{ color: RARITIES[lastDrop.rarityIndex].color }}>
                        {lastDrop.name}
                      </div>
                      <div className="text-xs text-gray-400">{lastDrop.slot} • Ур.{lastDrop.level}</div>
                    </div>
                    <div className="text-yellow-400 text-sm">💰{formatNumber(lastDrop.value)}</div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {lastDrop.stats.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-xs bg-black/30" style={{ color: RARITIES[lastDrop.rarityIndex].color }}>
                        +{s.value} {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
                <h3 className="text-sm font-bold text-gray-400 mb-3">Характеристики</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">⚔️ ATK</span><span className="text-red-400 font-bold">{totalStats.atk}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">🛡️ DEF</span><span className="text-blue-400 font-bold">{totalStats.def}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">❤️ HP</span><span className="text-green-400 font-bold">{totalStats.maxHp}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">⚡ SPD</span><span className="text-yellow-400 font-bold">{totalStats.spd}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">🎯 CRIT</span><span className="text-orange-400 font-bold">{totalStats.crit}%</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">💨 DODGE</span><span className="text-cyan-400 font-bold">{totalStats.dodge}%</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">🍀 LCK</span><span className="text-purple-400 font-bold">{totalStats.lck}</span></div>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-4">
                <h3 className="text-sm font-bold text-gray-400 mb-3">Экипировка</h3>
                <div className="grid grid-cols-2 gap-2">
                  {EQUIPMENT_SLOTS.map(slot => {
                    const item = equipment[slot.name];
                    return (
                      <div
                        key={slot.name}
                        className="p-2 rounded-lg border text-center cursor-pointer hover:bg-gray-800/50"
                        style={{
                          borderColor: item ? RARITIES[item.rarityIndex].borderColor : '#374151',
                          backgroundColor: item ? RARITIES[item.rarityIndex].bgColor : 'transparent',
                        }}
                        onClick={() => item && unequipItem(slot.name)}
                        title={item ? `${item.name}\nКлик чтобы снять` : slot.name}
                      >
                        <div className="text-2xl">{item ? item.icon : slot.icon}</div>
                        <div className="text-xs text-gray-500">{slot.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'character' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-bold text-gray-200 mb-4">Персонаж</h3>
              <div className="text-center mb-6">
                <div className="text-6xl mb-2">🧙</div>
                <div className="text-2xl font-bold text-cyan-400">Уровень {character.level}</div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Опыт</span>
                    <span className="text-gray-400">{formatNumber(character.xp)} / {formatNumber(character.xpToNext)}</span>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500" style={{ width: `${(character.xp / character.xpToNext) * 100}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-800/50 rounded-lg p-3"><div className="text-gray-500">⚔️ ATK</div><div className="text-xl font-bold text-red-400">{totalStats.atk}</div></div>
                  <div className="bg-gray-800/50 rounded-lg p-3"><div className="text-gray-500">🛡️ DEF</div><div className="text-xl font-bold text-blue-400">{totalStats.def}</div></div>
                  <div className="bg-gray-800/50 rounded-lg p-3"><div className="text-gray-500">❤️ HP</div><div className="text-xl font-bold text-green-400">{totalStats.maxHp}</div></div>
                  <div className="bg-gray-800/50 rounded-lg p-3"><div className="text-gray-500">⚡ SPD</div><div className="text-xl font-bold text-yellow-400">{totalStats.spd}</div></div>
                  <div className="bg-gray-800/50 rounded-lg p-3"><div className="text-gray-500">🎯 CRIT</div><div className="text-xl font-bold text-orange-400">{totalStats.crit}%</div></div>
                  <div className="bg-gray-800/50 rounded-lg p-3"><div className="text-gray-500">💨 DODGE</div><div className="text-xl font-bold text-cyan-400">{totalStats.dodge}%</div></div>
                  <div className="bg-gray-800/50 rounded-lg p-3"><div className="text-gray-500">🍀 LCK</div><div className="text-xl font-bold text-purple-400">{totalStats.lck}</div></div>
                  <div className="bg-gray-800/50 rounded-lg p-3"><div className="text-gray-500">💰 Золото</div><div className="text-xl font-bold text-yellow-400">{formatNumber(character.gold)}</div></div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-bold text-gray-200 mb-4">Статистика</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Монстров убито</span><span className="text-gray-200 font-bold">{formatNumber(killCount)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Текущая зона</span><span className="text-gray-200 font-bold">{zone}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Предметов в инвентаре</span><span className="text-gray-200 font-bold">{inventory.length}/100</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Бонус XP</span><span className="text-cyan-400 font-bold">+{totalStats.xpBonus}%</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Бонус золота</span><span className="text-yellow-400 font-bold">+{totalStats.goldBonus}%</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Бонус лута</span><span className="text-purple-400 font-bold">+{totalStats.lootBonus}%</span></div>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-bold text-gray-200 mb-4">Экипировка</h3>
                <div className="grid grid-cols-2 gap-3">
                  {EQUIPMENT_SLOTS.map(slot => {
                    const item = equipment[slot.name];
                    return (
                      <div
                        key={slot.name}
                        className="p-3 rounded-lg border cursor-pointer hover:bg-gray-800/50 transition-all"
                        style={{
                          borderColor: item ? RARITIES[item.rarityIndex].borderColor : '#374151',
                          backgroundColor: item ? RARITIES[item.rarityIndex].bgColor : 'rgba(0,0,0,0.3)',
                        }}
                        onClick={() => item && unequipItem(slot.name)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{item ? item.icon : slot.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500">{slot.name}</div>
                            {item ? (
                              <>
                                <div className="text-xs font-medium truncate" style={{ color: RARITIES[item.rarityIndex].color }}>{item.name}</div>
                                <div className="text-xs text-gray-500">Ур.{item.level}</div>
                              </>
                            ) : (
                              <div className="text-xs text-gray-600">Пусто</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-200">Инвентарь ({inventory.length}/100)</h3>
              <button
                onClick={() => {
                  const toScrap = inventory.filter(i => i.rarityIndex <= 1);
                  const totalValue = toScrap.reduce((sum, i) => sum + i.value, 0);
                  setInventory(prev => prev.filter(i => i.rarityIndex > 1));
                  setCharacter(prev => ({ ...prev, gold: prev.gold + totalValue }));
                }}
                className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-600 text-sm text-gray-300"
              >
                🗑️ Разобрать Common/Uncommon
              </button>
            </div>

            {inventory.length === 0 ? (
              <div className="text-center text-gray-500 py-20">
                <div className="text-6xl mb-4">🎒</div>
                <p>Инвентарь пуст</p>
                <p className="text-sm text-gray-600 mt-2">Убивайте монстров чтобы получать лут</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
                {inventory.map(item => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border cursor-pointer hover:scale-105 transition-all"
                    style={{
                      borderColor: RARITIES[item.rarityIndex].borderColor,
                      backgroundColor: RARITIES[item.rarityIndex].bgColor,
                    }}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs" style={{ color: RARITIES[item.rarityIndex].color }}>{RARITIES[item.rarityIndex].name}</div>
                        <div className="text-sm font-medium text-gray-200 truncate">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.slot} • Ур.{item.level}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.stats.slice(0, 3).map((s, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded text-xs bg-black/30" style={{ color: RARITIES[item.rarityIndex].color }}>
                          +{s.value} {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedItem && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedItem(null)}>
                <div
                  className="max-w-md w-full rounded-xl border-2 p-6"
                  style={{
                    borderColor: RARITIES[selectedItem.rarityIndex].borderColor,
                    backgroundColor: '#111827',
                    boxShadow: `0 0 40px ${RARITIES[selectedItem.rarityIndex].glowColor}`,
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-5xl">{selectedItem.icon}</span>
                    <div>
                      <div className="text-xs uppercase" style={{ color: RARITIES[selectedItem.rarityIndex].color }}>{RARITIES[selectedItem.rarityIndex].name}</div>
                      <div className="text-xl font-bold" style={{ color: RARITIES[selectedItem.rarityIndex].color }}>{selectedItem.name}</div>
                      <div className="text-sm text-gray-400">{selectedItem.slot} • Уровень {selectedItem.level}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {selectedItem.stats.map((s, i) => (
                      <div key={i} className="bg-black/30 rounded px-3 py-2 text-sm">
                        <span className="text-gray-400">{s.name}:</span>{' '}
                        <span style={{ color: RARITIES[selectedItem.rarityIndex].color }}>+{s.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => equipItem(selectedItem)} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-sm">
                      ⚔️ Экипировать
                    </button>
                    <button onClick={() => scrapItem(selectedItem)} className="flex-1 py-2 rounded-lg bg-red-900/50 hover:bg-red-800/50 border border-red-700 text-red-300 text-sm">
                      🗑️ Разобрать (💰{formatNumber(selectedItem.value)})
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-200">Навыки и умения</h3>
              <div className="text-sm text-green-400">🎯 Очков навыков: {character.skillPoints}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SKILLS.map(skill => {
                const level = skills[skill.id] || 0;
                const cost = getSkillCost(skill, level);
                const canLearn = character.gold >= cost && character.skillPoints > 0 && level < skill.maxLevel;
                const isMaxed = level >= skill.maxLevel;

                return (
                  <div
                    key={skill.id}
                    className={`p-4 rounded-xl border transition-all ${canLearn ? 'border-cyan-700 hover:border-cyan-500' : 'border-gray-800 opacity-60'}`}
                    style={{ backgroundColor: canLearn ? 'rgba(6,182,212,0.05)' : 'rgba(0,0,0,0.3)' }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{skill.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-200">{skill.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-cyan-400">{level}/{skill.maxLevel}</span>
                        </div>
                        <div className="text-sm text-gray-400">{skill.description}</div>
                        <div className="text-xs text-gray-500 mt-1">Эффект: +{skill.effectPerLevel * level} {skill.effect.toUpperCase()}</div>
                      </div>
                      <button
                        onClick={() => learnSkill(skill.id)}
                        disabled={!canLearn}
                        className={`px-4 py-2 rounded-lg font-bold text-sm ${canLearn ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                      >
                        {isMaxed ? 'MAX' : `💰${formatNumber(cost)}`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
