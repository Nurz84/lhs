import { useState, useEffect, useRef } from 'react';
import {
  RARITIES, ITEM_SLOTS, UPGRADES,
  rollRarity, generateItemName, generateStats, getItemValue,
  getUpgradeCost, formatNumber,
} from './gameData';

interface Item {
  id: string;
  name: string;
  slot: string;
  icon: string;
  rarityIndex: number;
  stats: { name: string; value: number }[];
  value: number;
}

function App() {
  const [credits, setCredits] = useState(15);
  const [totalLoot, setTotalLoot] = useState(0);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [upgrades, setUpgrades] = useState<Record<string, number>>({});
  const [lastDrop, setLastDrop] = useState<Item | null>(null);
  const [activeTab, setActiveTab] = useState<'loot' | 'inventory' | 'upgrades'>('loot');

  const lootPerSecondRef = useRef(0);
  const luckBonusRef = useRef(0);
  const valueBonusRef = useRef(0);
  const autoScrapLevelRef = useRef(0);
  const inventoryCapacityRef = useRef(50);
  const inventoryRef = useRef<Item[]>([]);

  useEffect(() => {
    let speed = 0;
    let luck = 0;
    let value = 0;
    let autoScrap = 0;
    let capacity = 50;

    UPGRADES.forEach(upgrade => {
      const level = upgrades[upgrade.id] || 0;
      switch (upgrade.effect) {
        case 'speed': speed += upgrade.effectValue * level; break;
        case 'luck': luck += upgrade.effectValue * level; break;
        case 'value': value += upgrade.effectValue * level; break;
        case 'autoScrap': autoScrap = Math.max(autoScrap, level > 0 ? upgrade.effectValue : 0); break;
        case 'capacity': capacity += upgrade.effectValue * level; break;
      }
    });

    lootPerSecondRef.current = speed;
    luckBonusRef.current = luck;
    valueBonusRef.current = value;
    autoScrapLevelRef.current = autoScrap;
    inventoryCapacityRef.current = capacity;
  }, [upgrades]);

  useEffect(() => {
    inventoryRef.current = inventory;
  }, [inventory]);

  useEffect(() => {
    const lootAccumulator = { current: 0 };
    let lastTime = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      const speed = lootPerSecondRef.current;
      if (speed <= 0) return;

      lootAccumulator.current += speed * delta;

      while (lootAccumulator.current >= 1) {
        lootAccumulator.current -= 1;
        
        const rarityIndex = rollRarity(luckBonusRef.current);
        const slot = ITEM_SLOTS[Math.floor(Math.random() * ITEM_SLOTS.length)];
        const name = generateItemName(slot);
        const stats = generateStats(rarityIndex);
        const value = Math.floor(getItemValue(rarityIndex) * (1 + valueBonusRef.current / 100));

        const item: Item = {
          id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
          name,
          slot: slot.name,
          icon: slot.icon,
          rarityIndex,
          stats,
          value,
        };

        setTotalLoot(prev => prev + 1);
        setLastDrop(item);

        const autoLevel = autoScrapLevelRef.current;
        const shouldAutoScrap = (autoLevel >= 1 && item.rarityIndex === 0) ||
                                (autoLevel >= 2 && item.rarityIndex <= 1);

        if (shouldAutoScrap) {
          setCredits(prev => prev + item.value);
        } else {
          const currentInv = inventoryRef.current;
          const cap = inventoryCapacityRef.current;
          if (currentInv.length < cap) {
            setInventory(prev => {
              const next = [...prev, item];
              inventoryRef.current = next;
              return next;
            });
          } else {
            setCredits(prev => prev + item.value);
          }
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const scrapItem = (item: Item) => {
    setInventory(prev => {
      const next = prev.filter(i => i.id !== item.id);
      inventoryRef.current = next;
      return next;
    });
    setCredits(prev => prev + item.value);
  };

  const scrapAllBelow = (maxRarity: number) => {
    let totalValue = 0;
    setInventory(prev => {
      const toScrap = prev.filter(i => i.rarityIndex <= maxRarity);
      totalValue = toScrap.reduce((sum, i) => sum + i.value, 0);
      const next = prev.filter(i => i.rarityIndex > maxRarity);
      inventoryRef.current = next;
      return next;
    });
    setCredits(prev => prev + totalValue);
  };

  const buyUpgrade = (upgradeId: string) => {
    const upgrade = UPGRADES.find(u => u.id === upgradeId)!;
    const level = upgrades[upgradeId] || 0;
    const cost = getUpgradeCost(upgrade, level);

    if (credits >= cost) {
      setCredits(prev => prev - cost);
      setUpgrades(prev => ({ ...prev, [upgradeId]: level + 1 }));
    }
  };

  const manualLoot = () => {
    setCredits(prev => prev + 1);
  };

  const lootPerSecond = lootPerSecondRef.current;
  const inventoryCapacity = inventoryCapacityRef.current;

  return (
    <div className="min-h-screen bg-gray-950 text-white font-mono">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            NEON LOOT
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={manualLoot}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-sm"
            >
              ⚡ HACK (+1)
            </button>
            <div className="text-right">
              <div className="text-xs text-gray-500">КРЕДИТЫ</div>
              <div className="text-lg font-bold text-yellow-400">💰 {formatNumber(credits)}</div>
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b border-gray-800 bg-gray-900/30">
        <div className="max-w-6xl mx-auto px-4 flex gap-1">
          {[
            { id: 'loot' as const, label: '⚡ Добыча' },
            { id: 'inventory' as const, label: '📦 Инвентарь' },
            { id: 'upgrades' as const, label: '🔧 Улучшения' },
          ].map(tab => (
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

      <main className="max-w-6xl mx-auto px-4 py-6 pb-16">
        {activeTab === 'loot' && (
          <div className="space-y-4">
            {lastDrop ? (
              <div
                className="p-6 rounded-xl border-2"
                style={{
                  borderColor: RARITIES[lastDrop.rarityIndex].borderColor,
                  backgroundColor: RARITIES[lastDrop.rarityIndex].bgColor,
                  boxShadow: `0 0 30px ${RARITIES[lastDrop.rarityIndex].glowColor}`,
                }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{lastDrop.icon}</span>
                  <div className="flex-1">
                    <div className="text-xs uppercase" style={{ color: RARITIES[lastDrop.rarityIndex].color }}>
                      {RARITIES[lastDrop.rarityIndex].name}
                    </div>
                    <div className="text-lg font-bold" style={{ color: RARITIES[lastDrop.rarityIndex].color }}>
                      {lastDrop.name}
                    </div>
                    <div className="text-sm text-gray-400">{lastDrop.slot}</div>
                  </div>
                  <div className="text-yellow-400 font-bold">💰 {formatNumber(lastDrop.value)}</div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-20">
                <div className="text-6xl mb-4">⏳</div>
                <p className="text-lg mb-2">Нажми ⚡ HACK чтобы заработать кредиты</p>
                <p className="text-sm text-gray-600">Затем купи улучшение CPU для автоматической добычи</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800 text-center">
                <div className="text-xs text-gray-500">Добыча/сек</div>
                <div className="text-lg font-bold text-cyan-400">{formatNumber(lootPerSecond)}</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800 text-center">
                <div className="text-xs text-gray-500">Всего добыто</div>
                <div className="text-lg font-bold text-purple-400">{formatNumber(totalLoot)}</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800 text-center">
                <div className="text-xs text-gray-500">Инвентарь</div>
                <div className="text-lg font-bold text-green-400">{inventory.length}/{inventoryCapacity}</div>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => scrapAllBelow(0)}
                className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-600 text-sm text-gray-300"
              >
                🗑️ Разобрать Common ({inventory.filter(i => i.rarityIndex === 0).length})
              </button>
              <button
                onClick={() => scrapAllBelow(1)}
                className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-600 text-sm text-gray-300"
              >
                🗑️ Разобрать ≤Uncommon ({inventory.filter(i => i.rarityIndex <= 1).length})
              </button>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-200">
              Инвентарь ({inventory.length}/{inventoryCapacity})
            </h3>
            {inventory.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                <div className="text-4xl mb-2">📦</div>
                <p>Инвентарь пуст</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-[500px] overflow-y-auto">
                {inventory.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg border"
                    style={{
                      borderColor: RARITIES[item.rarityIndex].borderColor,
                      backgroundColor: RARITIES[item.rarityIndex].bgColor,
                    }}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1">
                      <div className="text-xs" style={{ color: RARITIES[item.rarityIndex].color }}>
                        {RARITIES[item.rarityIndex].name}
                      </div>
                      <div className="text-sm font-medium text-gray-200">{item.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-400 text-sm">💰{formatNumber(item.value)}</div>
                      <button
                        onClick={() => scrapItem(item)}
                        className="text-xs text-red-400 hover:text-red-300 mt-1"
                      >
                        [Разобрать]
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'upgrades' && (
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-200">Кибернетические улучшения</h3>
            <div className="grid grid-cols-1 gap-3">
              {UPGRADES.map(upgrade => {
                const level = upgrades[upgrade.id] || 0;
                const cost = getUpgradeCost(upgrade, level);
                const canAfford = credits >= cost;

                return (
                  <div
                    key={upgrade.id}
                    className={`p-4 rounded-xl border ${canAfford ? 'border-cyan-700' : 'border-gray-800 opacity-60'}`}
                    style={{ backgroundColor: canAfford ? 'rgba(6,182,212,0.05)' : 'rgba(0,0,0,0.3)' }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{upgrade.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-200">{upgrade.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-cyan-400">Ур.{level}</span>
                        </div>
                        <div className="text-sm text-gray-400">{upgrade.description}</div>
                      </div>
                      <button
                        onClick={() => buyUpgrade(upgrade.id)}
                        disabled={!canAfford}
                        className={`px-4 py-2 rounded-lg font-bold text-sm ${
                          canAfford
                            ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        💰 {formatNumber(cost)}
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
