import { useState, useEffect, useRef, useCallback } from 'react';
import {
  RARITIES, EQUIPMENT_SLOTS, MONSTERS, BOSSES, SKILLS, SETS, TRADERS, SEASONS, PASSIVE_UPGRADES,
  rollRarity, generateItemName, generateItemStats,
  getMonsterStats, getXpForLevel, formatNumber, getSkillCost,
  calculateItemPower, compareItems, generateSetItem, generateUniqueItem,
  getActiveSetBonuses, getTotalSetBonus,
  type Item, type Character
} from './gameData';

type Tab = 'battle' | 'character' | 'inventory' | 'skills' | 'trade' | 'passives';

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
  const [passives, setPassives] = useState<Record<string, number>>({});
  const [lastDrop, setLastDrop] = useState<Item | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('battle');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [killCount, setKillCount] = useState(0);
  const [showDamage, setShowDamage] = useState<{ amount: number; isCrit: boolean } | null>(null);
  const [monstersKilledInZone, setMonstersKilledInZone] = useState(0);
  const [isBoss, setIsBoss] = useState(false);
  const [traderCooldowns, setTraderCooldowns] = useState<Record<string, number>>({});
  const [currentSeason, setCurrentSeason] = useState(SEASONS[0]);
  const [seasonStartTime, setSeasonStartTime] = useState(Date.now());
  const [luckBoost, setLuckBoost] = useState(0);
  const [luckBoostExpiry, setLuckBoostExpiry] = useState(0);

  // Refs for game loop
  const characterRef = useRef(character);
  const monsterHpRef = useRef(monsterHp);
  const inventoryRef = useRef(inventory);
  const monstersKilledRef = useRef(monstersKilledInZone);
  const zoneRef = useRef(zone);
  const monsterIdxRef = useRef(monsterIdx);
  const equipmentRef = useRef(equipment);
  const skillsRef = useRef(skills);
  const passivesRef = useRef(passives);
  const isBossRef = useRef(isBoss);

  useEffect(() => { characterRef.current = character; }, [character]);
  useEffect(() => { monsterHpRef.current = monsterHp; }, [monsterHp]);
  useEffect(() => { inventoryRef.current = inventory; }, [inventory]);
  useEffect(() => { monstersKilledRef.current = monstersKilledInZone; }, [monstersKilledInZone]);
  useEffect(() => { zoneRef.current = zone; }, [zone]);
  useEffect(() => { monsterIdxRef.current = monsterIdx; }, [monsterIdx]);
  useEffect(() => { equipmentRef.current = equipment; }, [equipment]);
  useEffect(() => { skillsRef.current = skills; }, [skills]);
  useEffect(() => { passivesRef.current = passives; }, [passives]);
  useEffect(() => { isBossRef.current = isBoss; }, [isBoss]);

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

  const getPassiveBonuses = useCallback(() => {
    const bonuses = { atk: 0, def: 0, hp: 0, spd: 0, crit: 0, dodge: 0, lck: 0, xp: 0, gold: 0, loot: 0, regen: 0, thorns: 0 };
    PASSIVE_UPGRADES.forEach(passive => {
      const level = passivesRef.current[passive.id] || 0;
      if (level > 0) {
        const value = passive.effectPerLevel * level;
        if (passive.effect in bonuses) {
          bonuses[passive.effect as keyof typeof bonuses] += value;
        }
      }
    });
    return bonuses;
  }, []);

  const getTotalStats = useCallback(() => {
    const eqStats = getEquipmentStats();
    const skillBonuses = getSkillBonuses();
    const passiveBonuses = getPassiveBonuses();
    const setBonuses = getTotalSetBonus(equipmentRef.current);
    const char = characterRef.current;
    
    // Apply season modifiers
    const seasonMultiplier = (stat: string) => {
      const mod = currentSeason.modifiers.find(m => m.stat === stat || m.stat === 'ALL');
      return mod ? mod.value / 100 : 0;
    };
    
    const baseAtk = char.atk + eqStats.ATK + skillBonuses.atk + setBonuses.ATK + setBonuses.ALL;
    const baseDef = char.def + eqStats.DEF + skillBonuses.def + setBonuses.DEF + setBonuses.ALL;
    const baseHp = char.maxHp + eqStats.HP + skillBonuses.hp + setBonuses.HP + setBonuses.ALL;
    const baseSpd = char.spd + eqStats.SPD + skillBonuses.spd + setBonuses.SPD + setBonuses.ALL;
    const baseCrit = char.crit + eqStats.CRIT + skillBonuses.crit + setBonuses.CRIT + setBonuses.ALL;
    const baseDodge = char.dodge + eqStats.DODGE + skillBonuses.dodge + setBonuses.DODGE + setBonuses.ALL;
    const baseLck = char.lck + eqStats.LCK + skillBonuses.lck + setBonuses.LCK + setBonuses.ALL + luckBoost;
    
    // Apply passive percentage bonuses
    const atkWithPassive = Math.floor(baseAtk * (1 + passiveBonuses.atk / 100));
    const defWithPassive = Math.floor(baseDef * (1 + passiveBonuses.def / 100));
    const hpWithPassive = Math.floor(baseHp * (1 + passiveBonuses.hp / 100));
    const spdWithPassive = Math.floor(baseSpd * (1 + passiveBonuses.spd / 100));
    const critWithPassive = Math.floor(baseCrit * (1 + passiveBonuses.crit / 100));
    const dodgeWithPassive = Math.floor(baseDodge * (1 + passiveBonuses.dodge / 100));
    const lckWithPassive = Math.floor(baseLck * (1 + passiveBonuses.lck / 100));
    
    return {
      atk: Math.floor(atkWithPassive * (1 + seasonMultiplier('ATK'))),
      def: Math.floor(defWithPassive * (1 + seasonMultiplier('DEF'))),
      maxHp: Math.floor(hpWithPassive * (1 + seasonMultiplier('HP'))),
      spd: Math.floor(spdWithPassive * (1 + seasonMultiplier('SPD'))),
      crit: Math.floor(critWithPassive * (1 + seasonMultiplier('CRIT'))),
      dodge: Math.floor(dodgeWithPassive * (1 + seasonMultiplier('DODGE'))),
      lck: Math.floor(lckWithPassive * (1 + seasonMultiplier('LCK'))),
      xpBonus: skillBonuses.xp + passiveBonuses.xp,
      goldBonus: skillBonuses.gold + passiveBonuses.gold + (currentSeason.modifiers.find(m => m.stat === 'GOLD')?.value || 0),
      lootBonus: skillBonuses.loot + passiveBonuses.loot + (currentSeason.modifiers.find(m => m.stat === 'LOOT')?.value || 0),
      regen: passiveBonuses.regen,
      thorns: passiveBonuses.thorns,
    };
  }, [getEquipmentStats, getSkillBonuses, getPassiveBonuses, currentSeason, luckBoost]);

  const spawnMonster = useCallback(() => {
    const idx = monsterIdxRef.current;
    const z = zoneRef.current;
    const killed = monstersKilledRef.current;
    
    // Boss every 10 kills
    if (killed > 0 && killed % 10 === 0) {
      const bossIdx = Math.min(Math.floor(z / 3), BOSSES.length - 1);
      const boss = BOSSES[bossIdx];
      const stats = getMonsterStats(boss, z);
      setMonsterHp(stats.hp * 2);
      setMonsterMaxHp(stats.hp * 2);
      setIsBoss(true);
      setBattleLog(prev => [...prev.slice(-9), `⚠️ БОСС: ${boss.icon} ${boss.name} (Ур.${z})!`]);
    } else {
      const monster = MONSTERS[idx];
      const stats = getMonsterStats(monster, z);
      setMonsterHp(stats.hp);
      setMonsterMaxHp(stats.hp);
      setIsBoss(false);
      setBattleLog(prev => [...prev.slice(-9), `Появился ${monster.icon} ${monster.name} (Ур.${z})!`]);
    }
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
        const isBossKill = isBossRef.current;
        
        if (Math.random() * 100 < lootChance || isBossKill) {
          let item: Item;
          
          // Boss guaranteed unique drop
          if (isBossKill && Math.random() < 0.5) {
            item = generateUniqueItem(z);
            setBattleLog(prev => [...prev.slice(-9), `🌟 УНИКАЛЬНЫЙ ПРЕДМЕТ: ${item.name}!`]);
          }
          // Set item drop chance
          else if (Math.random() < 0.15) {
            const slot = EQUIPMENT_SLOTS[Math.floor(Math.random() * EQUIPMENT_SLOTS.length)];
            const setName = SETS[Math.floor(Math.random() * SETS.length)].name;
            const rarityIndex = Math.max(3, rollRarity(totalStats.lck));
            item = generateSetItem(rarityIndex, slot, z, setName);
          }
          // Normal drop
          else {
            const rarityIndex = rollRarity(totalStats.lck);
            const slot = EQUIPMENT_SLOTS[Math.floor(Math.random() * EQUIPMENT_SLOTS.length)];
            item = {
              id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
              name: generateItemName(slot, rarityIndex),
              slot: slot.name,
              icon: slot.icon,
              rarityIndex,
              level: z,
              stats: generateItemStats(rarityIndex, slot, z),
              value: Math.floor((5 + Math.random() * 10) * RARITIES[rarityIndex].multiplier * (1 + z / 5)),
            };
          }
          
          setLastDrop(item);
          
          // Auto-equip if better than current
          const currentItem = equipmentRef.current[item.slot];
          const comparison = compareItems(currentItem, item);
          
          if (comparison.better && comparison.difference > 0) {
            // Auto-equip better item
            setEquipment(prev => ({ ...prev, [item.slot]: item }));
            if (currentItem) {
              setInventory(prev => {
                if (prev.length >= 100) return prev;
                return [...prev, currentItem];
              });
            }
            setBattleLog(prev => [...prev.slice(-9), `✨ Авто-экипировка: ${item.name} лучше текущего!`]);
          } else {
            // Add to inventory
            if (inventoryRef.current.length < 100) {
              setInventory(prev => [...prev, item]);
            }
          }
          
          setIsBoss(false);
        }

        // Next monster or zone
        const killed = monstersKilledRef.current + 1;
        if (killed >= 10) {
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
      const regenBonus = totalStats.regen || 0;
      const regenPercent = 0.05 + (regenBonus / 100);
      setCharacter(prev => ({
        ...prev,
        hp: Math.min(totalStats.maxHp, prev.hp + Math.floor(totalStats.maxHp * regenPercent)),
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

  const buyPassive = (passiveId: string) => {
    const passive = PASSIVE_UPGRADES.find(p => p.id === passiveId)!;
    const level = passives[passiveId] || 0;
    if (level >= passive.maxLevel) return;
    const cost = Math.floor(passive.baseCost * Math.pow(passive.costMultiplier, level));
    if (character.gold >= cost) {
      setCharacter(prev => ({ ...prev, gold: prev.gold - cost }));
      setPassives(prev => ({ ...prev, [passiveId]: level + 1 }));
    }
  };

  const autoEquip = () => {
    // Group inventory by slot
    const itemsBySlot: Record<string, Item[]> = {};
    inventory.forEach(item => {
      if (!itemsBySlot[item.slot]) itemsBySlot[item.slot] = [];
      itemsBySlot[item.slot].push(item);
    });

    // For each slot, find the best item
    const newEquipment: Record<string, Item | null> = { ...equipment };
    const itemsToEquip: Item[] = [];
    const itemsToRemove: Item[] = [];

    Object.keys(itemsBySlot).forEach(slot => {
      const items = itemsBySlot[slot];
      const currentItem = equipment[slot];
      
      // Find best item in inventory for this slot
      let bestItem = items[0];
      let bestPower = calculateItemPower(items[0]);
      
      for (let i = 1; i < items.length; i++) {
        const power = calculateItemPower(items[i]);
        if (power > bestPower) {
          bestPower = power;
          bestItem = items[i];
        }
      }

      // Compare with current equipped item
      const comparison = compareItems(currentItem, bestItem);
      
      if (comparison.better) {
        itemsToEquip.push(bestItem);
        if (currentItem) {
          itemsToRemove.push(currentItem);
        }
        newEquipment[slot] = bestItem;
      }
    });

    // Apply changes
    if (itemsToEquip.length > 0) {
      setEquipment(newEquipment);
      setInventory(prev => {
        let newInv = prev.filter(item => !itemsToEquip.some(eq => eq.id === item.id));
        // Add back old equipped items
        itemsToRemove.forEach(oldItem => {
          newInv.push(oldItem);
        });
        return newInv;
      });
      setBattleLog(prev => [...prev.slice(-9), `🔄 Авто-экипировка: заменено ${itemsToEquip.length} предметов`]);
    }
  };

  const getItemComparison = (item: Item) => {
    const currentItem = equipment[item.slot];
    return compareItems(currentItem, item);
  };

  // Trader functions
  const useTrader = (traderId: string) => {
    const trader = TRADERS.find(t => t.id === traderId)!;
    const cooldown = traderCooldowns[traderId] || 0;
    
    if (cooldown > 0) return;
    if (character.gold < trader.cost) return;

    setCharacter(prev => ({ ...prev, gold: prev.gold - trader.cost }));
    setTraderCooldowns(prev => ({ ...prev, [traderId]: trader.cooldown }));

    switch (traderId) {
      case 'scavenger':
        const toScrap = inventory.filter(i => i.rarityIndex <= 2 && !i.isUnique);
        const totalValue = toScrap.reduce((sum, i) => sum + i.value, 0);
        setInventory(prev => prev.filter(i => i.rarityIndex > 2 || i.isUnique));
        setCharacter(prev => ({ ...prev, gold: prev.gold + totalValue }));
        setBattleLog(prev => [...prev.slice(-9), `🧹 Сборщик разобрал ${toScrap.length} предметов за 💰${formatNumber(totalValue)}`]);
        break;
        
      case 'enchanter':
        if (inventory.length > 0) {
          const randomIdx = Math.floor(Math.random() * inventory.length);
          const item = inventory[randomIdx];
          const upgradedItem = {
            ...item,
            level: item.level + 1,
            stats: item.stats.map(s => ({ ...s, value: Math.floor(s.value * 1.2) })),
            value: Math.floor(item.value * 1.5),
          };
          setInventory(prev => {
            const newInv = [...prev];
            newInv[randomIdx] = upgradedItem;
            return newInv;
          });
          setBattleLog(prev => [...prev.slice(-9), `🔮 Зачарователь улучшил ${item.name} до уровня ${upgradedItem.level}!`]);
        }
        break;
        
      case 'mystic':
        const lowItems = inventory.filter(i => !i.isUnique).slice(0, 3);
        if (lowItems.length >= 3) {
          const avgRarity = Math.min(9, Math.floor(lowItems.reduce((sum, i) => sum + i.rarityIndex, 0) / 3) + 1);
          const slot = EQUIPMENT_SLOTS[Math.floor(Math.random() * EQUIPMENT_SLOTS.length)];
          const newItem: Item = {
            id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
            name: generateItemName(slot, avgRarity),
            slot: slot.name,
            icon: slot.icon,
            rarityIndex: avgRarity,
            level: zone,
            stats: generateItemStats(avgRarity, slot, zone),
            value: Math.floor((5 + Math.random() * 10) * RARITIES[avgRarity].multiplier * (1 + zone / 5)),
          };
          setInventory(prev => {
            const newInv = prev.filter(i => !lowItems.includes(i));
            return [...newInv, newItem];
          });
          setBattleLog(prev => [...prev.slice(-9), `🎲 Мистик трансмутировал 3 предмета в ${newItem.name}!`]);
        }
        break;
        
      case 'merchant':
        const rarity = Math.min(9, 3 + Math.floor(Math.random() * 3));
        const slot = EQUIPMENT_SLOTS[Math.floor(Math.random() * EQUIPMENT_SLOTS.length)];
        const boughtItem: Item = {
          id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
          name: generateItemName(slot, rarity),
          slot: slot.name,
          icon: slot.icon,
          rarityIndex: rarity,
          level: zone,
          stats: generateItemStats(rarity, slot, zone),
          value: Math.floor((5 + Math.random() * 10) * RARITIES[rarity].multiplier * (1 + zone / 5)),
        };
        if (inventory.length < 100) {
          setInventory(prev => [...prev, boughtItem]);
          setBattleLog(prev => [...prev.slice(-9), `💰 Торговец продал ${boughtItem.name}!`]);
        }
        break;
        
      case 'alchemist':
        setCharacter(prev => ({ ...prev, xp: prev.xp + 100 }));
        setBattleLog(prev => [...prev.slice(-9), `⚗️ Алхимик конвертировал золото в +100 XP!`]);
        break;
        
      case 'fortune_teller':
        setLuckBoost(50);
        setLuckBoostExpiry(Date.now() + 3600000); // 1 hour
        setBattleLog(prev => [...prev.slice(-9), `🔮 Гадалка усилила удачу на +50% на 1 час!`]);
        break;
    }
  };

  // Update cooldowns and check luck boost expiry
  useEffect(() => {
    const interval = setInterval(() => {
      setTraderCooldowns(prev => {
        const newCooldowns = { ...prev };
        Object.keys(newCooldowns).forEach(key => {
          if (newCooldowns[key] > 0) {
            newCooldowns[key] = Math.max(0, newCooldowns[key] - 1);
          }
        });
        return newCooldowns;
      });

      // Check luck boost expiry
      if (luckBoostExpiry > 0 && Date.now() > luckBoostExpiry) {
        setLuckBoost(0);
        setLuckBoostExpiry(0);
      }

      // Check season rotation (every 7 days)
      const seasonDuration = currentSeason.duration * 24 * 60 * 60 * 1000;
      if (Date.now() - seasonStartTime > seasonDuration) {
        const currentIdx = SEASONS.findIndex(s => s.id === currentSeason.id);
        const nextIdx = (currentIdx + 1) % SEASONS.length;
        setCurrentSeason(SEASONS[nextIdx]);
        setSeasonStartTime(Date.now());
        setBattleLog(prev => [...prev.slice(-9), `🌟 Новый сезон: ${SEASONS[nextIdx].name}!`]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSeason, seasonStartTime, luckBoostExpiry]);

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
            <div className="flex items-center gap-4 text-sm flex-wrap">
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
              <div className="text-center px-3 py-1 rounded-lg border" style={{ borderColor: currentSeason.color, backgroundColor: currentSeason.color + '20' }}>
                <div className="text-xs" style={{ color: currentSeason.color }}>Сезон</div>
                <div className="text-sm font-bold" style={{ color: currentSeason.color }}>{currentSeason.icon} {currentSeason.name}</div>
              </div>
              {luckBoost > 0 && (
                <div className="text-center px-3 py-1 rounded-lg border border-purple-500 bg-purple-500/20">
                  <div className="text-xs text-purple-400">Удача</div>
                  <div className="text-sm font-bold text-purple-300">🍀 +{luckBoost}%</div>
                </div>
              )}
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
        <div className="max-w-7xl mx-auto px-4 flex gap-1 flex-wrap">
          {([
            { id: 'battle' as Tab, label: '⚔️ Бой' },
            { id: 'character' as Tab, label: '👤 Персонаж' },
            { id: 'inventory' as Tab, label: '🎒 Инвентарь' },
            { id: 'skills' as Tab, label: '📖 Навыки' },
            { id: 'passives' as Tab, label: '💎 Пассивки' },
            { id: 'trade' as Tab, label: '🏪 Торговля' },
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
              <div className={`bg-gray-900/50 rounded-xl border-2 p-6 ${isBoss ? 'border-red-500' : 'border-gray-800'}`} style={isBoss ? { boxShadow: '0 0 30px rgba(239,68,68,0.3)' } : {}}>
                <div className="text-center mb-4">
                  <div className="text-sm text-gray-500 mb-2">
                    Зона {zone} • Убито: {monstersKilledInZone}/10
                    {isBoss && <span className="ml-2 text-red-400 font-bold">⚠️ БОСС!</span>}
                  </div>
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
                  <div className={`text-xl font-bold ${isBoss ? 'text-red-400' : 'text-gray-200'}`}>{monster.name}</div>
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
                  {totalStats.regen > 0 && (
                    <div className="flex justify-between"><span className="text-gray-500">❤️ Регенерация</span><span className="text-pink-400 font-bold">+{totalStats.regen}%</span></div>
                  )}
                  {totalStats.thorns > 0 && (
                    <div className="flex justify-between"><span className="text-gray-500">🌵 Шипы</span><span className="text-green-400 font-bold">+{totalStats.thorns}%</span></div>
                  )}
                </div>
                
                {/* Set Bonuses */}
                {getActiveSetBonuses(equipment).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <h4 className="text-xs font-bold text-gray-400 mb-2">Сетовые бонусы</h4>
                    {getActiveSetBonuses(equipment).map((set, i) => {
                      const setInfo = SETS.find(s => s.name === set.setName)!;
                      return (
                        <div key={i} className="mb-2">
                          <div className="text-xs font-bold" style={{ color: setInfo.color }}>
                            {set.setName} ({set.count}/4)
                          </div>
                          {set.activeBonuses.map((bonus, j) => (
                            <div key={j} className="text-xs text-green-400 ml-2">
                              ({bonus.count}) +{bonus.value} {bonus.effect}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
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
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h3 className="text-lg font-bold text-gray-200">Инвентарь ({inventory.length}/100)</h3>
              <button
                onClick={autoEquip}
                className="px-3 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-sm font-bold"
              >
                ⚡ Авто-экипировка
              </button>
            </div>

            {/* Scrap buttons for all rarities */}
            <div className="flex flex-wrap gap-2">
              {RARITIES.slice(0, 7).map((rarity, idx) => {
                const count = inventory.filter(i => i.rarityIndex === idx && !i.isUnique).length;
                if (count === 0) return null;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      const toScrap = inventory.filter(i => i.rarityIndex === idx && !i.isUnique);
                      const totalValue = toScrap.reduce((sum, i) => sum + i.value, 0);
                      setInventory(prev => prev.filter(i => i.rarityIndex !== idx || i.isUnique));
                      setCharacter(prev => ({ ...prev, gold: prev.gold + totalValue }));
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all hover:scale-105"
                    style={{
                      borderColor: rarity.borderColor,
                      backgroundColor: rarity.bgColor,
                      color: rarity.color,
                    }}
                  >
                    🗑️ {rarity.name} ({count})
                  </button>
                );
              })}
            </div>

            {inventory.length === 0 ? (
              <div className="text-center text-gray-500 py-20">
                <div className="text-6xl mb-4">🎒</div>
                <p>Инвентарь пуст</p>
                <p className="text-sm text-gray-600 mt-2">Убивайте монстров чтобы получать лут</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
                {inventory.map(item => {
                  const comparison = getItemComparison(item);
                  const setInfo = item.setName ? SETS.find(s => s.name === item.setName) : null;
                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border cursor-pointer hover:scale-105 transition-all relative"
                      style={{
                        borderColor: item.isUnique ? '#fbbf24' : RARITIES[item.rarityIndex].borderColor,
                        backgroundColor: item.isUnique ? 'rgba(251,191,36,0.1)' : RARITIES[item.rarityIndex].bgColor,
                        boxShadow: item.isUnique ? '0 0 15px rgba(251,191,36,0.4)' : undefined,
                      }}
                      onClick={() => setSelectedItem(item)}
                    >
                      {/* Unique indicator */}
                      {item.isUnique && (
                        <div className="absolute top-2 left-2">
                          <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-yellow-600/80 text-white">★ УНИКАЛЬНЫЙ</span>
                        </div>
                      )}
                      {/* Set indicator */}
                      {setInfo && (
                        <div className="absolute top-2 left-2">
                          <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: setInfo.color + '80', color: 'white' }}>
                            {setInfo.name.split(' ')[0]}
                          </span>
                        </div>
                      )}
                      {/* Comparison indicator */}
                      {equipment[item.slot] && (
                        <div className="absolute top-2 right-2">
                          {comparison.better ? (
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-600/80 text-white">↑ +{comparison.difference}</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-600/80 text-white">↓ {comparison.difference}</span>
                          )}
                        </div>
                      )}
                      <div className={`flex items-center gap-2 ${item.isUnique || setInfo ? 'mt-6' : ''}`}>
                        <span className="text-2xl">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs" style={{ color: item.isUnique ? '#fbbf24' : RARITIES[item.rarityIndex].color }}>
                            {item.isUnique ? 'Уникальный' : RARITIES[item.rarityIndex].name}
                          </div>
                          <div className="text-sm font-medium text-gray-200 truncate">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.slot} • Ур.{item.level}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.stats.slice(0, 3).map((s, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded text-xs bg-black/30" style={{ color: item.isUnique ? '#fbbf24' : RARITIES[item.rarityIndex].color }}>
                            +{s.value} {s.name}
                          </span>
                        ))}
                      </div>
                      {item.specialEffect && (
                        <div className="text-xs text-yellow-400 mt-1 italic">✨ {item.specialEffect}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {selectedItem && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedItem(null)}>
                <div
                  className="max-w-lg w-full rounded-xl border-2 p-6"
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
                      <div className="text-xs uppercase" style={{ color: selectedItem.isUnique ? '#fbbf24' : RARITIES[selectedItem.rarityIndex].color }}>
                        {selectedItem.isUnique ? '★ Уникальный' : RARITIES[selectedItem.rarityIndex].name}
                      </div>
                      <div className="text-xl font-bold" style={{ color: selectedItem.isUnique ? '#fbbf24' : RARITIES[selectedItem.rarityIndex].color }}>
                        {selectedItem.name}
                      </div>
                      <div className="text-sm text-gray-400">{selectedItem.slot} • Уровень {selectedItem.level}</div>
                      {selectedItem.setName && (
                        <div className="text-xs mt-1" style={{ color: SETS.find(s => s.name === selectedItem.setName)?.color }}>
                          Сет: {selectedItem.setName}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comparison with current */}
                  {equipment[selectedItem.slot] && (
                    <div className="mb-4 p-3 rounded-lg bg-black/30 border border-gray-700">
                      <div className="text-xs text-gray-400 mb-2">Сравнение с текущим:</div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300">Общая мощь:</span>
                        <span className={`font-bold ${getItemComparison(selectedItem).better ? 'text-green-400' : 'text-red-400'}`}>
                          {getItemComparison(selectedItem).better ? '↑' : '↓'} {Math.abs(getItemComparison(selectedItem).difference)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {getItemComparison(selectedItem).statChanges.map((change, i) => (
                          <div key={i} className="flex justify-between text-xs">
                            <span className="text-gray-400">{change.name}:</span>
                            <span className={change.value > 0 ? 'text-green-400' : 'text-red-400'}>
                              {change.value > 0 ? '+' : ''}{change.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {selectedItem.stats.map((s, i) => (
                      <div key={i} className="bg-black/30 rounded px-3 py-2 text-sm">
                        <span className="text-gray-400">{s.name}:</span>{' '}
                        <span style={{ color: selectedItem.isUnique ? '#fbbf24' : RARITIES[selectedItem.rarityIndex].color }}>+{s.value}</span>
                      </div>
                    ))}
                  </div>
                  
                  {selectedItem.specialEffect && (
                    <div className="mb-4 p-3 rounded-lg bg-yellow-900/20 border border-yellow-700/50">
                      <div className="text-xs text-yellow-400 font-bold mb-1">✨ Особый эффект:</div>
                      <div className="text-sm text-yellow-300">{selectedItem.specialEffect}</div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button onClick={() => equipItem(selectedItem)} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-sm">
                      ⚔️ Экипировать
                    </button>
                    {!selectedItem.isUnique && (
                      <button onClick={() => scrapItem(selectedItem)} className="flex-1 py-2 rounded-lg bg-red-900/50 hover:bg-red-800/50 border border-red-700 text-red-300 text-sm">
                        🗑️ Разобрать (💰{formatNumber(selectedItem.value)})
                      </button>
                    )}
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

        {activeTab === 'passives' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-200">Пассивные улучшения</h3>
              <div className="text-sm text-yellow-400">💰 Золото: {formatNumber(character.gold)}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PASSIVE_UPGRADES.map(passive => {
                const level = passives[passive.id] || 0;
                const cost = Math.floor(passive.baseCost * Math.pow(passive.costMultiplier, level));
                const canAfford = character.gold >= cost;
                const isMaxed = level >= passive.maxLevel;
                
                return (
                  <div
                    key={passive.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isMaxed ? 'border-yellow-600 bg-yellow-900/10' :
                      canAfford ? 'border-cyan-700 hover:border-cyan-500' : 'border-gray-800 opacity-60'
                    }`}
                    style={{ backgroundColor: isMaxed ? 'rgba(234,179,8,0.05)' : canAfford ? 'rgba(6,182,212,0.05)' : 'rgba(0,0,0,0.3)' }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{passive.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-200">{passive.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-cyan-400">
                            {level}/{passive.maxLevel}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">{passive.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Текущий бонус: +{passive.effectPerLevel * level}% {passive.effect.toUpperCase()}
                        </div>
                      </div>
                      <button
                        onClick={() => buyPassive(passive.id)}
                        disabled={!canAfford || isMaxed}
                        className={`px-4 py-2 rounded-lg font-bold text-sm ${
                          isMaxed ? 'bg-yellow-600 text-white cursor-not-allowed' :
                          canAfford ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {isMaxed ? 'МАКС' : `💰${formatNumber(cost)}`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'trade' && (
          <div className="space-y-6">
            {/* Current Season */}
            <div className="rounded-xl border-2 p-6" style={{ borderColor: currentSeason.color, backgroundColor: currentSeason.color + '10', boxShadow: `0 0 30px ${currentSeason.color}40` }}>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-5xl">{currentSeason.icon}</span>
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-wider" style={{ color: currentSeason.color }}>Текущий сезон</div>
                  <div className="text-2xl font-bold" style={{ color: currentSeason.color }}>{currentSeason.name}</div>
                  <div className="text-sm text-gray-400">{currentSeason.description}</div>
                </div>
              </div>
              <div className="space-y-2">
                {currentSeason.modifiers.map((mod, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">{mod.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Traders */}
            <div>
              <h3 className="text-lg font-bold text-gray-200 mb-4">NPC-Торговцы</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TRADERS.map(trader => {
                  const cooldown = traderCooldowns[trader.id] || 0;
                  const canAfford = character.gold >= trader.cost;
                  const isAvailable = cooldown === 0 && canAfford;
                  
                  return (
                    <div
                      key={trader.id}
                      className={`p-4 rounded-xl border transition-all ${isAvailable ? 'border-cyan-700 hover:border-cyan-500' : 'border-gray-800 opacity-60'}`}
                      style={{ backgroundColor: isAvailable ? 'rgba(6,182,212,0.05)' : 'rgba(0,0,0,0.3)' }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-4xl">{trader.icon}</span>
                        <div className="flex-1">
                          <div className="font-bold text-gray-200">{trader.name}</div>
                          <div className="text-xs text-gray-400">{trader.service}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400 mb-3">{trader.description}</div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          {cooldown > 0 ? (
                            <span className="text-yellow-400">⏱️ {cooldown}с</span>
                          ) : trader.cost === 0 ? (
                            <span className="text-green-400">Бесплатно</span>
                          ) : (
                            <span className="text-yellow-400">💰 {formatNumber(trader.cost)}</span>
                          )}
                        </div>
                        <button
                          onClick={() => useTrader(trader.id)}
                          disabled={!isAvailable}
                          className={`px-4 py-2 rounded-lg font-bold text-sm ${isAvailable ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                        >
                          {cooldown > 0 ? 'Ожидание' : 'Использовать'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* All Seasons */}
            <div>
              <h3 className="text-lg font-bold text-gray-200 mb-4">Все сезоны</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SEASONS.map(season => {
                  const isCurrent = season.id === currentSeason.id;
                  return (
                    <div
                      key={season.id}
                      className={`p-4 rounded-xl border-2 transition-all ${isCurrent ? 'scale-105' : 'opacity-70'}`}
                      style={{ borderColor: season.color, backgroundColor: season.color + '10' }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{season.icon}</span>
                        <div>
                          <div className="font-bold" style={{ color: season.color }}>{season.name}</div>
                          {isCurrent && <div className="text-xs text-green-400">● Активен</div>}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mb-2">{season.description}</div>
                      <div className="space-y-1">
                        {season.modifiers.map((mod, i) => (
                          <div key={i} className="text-xs text-gray-300">• {mod.description}</div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
