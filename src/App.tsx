import { useState, useEffect, useRef, useCallback } from 'react';
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
  timestamp: number;
}

function App() {
  const [credits, setCredits] = useState(15);
  const [totalLoot, setTotalLoot] = useState(0);
  const [totalCredits, setTotalCredits] = useState(15);
  const [clickPower, setClickPower] = useState(1);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [upgrades, setUpgrades] = useState<Record<string, number>>({});
  const [lastDrop, setLastDrop] = useState<Item | null>(null);
  const [rarityCounts, setRarityCounts] = useState<Record<number, number>>({});
  const [activeTab, setActiveTab] = useState<'loot' | 'inventory' | 'upgrades' | 'stats'>('loot');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [dropAnimation, setDropAnimation] = useState(false);
  const [showFlash, setShowFlash] = useState<number | null>(null);
  const [, setTick] = useState(0);

  // Use refs for values needed in game loop to avoid stale closures
  const luckBonusRef = useRef(0);
  const valueBonusRef = useRef(0);
  const autoScrapLevelRef = useRef(0);
  const inventoryCapacityRef = useRef(50);
  const lootPerSecondRef = useRef(0);
  const inventoryRef = useRef<Item[]>([]);
  const clickPowerRef = useRef(1);

  // Calculate derived stats from upgrades
  useEffect(() => {
    let speed = 0;
    let luck = 0;
    let value = 0;
    let autoScrap = 0;
    let capacity = 50;
    let clickPower = 1;

    UPGRADES.forEach(upgrade => {
      const level = upgrades[upgrade.id] || 0;
      switch (upgrade.effect) {
        case 'speed': speed += upgrade.effectValue * level; break;
        case 'luck': luck += upgrade.effectValue * level; break;
        case 'value': value += upgrade.effectValue * level; break;
        case 'autoScrap': autoScrap = Math.max(autoScrap, level > 0 ? upgrade.effectValue : 0); break;
        case 'capacity': capacity += upgrade.effectValue * level; break;
        case 'clickPower': clickPower += upgrade.effectValue * level; break;
      }
    });

    lootPerSecondRef.current = speed;
    luckBonusRef.current = luck;
    valueBonusRef.current = value;
    autoScrapLevelRef.current = autoScrap;
    inventoryCapacityRef.current = capacity;
    clickPowerRef.current = clickPower;
    setClickPower(clickPower);
    setTick(t => t + 1); // force re-render to show updated values
  }, [upgrades]);

  // Keep inventoryRef in sync
  useEffect(() => {
    inventoryRef.current = inventory;
  }, [inventory]);

  const generateLoot = useCallback((): Item => {
    const rarityIndex = rollRarity(luckBonusRef.current);
    const slot = ITEM_SLOTS[Math.floor(Math.random() * ITEM_SLOTS.length)];
    const name = generateItemName(slot);
    const stats = generateStats(rarityIndex);
    const value = Math.floor(getItemValue(rarityIndex) * (1 + valueBonusRef.current / 100));

    return {
      id: Math.random().toString(36).substr(2, 9) + Date.now().toString(36),
      name,
      slot: slot.name,
      icon: slot.icon,
      rarityIndex,
      stats,
      value,
      timestamp: Date.now(),
    };
  }, []);

  // Main game loop — stable, reads from refs
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

      let newItem: Item | null = null;

      while (lootAccumulator.current >= 1) {
        lootAccumulator.current -= 1;
        const item = generateLoot();
        newItem = item;

        setTotalLoot(prev => prev + 1);
        setRarityCounts(prev => ({ ...prev, [item.rarityIndex]: (prev[item.rarityIndex] || 0) + 1 }));

        const autoLevel = autoScrapLevelRef.current;
        const shouldAutoScrap = (autoLevel >= 1 && item.rarityIndex === 0) ||
                                (autoLevel >= 2 && item.rarityIndex <= 1);

        if (shouldAutoScrap) {
          setCredits(prev => prev + item.value);
          setTotalCredits(prev => prev + item.value);
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
            setTotalCredits(prev => prev + item.value);
          }
        }
      }

      if (newItem) {
        setLastDrop(newItem);
        setDropAnimation(true);
        setTimeout(() => setDropAnimation(false), 300);

        if (newItem.rarityIndex >= 4) {
          setShowFlash(newItem.rarityIndex);
          setTimeout(() => setShowFlash(null), 500);
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [generateLoot]);

  const scrapItem = (item: Item) => {
    setInventory(prev => {
      const next = prev.filter(i => i.id !== item.id);
      inventoryRef.current = next;
      return next;
    });
    setCredits(prev => prev + item.value);
    setTotalCredits(prev => prev + item.value);
    if (selectedItem?.id === item.id) setSelectedItem(null);
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
    setTotalCredits(prev => prev + totalValue);
    if (selectedItem && selectedItem.rarityIndex <= maxRarity) setSelectedItem(null);
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
    const power = clickPowerRef.current;
    setCredits(prev => prev + power);
    setTotalCredits(prev => prev + power);
  };

  // Derived values for display
  const lootPerSecond = lootPerSecondRef.current;
  const luckBonus = luckBonusRef.current;
  const valueBonus = valueBonusRef.current;
  const inventoryCapacity = inventoryCapacityRef.current;

  const renderLootFeed = () => {
    if (!lastDrop) return (
      <div className="text-center text-gray-500 py-20">
        <div className="text-6xl mb-4">⏳</div>
        <p className="text-lg mb-2">Нажми ⚡ HACK чтобы заработать кредиты</p>
        <p className="text-sm text-gray-600">Затем купи улучшение CPU для автоматической добычи</p>
      </div>
    );

    const rarity = RARITIES[lastDrop.rarityIndex];

    return (
      <div className="space-y-4">
        <div
          className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${dropAnimation ? 'scale-105' : 'scale-100'}`}
          style={{
            borderColor: rarity.borderColor,
            backgroundColor: rarity.bgColor,
            boxShadow: `0 0 30px ${rarity.glowColor}, inset 0 0 30px ${rarity.glowColor}`,
          }}
        >
          <div className="flex items-center gap-4">
            <span className="text-5xl">{lastDrop.icon}</span>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wider opacity-70" style={{ color: rarity.color }}>
                {rarity.name}
              </div>
              <div className="text-lg font-bold" style={{ color: rarity.color }}>
                {lastDrop.name}
              </div>
              <div className="text-sm text-gray-400">{lastDrop.slot}</div>
            </div>
            <div className="text-right">
              <div className="text-yellow-400 font-bold text-lg">💰 {formatNumber(lastDrop.value)}</div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {lastDrop.stats.map((stat, i) => (
              <span key={i} className="px-2 py-1 rounded text-xs bg-black/30 border border-gray-700" style={{ color: rarity.color }}>
                +{formatNumber(stat.value)} {stat.name}
              </span>
            ))}
          </div>
        </div>

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
            className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-600 text-sm transition-colors text-gray-300"
          >
            🗑️ Разобрать Common ({inventory.filter(i => i.rarityIndex === 0).length})
          </button>
          <button
            onClick={() => scrapAllBelow(1)}
            className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-600 text-sm transition-colors text-gray-300"
          >
            🗑️ Разобрать ≤Uncommon ({inventory.filter(i => i.rarityIndex <= 1).length})
          </button>
          <button
            onClick={() => scrapAllBelow(2)}
            className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-600 text-sm transition-colors text-gray-300"
          >
            🗑️ Разобрать ≤Rare ({inventory.filter(i => i.rarityIndex <= 2).length})
          </button>
        </div>
      </div>
    );
  };

  const renderInventory = () => {
    const sortedInventory = [...inventory].sort((a, b) => b.rarityIndex - a.rarityIndex || b.value - a.value);

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-200">
            Инвентарь ({inventory.length}/{inventoryCapacity})
          </h3>
          <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all"
              style={{ width: `${Math.min((inventory.length / inventoryCapacity) * 100, 100)}%` }}
            />
          </div>
        </div>

        {sortedInventory.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            <div className="text-4xl mb-2">📦</div>
            <p>Инвентарь пуст</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {sortedInventory.map(item => {
              const r = RARITIES[item.rarityIndex];
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.01] ${selectedItem?.id === item.id ? 'ring-2 ring-white/50' : ''}`}
                  style={{
                    borderColor: r.borderColor,
                    backgroundColor: r.bgColor,
                  }}
                  onClick={() => setSelectedItem(item)}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs" style={{ color: r.color }}>
                      {r.name}
                    </div>
                    <div className="text-sm font-medium text-gray-200 truncate">{item.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 text-sm">💰{formatNumber(item.value)}</div>
                    <button
                      onClick={(e) => { e.stopPropagation(); scrapItem(item); }}
                      className="text-xs text-red-400 hover:text-red-300 mt-1"
                    >
                      [Разобрать]
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedItem && (
          <div
            className="p-4 rounded-xl border-2 mt-4"
            style={{
              borderColor: RARITIES[selectedItem.rarityIndex].borderColor,
              backgroundColor: RARITIES[selectedItem.rarityIndex].bgColor,
              boxShadow: `0 0 20px ${RARITIES[selectedItem.rarityIndex].glowColor}`,
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">{selectedItem.icon}</span>
              <div>
                <div className="text-xs uppercase tracking-wider" style={{ color: RARITIES[selectedItem.rarityIndex].color }}>
                  {RARITIES[selectedItem.rarityIndex].name}
                </div>
                <div className="font-bold text-gray-100">{selectedItem.name}</div>
                <div className="text-sm text-gray-400">{selectedItem.slot}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {selectedItem.stats.map((stat, i) => (
                <div key={i} className="bg-black/30 rounded px-2 py-1 text-sm">
                  <span className="text-gray-400">{stat.name}:</span>{' '}
                  <span style={{ color: RARITIES[selectedItem.rarityIndex].color }}>+{formatNumber(stat.value)}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => scrapItem(selectedItem)}
              className="w-full py-2 rounded-lg bg-red-900/50 hover:bg-red-800/50 border border-red-700 text-red-300 text-sm transition-colors"
            >
              🗑️ Разобрать за 💰{formatNumber(selectedItem.value)}
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderUpgrades = () => (
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
              className={`p-4 rounded-xl border transition-all ${canAfford ? 'border-cyan-700 hover:border-cyan-500' : 'border-gray-800 opacity-60'}`}
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
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    canAfford
                      ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white shadow-lg'
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
  );

  const renderStats = () => {
    const totalItems = Object.values(rarityCounts).reduce((sum, v) => sum + v, 0);

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-200">Статистика</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
            <div className="text-sm text-gray-500">Всего кредитов заработано</div>
            <div className="text-2xl font-bold text-yellow-400">💰 {formatNumber(totalCredits)}</div>
          </div>
          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
            <div className="text-sm text-gray-500">Всего предметов добыто</div>
            <div className="text-2xl font-bold text-purple-400">📦 {formatNumber(totalLoot)}</div>
          </div>
          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
            <div className="text-sm text-gray-500">Скорость добычи</div>
            <div className="text-2xl font-bold text-cyan-400">⚡ {formatNumber(lootPerSecond)}/с</div>
          </div>
          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
            <div className="text-sm text-gray-500">Бонус удачи</div>
            <div className="text-2xl font-bold text-green-400">🍀 +{luckBonus}%</div>
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
          <h4 className="font-bold text-gray-300 mb-3">Обнаруженные редкости</h4>
          <div className="space-y-2">
            {RARITIES.map((rarity, index) => {
              const count = rarityCounts[index] || 0;
              const percentage = totalItems > 0 ? (count / totalItems * 100) : 0;
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-28 text-xs font-medium" style={{ color: rarity.color }}>
                    {rarity.name}
                  </div>
                  <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: rarity.color,
                        boxShadow: `0 0 10px ${rarity.glowColor}`,
                      }}
                    />
                  </div>
                  <div className="w-24 text-right text-xs text-gray-400">
                    {formatNumber(count)} ({percentage.toFixed(1)}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
          <h4 className="font-bold text-gray-300 mb-3">Возможные комбинации</h4>
          <div className="text-center py-4">
            <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {(ITEM_SLOTS.length * 10 * 8 * RARITIES.length * Math.pow(18, 4)).toLocaleString()}+
            </div>
            <div className="text-sm text-gray-500 mt-1">уникальных вариантов предметов</div>
            <div className="text-xs text-gray-600 mt-2">
              {ITEM_SLOTS.length} слотов × 10 префиксов × 8 суффиксов × {RARITIES.length} редкостей × характеристики
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden" style={{ backgroundColor: '#030712', fontFamily: "'Courier New', monospace" }}>
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(6,182,212,0.05)' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(168,85,247,0.05)' }} />
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full blur-3xl" style={{ backgroundColor: 'rgba(236,72,153,0.03)', transform: 'translate(-50%,-50%)' }} />
      </div>

      {/* Flash effect for rare drops */}
      {showFlash !== null && (
        <div
          className="fixed inset-0 pointer-events-none z-50"
          style={{ backgroundColor: RARITIES[showFlash].glowColor, opacity: 0.3, animation: 'pulse 0.5s ease-out' }}
        />
      )}

      {/* Header */}
      <header className="relative z-10 border-b border-gray-800" style={{ backgroundColor: 'rgba(3,7,18,0.8)', backdropFilter: 'blur(8px)' }}>
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                NEON LOOT
              </h1>
              <span className="text-xs text-gray-500 hidden sm:inline">v2.0.77 // IDLE PROTOCOL</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={manualLoot}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-sm transition-all active:scale-95 shadow-lg shadow-cyan-500/20"
              >
                ⚡ HACK (+{clickPower})
              </button>
              <div className="text-right">
                <div className="text-xs text-gray-500">КРЕДИТЫ</div>
                <div className="text-lg font-bold text-yellow-400">💰 {formatNumber(credits)}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-gray-800" style={{ backgroundColor: 'rgba(17,24,39,0.5)', backdropFilter: 'blur(8px)' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            {([
              { id: 'loot' as const, label: '⚡ Добыча' },
              { id: 'inventory' as const, label: '📦 Инвентарь' },
              { id: 'upgrades' as const, label: '🔧 Улучшения' },
              { id: 'stats' as const, label: '📊 Статистика' },
            ]).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-4 py-3 text-sm font-medium transition-all border-b-2"
                style={{
                  borderBottomColor: activeTab === tab.id ? '#22d3ee' : 'transparent',
                  color: activeTab === tab.id ? '#22d3ee' : '#6b7280',
                }}
              >
                {tab.label}
                {tab.id === 'inventory' && inventory.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 rounded-full bg-gray-800 text-xs text-gray-400">
                    {inventory.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-6 pb-16">
        {activeTab === 'loot' && renderLootFeed()}
        {activeTab === 'inventory' && renderInventory()}
        {activeTab === 'upgrades' && renderUpgrades()}
        {activeTab === 'stats' && renderStats()}
      </main>

      {/* Bottom bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-10 border-t border-gray-800" style={{ backgroundColor: 'rgba(3,7,18,0.9)', backdropFilter: 'blur(8px)' }}>
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between text-xs text-gray-500">
          <span>⚡ {formatNumber(lootPerSecond)}/сек</span>
          <span>🍀 +{luckBonus}% удачи</span>
          <span>💰 +{valueBonus}% стоимости</span>
          <span>📦 {inventory.length}/{inventoryCapacity}</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
