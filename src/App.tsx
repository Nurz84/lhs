import { useState, useEffect, useRef, useCallback } from 'react';
import {
  RARITIES, ITEM_SLOTS, UPGRADES,
  rollRarity, generateItemName, generateStats, getItemValue,
  getUpgradeCost, formatNumber,
  type Rarity
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

interface GameState {
  credits: number;
  totalLoot: number;
  totalCredits: number;
  inventory: Item[];
  upgrades: Record<string, number>;
  inventoryCapacity: number;
  lootPerSecond: number;
  luckBonus: number;
  valueBonus: number;
  autoScrapLevel: number;
  lastDrop: Item | null;
  discoveredRarities: Set<number>;
  rarityCounts: Record<number, number>;
}

function App() {
  const [credits, setCredits] = useState(0);
  const [totalLoot, setTotalLoot] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [upgrades, setUpgrades] = useState<Record<string, number>>({});
  const [inventoryCapacity, setInventoryCapacity] = useState(50);
  const [lootPerSecond, setLootPerSecond] = useState(0);
  const [luckBonus, setLuckBonus] = useState(0);
  const [valueBonus, setValueBonus] = useState(0);
  const [autoScrapLevel, setAutoScrapLevel] = useState(0);
  const [lastDrop, setLastDrop] = useState<Item | null>(null);
  const [rarityCounts, setRarityCounts] = useState<Record<number, number>>({});
  const [activeTab, setActiveTab] = useState<'loot' | 'inventory' | 'upgrades' | 'stats'>('loot');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [dropAnimation, setDropAnimation] = useState(false);
  const [showFlash, setShowFlash] = useState<Rarity | null>(null);

  const lootAccumulator = useRef(0);
  const lastTime = useRef(Date.now());

  // Calculate derived stats
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
        case 'autoScrap': autoScrap = Math.max(autoScrap, upgrade.effectValue * level > 0 ? upgrade.effectValue : 0); break;
        case 'capacity': capacity += upgrade.effectValue * level; break;
      }
    });

    setLootPerSecond(speed);
    setLuckBonus(luck);
    setValueBonus(value);
    setAutoScrapLevel(autoScrap);
    setInventoryCapacity(capacity);
  }, [upgrades]);

  const generateLoot = useCallback((): Item => {
    const rarityIndex = rollRarity(luckBonus);
    const slot = ITEM_SLOTS[Math.floor(Math.random() * ITEM_SLOTS.length)];
    const name = generateItemName(slot);
    const stats = generateStats(rarityIndex);
    const value = Math.floor(getItemValue(rarityIndex) * (1 + valueBonus / 100));

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
  }, [luckBonus, valueBonus]);

  // Main game loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastTime.current) / 1000;
      lastTime.current = now;

      if (lootPerSecond > 0) {
        lootAccumulator.current += lootPerSecond * delta;

        while (lootAccumulator.current >= 1) {
          lootAccumulator.current -= 1;
          const item = generateLoot();

          setTotalLoot(prev => prev + 1);
          setRarityCounts(prev => ({ ...prev, [item.rarityIndex]: (prev[item.rarityIndex] || 0) + 1 }));

          // Auto-scrap logic
          const shouldAutoScrap = (autoScrapLevel >= 1 && item.rarityIndex === 0) ||
                                  (autoScrapLevel >= 2 && item.rarityIndex <= 1);

          if (shouldAutoScrap) {
            setCredits(prev => prev + item.value);
            setTotalCredits(prev => prev + item.value);
          } else if (inventory.length < inventoryCapacity) {
            setInventory(prev => [...prev, item]);
          } else {
            // Inventory full - auto scrap lowest rarity
            setCredits(prev => prev + item.value);
            setTotalCredits(prev => prev + item.value);
          }

          setLastDrop(item);
          setDropAnimation(true);
          setTimeout(() => setDropAnimation(false), 300);

          // Flash for rare+ items
          if (item.rarityIndex >= 4) {
            setShowFlash(RARITIES[item.rarityIndex]);
            setTimeout(() => setShowFlash(null), 500);
          }
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [lootPerSecond, inventory.length, inventoryCapacity, autoScrapLevel, generateLoot]);

  const scrapItem = (item: Item) => {
    setInventory(prev => prev.filter(i => i.id !== item.id));
    setCredits(prev => prev + item.value);
    setTotalCredits(prev => prev + item.value);
    if (selectedItem?.id === item.id) setSelectedItem(null);
  };

  const scrapAllBelow = (maxRarity: number) => {
    const toScrap = inventory.filter(i => i.rarityIndex <= maxRarity);
    const totalValue = toScrap.reduce((sum, i) => sum + i.value, 0);
    setInventory(prev => prev.filter(i => i.rarityIndex > maxRarity));
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

  const getRarityStyle = (rarity: Rarity) => ({
    color: rarity.color,
    borderColor: rarity.borderColor,
    textShadow: `0 0 10px ${rarity.glowColor}`,
  });

  const renderLootFeed = () => {
    if (!lastDrop) return (
      <div className="text-center text-gray-500 py-20">
        <div className="text-6xl mb-4">⏳</div>
        <p className="text-lg">Purchase a CPU Upgrade to start looting...</p>
      </div>
    );

    return (
      <div className="space-y-4">
        {/* Current drop display */}
        <div
          className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${dropAnimation ? 'scale-105' : 'scale-100'}`}
          style={{
            borderColor: RARITIES[lastDrop.rarityIndex].borderColor,
            backgroundColor: RARITIES[lastDrop.rarityIndex].bgColor,
            boxShadow: `0 0 30px ${RARITIES[lastDrop.rarityIndex].glowColor}, inset 0 0 30px ${RARITIES[lastDrop.rarityIndex].glowColor}`,
          }}
        >
          <div className="flex items-center gap-4">
            <span className="text-5xl">{lastDrop.icon}</span>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wider opacity-70" style={{ color: RARITIES[lastDrop.rarityIndex].color }}>
                {RARITIES[lastDrop.rarityIndex].name}
              </div>
              <div className="text-lg font-bold" style={{ color: RARITIES[lastDrop.rarityIndex].color }}>
                {lastDrop.name}
              </div>
              <div className="text-sm text-gray-400">{lastDrop.slot}</div>
            </div>
            <div className="text-right">
              <div className="text-yellow-400 font-bold">💰 {formatNumber(lastDrop.value)}</div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {lastDrop.stats.map((stat, i) => (
              <span key={i} className="px-2 py-1 rounded text-xs bg-black/30 border border-gray-700" style={{ color: RARITIES[lastDrop.rarityIndex].color }}>
                +{formatNumber(stat.value)} {stat.name}
              </span>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800 text-center">
            <div className="text-xs text-gray-500">Loot/Sec</div>
            <div className="text-lg font-bold text-cyan-400">{formatNumber(lootPerSecond)}</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800 text-center">
            <div className="text-xs text-gray-500">Total Looted</div>
            <div className="text-lg font-bold text-purple-400">{formatNumber(totalLoot)}</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800 text-center">
            <div className="text-xs text-gray-500">Inventory</div>
            <div className="text-lg font-bold text-green-400">{inventory.length}/{inventoryCapacity}</div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => scrapAllBelow(0)}
            className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-600 text-sm transition-colors"
          >
            🗑️ Scrap Common ({inventory.filter(i => i.rarityIndex === 0).length})
          </button>
          <button
            onClick={() => scrapAllBelow(1)}
            className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-600 text-sm transition-colors"
          >
            🗑️ Scrap ≤Uncommon ({inventory.filter(i => i.rarityIndex <= 1).length})
          </button>
          <button
            onClick={() => scrapAllBelow(2)}
            className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-600 text-sm transition-colors"
          >
            🗑️ Scrap ≤Rare ({inventory.filter(i => i.rarityIndex <= 2).length})
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
            Inventory ({inventory.length}/{inventoryCapacity})
          </h3>
          <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all"
              style={{ width: `${(inventory.length / inventoryCapacity) * 100}%` }}
            />
          </div>
        </div>

        {sortedInventory.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            <div className="text-4xl mb-2">📦</div>
            <p>Inventory is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {sortedInventory.map(item => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${selectedItem?.id === item.id ? 'ring-2 ring-white/50' : ''}`}
                style={{
                  borderColor: RARITIES[item.rarityIndex].borderColor,
                  backgroundColor: RARITIES[item.rarityIndex].bgColor,
                }}
                onClick={() => setSelectedItem(item)}
              >
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs" style={{ color: RARITIES[item.rarityIndex].color }}>
                    {RARITIES[item.rarityIndex].name}
                  </div>
                  <div className="text-sm font-medium text-gray-200 truncate">{item.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-yellow-400 text-sm">💰{formatNumber(item.value)}</div>
                  <button
                    onClick={(e) => { e.stopPropagation(); scrapItem(item); }}
                    className="text-xs text-red-400 hover:text-red-300 mt-1"
                  >
                    [Scrap]
                  </button>
                </div>
              </div>
            ))}
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
            <div className="flex gap-2">
              <button
                onClick={() => scrapItem(selectedItem)}
                className="flex-1 py-2 rounded-lg bg-red-900/50 hover:bg-red-800/50 border border-red-700 text-red-300 text-sm transition-colors"
              >
                🗑️ Scrap for 💰{formatNumber(selectedItem.value)}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderUpgrades = () => (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-200">Cybernetic Upgrades</h3>
      <div className="grid grid-cols-1 gap-3">
        {UPGRADES.map(upgrade => {
          const level = upgrades[upgrade.id] || 0;
          const cost = getUpgradeCost(upgrade, level);
          const canAfford = credits >= cost;

          return (
            <div
              key={upgrade.id}
              className={`p-4 rounded-xl border transition-all ${canAfford ? 'border-cyan-700 hover:border-cyan-500 hover:bg-cyan-900/10' : 'border-gray-800 opacity-60'}`}
              style={{ backgroundColor: canAfford ? 'rgba(6,182,212,0.05)' : 'rgba(0,0,0,0.3)' }}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{upgrade.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-200">{upgrade.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-cyan-400">Lv.{level}</span>
                  </div>
                  <div className="text-sm text-gray-400">{upgrade.description}</div>
                </div>
                <button
                  onClick={() => buyUpgrade(upgrade.id)}
                  disabled={!canAfford}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    canAfford
                      ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white shadow-lg shadow-cyan-500/20'
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
        <h3 className="text-lg font-bold text-gray-200">Statistics</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
            <div className="text-sm text-gray-500">Total Credits Earned</div>
            <div className="text-2xl font-bold text-yellow-400">💰 {formatNumber(totalCredits)}</div>
          </div>
          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
            <div className="text-sm text-gray-500">Total Items Looted</div>
            <div className="text-2xl font-bold text-purple-400">📦 {formatNumber(totalLoot)}</div>
          </div>
          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
            <div className="text-sm text-gray-500">Loot Speed</div>
            <div className="text-2xl font-bold text-cyan-400">⚡ {formatNumber(lootPerSecond)}/s</div>
          </div>
          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
            <div className="text-sm text-gray-500">Luck Bonus</div>
            <div className="text-2xl font-bold text-green-400">🍀 +{luckBonus}%</div>
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
          <h4 className="font-bold text-gray-300 mb-3">Rarity Discovery</h4>
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
                  <div className="w-20 text-right text-xs text-gray-400">
                    {formatNumber(count)} ({percentage.toFixed(1)}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
          <h4 className="font-bold text-gray-300 mb-3">Possible Combinations</h4>
          <div className="text-center py-4">
            <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {(ITEM_SLOTS.length * 10 * 10 * RARITIES.length * Math.pow(18, 4)).toLocaleString()}+
            </div>
            <div className="text-sm text-gray-500 mt-1">unique item variations</div>
            <div className="text-xs text-gray-600 mt-2">
              {ITEM_SLOTS.length} slots × 10 prefixes × 8 suffixes × {RARITIES.length} rarities × stats
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-mono relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/3 rounded-full blur-3xl" />
      </div>

      {/* Flash effect for rare drops */}
      {showFlash && (
        <div
          className="fixed inset-0 pointer-events-none z-50 animate-pulse"
          style={{ backgroundColor: showFlash.glowColor, opacity: 0.3 }}
        />
      )}

      {/* Header */}
      <header className="relative z-10 border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                NEON LOOT
              </h1>
              <span className="text-xs text-gray-500 hidden sm:inline">v2.0.77 // IDLE PROTOCOL</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-gray-500">CREDITS</div>
                <div className="text-lg font-bold text-yellow-400">💰 {formatNumber(credits)}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'loot' as const, label: '⚡ Loot Feed', },
              { id: 'inventory' as const, label: '📦 Inventory' },
              { id: 'upgrades' as const, label: '🔧 Upgrades' },
              { id: 'stats' as const, label: '📊 Stats' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
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
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'loot' && renderLootFeed()}
        {activeTab === 'inventory' && renderInventory()}
        {activeTab === 'upgrades' && renderUpgrades()}
        {activeTab === 'stats' && renderStats()}
      </main>

      {/* Bottom bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-10 border-t border-gray-800 bg-gray-950/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between text-xs text-gray-500">
          <span>⚡ {formatNumber(lootPerSecond)}/sec</span>
          <span>🍀 +{luckBonus}% luck</span>
          <span>💰 +{valueBonus}% value</span>
          <span>📦 {inventory.length}/{inventoryCapacity}</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
