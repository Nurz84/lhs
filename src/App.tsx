import { useState, useEffect, useRef, useCallback } from 'react';
import {
  RARITIES, EQUIPMENT_SLOTS, MONSTERS, BOSSES, SKILLS, SETS, TRADERS, SEASONS, PASSIVE_UPGRADES,
  rollRarity, generateItemName, generateItemStats,
  getMonsterStats, getXpForLevel, formatNumber, getSkillCost,
  calculateItemPower, compareItems, generateSetItem, generateUniqueItem,
  getActiveSetBonuses, getTotalSetBonus,
  type Item, type Character
} from './gameData';
import { YandexSDK } from './yandexSdk';

type Tab = 'battle' | 'character' | 'inventory' | 'skills' | 'passives' | 'trade' | 'leaderboard';

function App() {
  const [sdkReady, setSdkReady] = useState(false);
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
  const [isPaused, setIsPaused] = useState(false);
  const [showRewardedAd, setShowRewardedAd] = useState<{ type: string; callback: () => void } | null>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [lastDailyReward, setLastDailyReward] = useState(0);
  const [showDailyReward, setShowDailyReward] = useState(false);

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
  const isPausedRef = useRef(isPaused);

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
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

  // Инициализация Yandex SDK
  useEffect(() => {
    const initSDK = async () => {
      const ready = await YandexSDK.init();
      setSdkReady(ready);
      
      if (ready) {
        // Загрузка сохранения
        const savedData = await YandexSDK.loadProgress();
        if (savedData) {
          console.log('Загружено сохранение:', savedData);
          // Восстановление состояния игры
          if (savedData.character) setCharacter(savedData.character);
          if (savedData.inventory) setInventory(savedData.inventory);
          if (savedData.equipment) setEquipment(savedData.equipment);
          if (savedData.skills) setSkills(savedData.skills);
          if (savedData.passives) setPassives(savedData.passives);
          if (savedData.zone) setZone(savedData.zone);
          if (savedData.killCount) setKillCount(savedData.killCount);
        }
      }
    };
    
    initSDK();
  }, []);

  // Автосохранение каждые 30 секунд
  useEffect(() => {
    if (!sdkReady) return;
    
    const interval = setInterval(async () => {
      const data = {
        character: characterRef.current,
        inventory: inventoryRef.current,
        equipment: equipmentRef.current,
        skills: skillsRef.current,
        passives: passivesRef.current,
        zone: zoneRef.current,
        killCount: killCount,
        timestamp: Date.now()
      };
      
      await YandexSDK.saveProgress(data);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [sdkReady, killCount]);

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

  useEffect(() => {
    spawnMonster();
  }, [spawnMonster]);

  // Battle loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPausedRef.current) return;
      
      const totalStats = getTotalStats();
      const mIdx = monsterIdxRef.current;
      const z = zoneRef.current;
      const monster = MONSTERS[mIdx];
      const monsterStats = getMonsterStats(monster, z);

      const isCrit = Math.random() * 100 < totalStats.crit;
      let damage = Math.max(1, totalStats.atk - monsterStats.atk * 0.1);
      if (isCrit) damage *= 2;
      damage = Math.floor(damage * (0.9 + Math.random() * 0.2));

      const newMonsterHp = Math.max(0, monsterHpRef.current - damage);
      setMonsterHp(newMonsterHp);

      setShowDamage({ amount: damage, isCrit });
      setTimeout(() => setShowDamage(null), 300);

      if (newMonsterHp <= 0) {
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

        // Отправка рекорда в лидерборд
        YandexSDK.submitScore(characterRef.current.level, 'main');
        YandexSDK.submitScore(zoneRef.current, 'zone');
        YandexSDK.trackEvent('monster_killed', { monster: monster.name, zone: z, isBoss: isBossRef.current });

        const lootChance = 30 + totalStats.lootBonus;
        const isBossKill = isBossRef.current;
        
        if (Math.random() * 100 < lootChance || isBossKill) {
          let item: Item;
          
          if (isBossKill && Math.random() < 0.5) {
            item = generateUniqueItem(z);
            setBattleLog(prev => [...prev.slice(-9), `🌟 УНИКАЛЬНЫЙ ПРЕДМЕТ: ${item.name}!`]);
          } else if (Math.random() < 0.15) {
            const slot = EQUIPMENT_SLOTS[Math.floor(Math.random() * EQUIPMENT_SLOTS.length)];
            const setName = SETS[Math.floor(Math.random() * SETS.length)].name;
            const rarityIndex = Math.max(3, rollRarity(totalStats.lck));
            item = generateSetItem(rarityIndex, slot, z, setName);
          } else {
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
          
          const currentItem = equipmentRef.current[item.slot];
          const comparison = compareItems(currentItem, item);
          
          if (comparison.better && comparison.difference > 0) {
            setEquipment(prev => ({ ...prev, [item.slot]: item }));
            if (currentItem) {
              setInventory(prev => {
                if (prev.length >= 100) return prev;
                return [...prev, currentItem];
              });
            }
            setBattleLog(prev => [...prev.slice(-9), `✨ Авто-экипировка: ${item.name} лучше текущего!`]);
          } else {
            if (inventoryRef.current.length < 100) {
              setInventory(prev => [...prev, item]);
            }
          }
          
          setIsBoss(false);
        }

        const killed = monstersKilledRef.current + 1;
        if (killed >= 10) {
          setZone(prev => prev + 1);
          setMonstersKilledInZone(0);
          setMonsterIdx((mIdx + 1) % MONSTERS.length);
          
          // Interstitial реклама при смене зоны
          YandexSDK.showInterstitialAd(
            () => setIsPaused(true),
            () => setIsPaused(false)
          );
        } else {
          setMonsterIdx(Math.floor(Math.random() * Math.min(mIdx + 2, MONSTERS.length)));
        }

        setTimeout(() => spawnMonster(), 100);
      } else {
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
      if (isPausedRef.current) return;
      
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
    const itemsBySlot: Record<string, Item[]> = {};
    inventory.forEach(item => {
      if (!itemsBySlot[item.slot]) itemsBySlot[item.slot] = [];
      itemsBySlot[item.slot].push(item);
    });

    const newEquipment: Record<string, Item | null> = { ...equipment };
    const itemsToEquip: Item[] = [];
    const itemsToRemove: Item[] = [];

    Object.keys(itemsBySlot).forEach(slot => {
      const items = itemsBySlot[slot];
      const currentItem = equipment[slot];
      
      let bestItem = items[0];
      let bestPower = calculateItemPower(items[0]);
      
      for (let i = 1; i < items.length; i++) {
        const power = calculateItemPower(items[i]);
        if (power > bestPower) {
          bestPower = power;
          bestItem = items[i];
        }
      }

      const comparison = compareItems(currentItem, bestItem);
      
      if (comparison.better) {
        itemsToEquip.push(bestItem);
        if (currentItem) {
          itemsToRemove.push(currentItem);
        }
        newEquipment[slot] = bestItem;
      }
    });

    if (itemsToEquip.length > 0) {
      setEquipment(newEquipment);
      setInventory(prev => {
        let newInv = prev.filter(item => !itemsToEquip.some(eq => eq.id === item.id));
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

  // Rewarded Ad функции с UI
  const requestRewardedAd = (type: string, callback: () => void) => {
    YandexSDK.showRewardedAd(
      () => {
        callback();
        YandexSDK.trackEvent('ad_watched', { type });
        setShowRewardModal(true);
        setTimeout(() => setShowRewardModal(false), 2000);
      },
      () => setIsPaused(true),
      () => setIsPaused(false)
    );
  };

  // Ежедневные награды
  const claimDailyReward = (doubleReward: boolean = false) => {
    const now = Date.now();
    const hoursSinceLastReward = (now - lastDailyReward) / (1000 * 60 * 60);
    
    if (hoursSinceLastReward >= 24) {
      const goldReward = 100 * character.level * (doubleReward ? 2 : 1);
      const xpReward = 50 * character.level * (doubleReward ? 2 : 1);
      
      setCharacter(prev => ({
        ...prev,
        gold: prev.gold + goldReward,
        xp: prev.xp + xpReward
      }));
      
      setLastDailyReward(now);
      YandexSDK.trackEvent('daily_reward_claimed', { gold: goldReward, xp: xpReward, doubled: doubleReward });
      setBattleLog(prev => [...prev.slice(-9), `🎁 Ежедневная награда: +${goldReward} 💰, +${xpReward} XP${doubleReward ? ' (x2!)' : ''}`]);
      
      if (doubleReward) {
        requestRewardedAd('double_daily', () => {
          setCharacter(prev => ({
            ...prev,
            gold: prev.gold + goldReward,
            xp: prev.xp + xpReward
          }));
        });
      }
    }
  };

  // Загрузка лидерборда
  const loadLeaderboard = async (boardId: string = 'main') => {
    const data = await YandexSDK.getTopPlayers(boardId, 10);
    setLeaderboardData(data);
  };

  // Проверка ежедневной награды при старте
  useEffect(() => {
    const hoursSinceLastReward = (Date.now() - lastDailyReward) / (1000 * 60 * 60);
    if (hoursSinceLastReward >= 24) {
      setShowDailyReward(true);
    }
  }, []);



  // Trader functions с rewarded ads
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
        setLuckBoostExpiry(Date.now() + 3600000);
        setBattleLog(prev => [...prev.slice(-9), `🔮 Гадалка усилила удачу на +50% на 1 час!`]);
        break;
    }
  };

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

      if (luckBoostExpiry > 0 && Date.now() > luckBoostExpiry) {
        setLuckBoost(0);
        setLuckBoostExpiry(0);
      }

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
    <div className="min-h-screen text-gold" style={{ backgroundColor: '#1a1208', fontFamily: "'Crimson Text', Georgia, serif" }}>
      <header className="border-b-2 border-wood sticky top-0 z-50 shadow-lg" style={{ backgroundColor: '#2a1f0e' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h1 className="text-3xl font-bold tracking-wider" style={{ color: '#f0c75e', fontFamily: "'Cinzel', serif" }}>
              ⚔️ Loot Hunter Stories
            </h1>
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <div className="text-center">
                <div className="text-xs" style={{ color: '#8b7355' }}>Уровень</div>
                <div className="text-lg font-bold" style={{ color: '#d4a843' }}>{character.level}</div>
              </div>
              <div className="text-center">
                <div className="text-xs" style={{ color: '#8b7355' }}>Зона</div>
                <div className="text-lg font-bold" style={{ color: '#b8860b' }}>{zone}</div>
              </div>
              <div className="text-center">
                <div className="text-xs" style={{ color: '#8b7355' }}>💰 Золото</div>
                <div className="text-lg font-bold" style={{ color: '#f0c75e' }}>{formatNumber(character.gold)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs" style={{ color: '#8b7355' }}>🎯 Очки навыков</div>
                <div className="text-lg font-bold" style={{ color: '#6b8e4e' }}>{character.skillPoints}</div>
              </div>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1" style={{ color: '#8b7355' }}>
              <span>XP: {formatNumber(character.xp)} / {formatNumber(character.xpToNext)}</span>
              <span>{((character.xp / character.xpToNext) * 100).toFixed(1)}%</span>
            </div>
            <div className="h-3 rounded overflow-hidden" style={{ backgroundColor: '#0d0a04', border: '1px solid #5c3d1e' }}>
              <div
                className="h-full transition-all"
                style={{ 
                  width: `${(character.xp / character.xpToNext) * 100}%`,
                  background: 'linear-gradient(180deg, #4a7fb5 0%, #2c5f8a 100%)'
                }}
              />
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b-2" style={{ backgroundColor: '#231809', borderColor: '#5c3d1e' }}>
        <div className="max-w-7xl mx-auto px-4 flex gap-1 flex-wrap">
          {([
            { id: 'battle' as Tab, label: '⚔️ Бой' },
            { id: 'character' as Tab, label: '👤 Персонаж' },
            { id: 'inventory' as Tab, label: '🎒 Инвентарь' },
            { id: 'skills' as Tab, label: '📖 Навыки' },
            { id: 'passives' as Tab, label: '💎 Пассивки' },
            { id: 'trade' as Tab, label: '🏪 Торговля' },
            { id: 'leaderboard' as Tab, label: '🏆 Рейтинг' },
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-3 text-sm font-medium border-b-2 transition-all"
              style={{
                borderBottomColor: activeTab === tab.id ? '#b8860b' : 'transparent',
                color: activeTab === tab.id ? '#f0c75e' : '#8b7355',
                fontFamily: "'Cinzel', serif",
                letterSpacing: '0.05em',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
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
              <div className="rounded-xl border-2 p-6" style={{ 
                backgroundColor: '#2a1f0e', 
                borderColor: isBoss ? '#8b2020' : '#5c3d1e',
                boxShadow: isBoss ? '0 0 30px rgba(139,32,32,0.4), inset 0 0 20px rgba(0,0,0,0.5)' : 'inset 0 0 20px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.5)'
              }}>
                <div className="text-center mb-4">
                  <div className="text-sm mb-2" style={{ color: '#8b7355' }}>
                    Зона {zone} • Убито: {monstersKilledInZone}/10
                    {isBoss && <span className="ml-2 font-bold" style={{ color: '#c0392b' }}>⚠️ БОСС!</span>}
                  </div>
                  <div className="text-6xl mb-2 relative inline-block">
                    {monster.icon}
                    {showDamage && (
                      <div
                        className="absolute -top-4 -right-8 text-2xl font-bold animate-bounce"
                        style={{ color: showDamage.isCrit ? '#f0c75e' : '#c0392b' }}
                      >
                        -{formatNumber(showDamage.amount)}{showDamage.isCrit ? '!' : ''}
                      </div>
                    )}
                  </div>
                  <div className="text-xl font-bold" style={{ color: isBoss ? '#c0392b' : '#e8dcc4' }}>{monster.name}</div>
                  <div className="text-sm" style={{ color: '#8b7355' }}>Уровень {zone}</div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1" style={{ color: '#8b7355' }}>
                    <span>HP: {formatNumber(monsterHp)} / {formatNumber(monsterMaxHp)}</span>
                    <span>{((monsterHp / monsterMaxHp) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-4 rounded overflow-hidden" style={{ backgroundColor: '#0d0a04', border: '1px solid #5c3d1e' }}>
                    <div
                      className="h-full transition-all"
                      style={{ 
                        width: `${(monsterHp / monsterMaxHp) * 100}%`,
                        background: 'linear-gradient(180deg, #8b2020 0%, #5c1a1a 100%)'
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1" style={{ color: '#8b7355' }}>
                    <span>Ваше HP: {formatNumber(character.hp)} / {formatNumber(totalStats.maxHp)}</span>
                    <span>{((character.hp / totalStats.maxHp) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-4 rounded overflow-hidden" style={{ backgroundColor: '#0d0a04', border: '1px solid #5c3d1e' }}>
                    <div
                      className="h-full transition-all"
                      style={{ 
                        width: `${(character.hp / totalStats.maxHp) * 100}%`,
                        background: 'linear-gradient(180deg, #4a7a3a 0%, #2d5a1e 100%)'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border-2 p-4" style={{ backgroundColor: '#2a1f0e', borderColor: '#5c3d1e', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
                <h3 className="text-sm font-bold mb-2" style={{ color: '#b8860b', fontFamily: "'Cinzel', serif" }}>📜 Журнал боя</h3>
                <div className="space-y-1 max-h-40 overflow-y-auto text-sm custom-scrollbar">
                  {battleLog.slice().reverse().map((log, i) => (
                    <div key={i} style={{ color: '#8b7355' }}>{log}</div>
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
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border-2 p-4" style={{ backgroundColor: '#2a1f0e', borderColor: '#5c3d1e', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
                <h3 className="text-sm font-bold mb-3" style={{ color: '#b8860b', fontFamily: "'Cinzel', serif" }}>⚔️ Характеристики</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span style={{ color: '#8b7355' }}>⚔️ ATK</span><span className="font-bold" style={{ color: '#c0392b' }}>{totalStats.atk}</span></div>
                  <div className="flex justify-between"><span style={{ color: '#8b7355' }}>🛡️ DEF</span><span className="font-bold" style={{ color: '#4a7fb5' }}>{totalStats.def}</span></div>
                  <div className="flex justify-between"><span style={{ color: '#8b7355' }}>❤️ HP</span><span className="font-bold" style={{ color: '#6b8e4e' }}>{totalStats.maxHp}</span></div>
                  <div className="flex justify-between"><span style={{ color: '#8b7355' }}>⚡ SPD</span><span className="font-bold" style={{ color: '#d4a843' }}>{totalStats.spd}</span></div>
                  <div className="flex justify-between"><span style={{ color: '#8b7355' }}>🎯 CRIT</span><span className="font-bold" style={{ color: '#e67e22' }}>{totalStats.crit}%</span></div>
                  <div className="flex justify-between"><span style={{ color: '#8b7355' }}>💨 DODGE</span><span className="font-bold" style={{ color: '#1abc9c' }}>{totalStats.dodge}%</span></div>
                  <div className="flex justify-between"><span style={{ color: '#8b7355' }}>🍀 LCK</span><span className="font-bold" style={{ color: '#9b59b6' }}>{totalStats.lck}</span></div>
                </div>
              </div>

              <div className="rounded-xl border-2 p-4" style={{ backgroundColor: '#2a1f0e', borderColor: '#5c3d1e', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
                <h3 className="text-sm font-bold mb-3" style={{ color: '#b8860b', fontFamily: "'Cinzel', serif" }}>🛡️ Экипировка</h3>
                <div className="grid grid-cols-2 gap-2">
                  {EQUIPMENT_SLOTS.map(slot => {
                    const item = equipment[slot.name];
                    return (
                      <div
                        key={slot.name}
                        className="p-2 rounded border text-center cursor-pointer transition-all"
                        style={{
                          borderColor: item ? RARITIES[item.rarityIndex].borderColor : '#5c3d1e',
                          backgroundColor: item ? RARITIES[item.rarityIndex].bgColor : '#1a1208',
                        }}
                        onClick={() => item && unequipItem(slot.name)}
                      >
                        <div className="text-2xl">{item ? item.icon : slot.icon}</div>
                        <div className="text-xs" style={{ color: '#8b7355' }}>{slot.name}</div>
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
            <div className="rounded-xl border-2 p-6" style={{ backgroundColor: '#2a1f0e', borderColor: '#5c3d1e' }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: '#d4a843', fontFamily: "'Cinzel', serif" }}>👤 Персонаж</h3>
              <div className="text-center mb-6">
                <div className="text-6xl mb-2">🧙</div>
                <div className="text-2xl font-bold" style={{ color: '#d4a843' }}>Уровень {character.level}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg p-3" style={{ backgroundColor: '#1a1208' }}>
                  <div style={{ color: '#8b7355' }}>⚔️ ATK</div>
                  <div className="text-xl font-bold" style={{ color: '#c0392b' }}>{totalStats.atk}</div>
                </div>
                <div className="rounded-lg p-3" style={{ backgroundColor: '#1a1208' }}>
                  <div style={{ color: '#8b7355' }}>🛡️ DEF</div>
                  <div className="text-xl font-bold" style={{ color: '#4a7fb5' }}>{totalStats.def}</div>
                </div>
                <div className="rounded-lg p-3" style={{ backgroundColor: '#1a1208' }}>
                  <div style={{ color: '#8b7355' }}>❤️ HP</div>
                  <div className="text-xl font-bold" style={{ color: '#6b8e4e' }}>{totalStats.maxHp}</div>
                </div>
                <div className="rounded-lg p-3" style={{ backgroundColor: '#1a1208' }}>
                  <div style={{ color: '#8b7355' }}>⚡ SPD</div>
                  <div className="text-xl font-bold" style={{ color: '#d4a843' }}>{totalStats.spd}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h3 className="text-lg font-bold" style={{ color: '#d4a843', fontFamily: "'Cinzel', serif" }}>🎒 Инвентарь ({inventory.length}/100)</h3>
              <button onClick={autoEquip} className="btn-medieval-primary px-4 py-2 rounded-lg">
                ⚡ Авто-экипировка
              </button>
            </div>
            {inventory.length === 0 ? (
              <div className="text-center py-20" style={{ color: '#8b7355' }}>
                <div className="text-6xl mb-4">🎒</div>
                <p>Инвентарь пуст</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto custom-scrollbar">
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
                        <div className="text-sm font-medium truncate" style={{ color: '#e8dcc4' }}>{item.name}</div>
                        <div className="text-xs" style={{ color: '#8b7355' }}>{item.slot} • Ур.{item.level}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold" style={{ color: '#d4a843', fontFamily: "'Cinzel', serif" }}>📖 Навыки</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SKILLS.map(skill => {
                const level = skills[skill.id] || 0;
                const cost = getSkillCost(skill, level);
                const canLearn = character.gold >= cost && character.skillPoints > 0 && level < skill.maxLevel;
                
                return (
                  <div key={skill.id} className="p-4 rounded-xl border-2" style={{ backgroundColor: '#2a1f0e', borderColor: canLearn ? '#b8860b' : '#5c3d1e' }}>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{skill.icon}</span>
                      <div className="flex-1">
                        <div className="font-bold" style={{ color: '#e8dcc4' }}>{skill.name}</div>
                        <div className="text-xs" style={{ color: '#8b7355' }}>Ур. {level}/{skill.maxLevel}</div>
                        <div className="text-sm" style={{ color: '#8b7355' }}>{skill.description}</div>
                      </div>
                      <button
                        onClick={() => learnSkill(skill.id)}
                        disabled={!canLearn}
                        className={canLearn ? 'btn-medieval-primary px-4 py-2 rounded-lg' : 'btn-medieval px-4 py-2 rounded-lg opacity-50 cursor-not-allowed'}
                      >
                        💰{formatNumber(cost)}
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
            <h3 className="text-lg font-bold" style={{ color: '#d4a843', fontFamily: "'Cinzel', serif" }}>💎 Пассивные улучшения</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PASSIVE_UPGRADES.map(passive => {
                const level = passives[passive.id] || 0;
                const cost = Math.floor(passive.baseCost * Math.pow(passive.costMultiplier, level));
                const canAfford = character.gold >= cost;
                
                return (
                  <div key={passive.id} className="p-4 rounded-xl border-2" style={{ backgroundColor: '#2a1f0e', borderColor: canAfford ? '#b8860b' : '#5c3d1e' }}>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{passive.icon}</span>
                      <div className="flex-1">
                        <div className="font-bold" style={{ color: '#e8dcc4' }}>{passive.name}</div>
                        <div className="text-xs" style={{ color: '#8b7355' }}>Ур. {level}/{passive.maxLevel}</div>
                        <div className="text-sm" style={{ color: '#8b7355' }}>{passive.description}</div>
                      </div>
                      <button
                        onClick={() => buyPassive(passive.id)}
                        disabled={!canAfford}
                        className={canAfford ? 'btn-medieval-primary px-4 py-2 rounded-lg' : 'btn-medieval px-4 py-2 rounded-lg opacity-50 cursor-not-allowed'}
                      >
                        💰{formatNumber(cost)}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'trade' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold" style={{ color: '#d4a843', fontFamily: "'Cinzel', serif" }}>🏪 Торговцы</h3>
            
            {/* Rewarded награды */}
            <div className="rounded-xl border-2 p-4" style={{ backgroundColor: '#2a1f0e', borderColor: '#b8860b' }}>
              <h4 className="text-md font-bold mb-3" style={{ color: '#f0c75e', fontFamily: "'Cinzel', serif" }}>📺 Награды за просмотр рекламы</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    requestRewardedAd('double_gold', () => {
                      const bonus = Math.floor(character.gold * 0.5);
                      setCharacter(prev => ({ ...prev, gold: prev.gold + bonus }));
                      setBattleLog(prev => [...prev.slice(-9), `💰 +${bonus} золота (x1.5)!`]);
                    });
                  }}
                  className="btn-medieval-primary p-3 rounded-lg text-left"
                >
                  <div className="font-bold">💰 Удвоить золото</div>
                  <div className="text-xs mt-1" style={{ color: '#e8dcc4' }}>Получите +50% к текущему золоту</div>
                </button>
                
                <button
                  onClick={() => {
                    requestRewardedAd('luck_boost', () => {
                      setLuckBoost(50);
                      setLuckBoostExpiry(Date.now() + 1800000); // 30 минут
                      setBattleLog(prev => [...prev.slice(-9), `🍀 +50% удачи на 30 минут!`]);
                    });
                  }}
                  className="btn-medieval-primary p-3 rounded-lg text-left"
                >
                  <div className="font-bold">🍀 Удача +50%</div>
                  <div className="text-xs mt-1" style={{ color: '#e8dcc4' }}>Бонус к удаче на 30 минут</div>
                </button>
                
                <button
                  onClick={() => {
                    requestRewardedAd('free_enchant', () => {
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
                        setBattleLog(prev => [...prev.slice(-9), `✨ Бесплатное улучшение: ${item.name}!`]);
                      }
                    });
                  }}
                  className="btn-medieval-primary p-3 rounded-lg text-left"
                >
                  <div className="font-bold">✨ Улучшить предмет</div>
                  <div className="text-xs mt-1" style={{ color: '#e8dcc4' }}>Бесплатное улучшение случайного предмета</div>
                </button>
                
                <button
                  onClick={() => {
                    requestRewardedAd('xp_boost', () => {
                      const bonus = character.xpToNext * 0.3;
                      setCharacter(prev => ({ ...prev, xp: prev.xp + bonus }));
                      setBattleLog(prev => [...prev.slice(-9), `📚 +30% опыта до следующего уровня!`]);
                    });
                  }}
                  className="btn-medieval-primary p-3 rounded-lg text-left"
                >
                  <div className="font-bold">📚 +30% опыта</div>
                  <div className="text-xs mt-1" style={{ color: '#e8dcc4' }}>Получите 30% опыта до следующего уровня</div>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TRADERS.map(trader => {
                const cooldown = traderCooldowns[trader.id] || 0;
                const canAfford = character.gold >= trader.cost;
                const isAvailable = cooldown === 0 && canAfford;
                
                return (
                  <div key={trader.id} className="p-4 rounded-xl border-2" style={{ backgroundColor: '#2a1f0e', borderColor: isAvailable ? '#b8860b' : '#5c3d1e' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl">{trader.icon}</span>
                      <div>
                        <div className="font-bold" style={{ color: '#e8dcc4' }}>{trader.name}</div>
                        <div className="text-xs" style={{ color: '#8b7355' }}>{trader.service}</div>
                      </div>
                    </div>
                    <div className="text-sm mb-3" style={{ color: '#8b7355' }}>{trader.description}</div>
                    <button
                      onClick={() => useTrader(trader.id)}
                      disabled={!isAvailable}
                      className={isAvailable ? 'btn-medieval-primary w-full px-4 py-2 rounded-lg' : 'btn-medieval w-full px-4 py-2 rounded-lg opacity-50 cursor-not-allowed'}
                    >
                      {cooldown > 0 ? `⏱️ ${cooldown}с` : `💰 ${formatNumber(trader.cost)}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold" style={{ color: '#d4a843', fontFamily: "'Cinzel', serif" }}>🏆 Таблица лидеров</h3>
              <button
                onClick={() => loadLeaderboard('main')}
                className="btn-medieval-primary px-4 py-2 rounded-lg"
              >
                🔄 Обновить
              </button>
            </div>
            
            <div className="rounded-xl border-2 p-6" style={{ backgroundColor: '#2a1f0e', borderColor: '#5c3d1e' }}>
              <h4 className="text-md font-bold mb-4" style={{ color: '#b8860b', fontFamily: "'Cinzel', serif" }}>👑 Лучший уровень</h4>
              {leaderboardData.length > 0 ? (
                <div className="space-y-2">
                  {leaderboardData.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#1a1208' }}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold" style={{ color: i === 0 ? '#f0c75e' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#8b7355' }}>
                          #{i + 1}
                        </span>
                        <span style={{ color: '#e8dcc4' }}>{entry.player?.publicProfile?.name || 'Аноним'}</span>
                      </div>
                      <span className="font-bold" style={{ color: '#d4a843' }}>Ур. {entry.score}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8" style={{ color: '#8b7355' }}>
                  <div className="text-4xl mb-2">🏆</div>
                  <p>Загрузите таблицу лидеров</p>
                  <p className="text-xs mt-2">Ваш рекорд: Уровень {character.level}</p>
                </div>
              )}
            </div>

            <div className="rounded-xl border-2 p-6" style={{ backgroundColor: '#2a1f0e', borderColor: '#5c3d1e' }}>
              <h4 className="text-md font-bold mb-4" style={{ color: '#b8860b', fontFamily: "'Cinzel', serif" }}>🗺️ Максимальная зона</h4>
              <div className="text-center py-4" style={{ color: '#8b7355' }}>
                <p>Ваш рекорд: Зона {zone}</p>
                <button
                  onClick={() => loadLeaderboard('zone')}
                  className="btn-medieval mt-3 px-4 py-2 rounded-lg"
                >
                  Загрузить рейтинг зон
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно ежедневной награды */}
        {showDailyReward && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
            <div className="rounded-xl border-2 p-6 max-w-md w-full" style={{ backgroundColor: '#2a1f0e', borderColor: '#b8860b', boxShadow: '0 0 40px rgba(184,134,11,0.4)' }}>
              <div className="text-center mb-4">
                <div className="text-5xl mb-2">🎁</div>
                <h3 className="text-xl font-bold" style={{ color: '#f0c75e', fontFamily: "'Cinzel', serif" }}>Ежедневная награда!</h3>
                <p className="text-sm mt-2" style={{ color: '#8b7355' }}>Заберите свою награду за вход</p>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    claimDailyReward(false);
                    setShowDailyReward(false);
                  }}
                  className="btn-medieval-primary w-full py-3 rounded-lg"
                >
                  🎁 Забрать награду
                </button>
                
                <button
                  onClick={() => {
                    setShowDailyReward(false);
                    requestRewardedAd('double_daily', () => {
                      const goldReward = 100 * character.level * 2;
                      const xpReward = 50 * character.level * 2;
                      setCharacter(prev => ({
                        ...prev,
                        gold: prev.gold + goldReward,
                        xp: prev.xp + xpReward
                      }));
                      setBattleLog(prev => [...prev.slice(-9), `🎁 Двойная награда: +${goldReward} 💰, +${xpReward} XP!`]);
                    });
                  }}
                  className="btn-medieval w-full py-3 rounded-lg"
                >
                  📺 Смотреть рекламу и удвоить награду
                </button>
                
                <button
                  onClick={() => setShowDailyReward(false)}
                  className="w-full py-2 text-sm"
                  style={{ color: '#8b7355' }}
                >
                  Позже
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно получения награды */}
        {showRewardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="rounded-xl border-2 p-6 animate-bounce" style={{ backgroundColor: '#2a1f0e', borderColor: '#b8860b', boxShadow: '0 0 40px rgba(184,134,11,0.6)' }}>
              <div className="text-center">
                <div className="text-5xl mb-2">🎉</div>
                <h3 className="text-xl font-bold" style={{ color: '#f0c75e', fontFamily: "'Cinzel', serif" }}>Награда получена!</h3>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
