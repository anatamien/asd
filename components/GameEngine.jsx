import React, { useState, useEffect, useRef, useCallback } from 'react';

const ZONES = [
  { id: 'shallow', name: 'Тихая отмель', minDepth: 0, fishTypes: ['плотва', 'краб', 'мидия'] },
  { id: 'reef', name: 'Песнь рифов', minDepth: 100, fishTypes: ['коралл', 'жемчуг', 'морской конек'] },
  { id: 'jellyfish', name: 'Свет медуз', minDepth: 500, fishTypes: ['медуза', 'светлячок', 'фосфор'] },
  { id: 'abyss', name: 'Молчаливая бездна', minDepth: 2000, fishTypes: ['древний артефакт', 'глубинная рыба', 'око глубины'] }
];

const UPGRADES = [
  {
    id: 'nets',
    name: 'Новые сети',
    basePrice: 30,
    effect: 'Скорость ловли +20%',
    haiku: 'Капля в сети ждёт.\nТени шевелятся в ней.\nТишина гудит.',
    currency: 'fish'
  },
  {
    id: 'oysters',
    name: 'Жемчужные устрицы',
    basePrice: 5,
    effect: 'Шанс жемчуга +1%',
    haiku: 'Перламутр спит.\nОкеан не делится.\nНо ты нашёл свет.',
    currency: 'pearls'
  },
  {
    id: 'lanterns',
    name: 'Фонари для глубины',
    basePrice: 100,
    effect: 'Открывает новые зоны',
    haiku: 'Свет во тьме горит.\nГлубина раскроет тайны.\nПуть освещён.',
    currency: 'fish'
  },
  {
    id: 'spirit',
    name: 'Дух океана',
    basePrice: 1,
    effect: 'x2 прибыль на 10 мин',
    haiku: 'Глубина поёт.\nДревний дух шепчет волне.\nЛодка просыпается.',
    currency: 'artifacts'
  }
];

function GameEngine() {
  const [gameState, setGameState] = useState({
    fish: 0,
    pearls: 0,
    artifacts: 0,
    currentZone: 0,
    upgrades: { nets: 0, oysters: 0, lanterns: 0, spirit: 0 },
    energy: 100,
    depth: 0,
    lastSave: Date.now(),
    fishingPower: 1,
    pearlChance: 0.01,
    boatEnergy: 100,
    activeMultiplier: 1,
    multiplierEndTime: 0
  });

  const [ripples, setRipples] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activePanel, setActivePanel] = useState(null);
  const [offlineReport, setOfflineReport] = useState(null);
  
  const gameLoopRef = useRef();
  const lastIdleUpdate = useRef(Date.now());

  // Save game state to localStorage
  const saveGame = useCallback(() => {
    const saveData = { ...gameState, lastSave: Date.now() };
    localStorage.setItem('silentDepthsSave', JSON.stringify(saveData));
  }, [gameState]);

  // Load game state from localStorage
  const loadGame = useCallback(() => {
    const saved = localStorage.getItem('silentDepthsSave');
    if (saved) {
      const data = JSON.parse(saved);
      const now = Date.now();
      const offlineTime = now - data.lastSave;
      
      if (offlineTime > 60000) { // More than 1 minute offline
        const offlineHours = Math.min(offlineTime / 3600000, 8); // Max 8 hours
        const offlineFish = Math.floor(offlineHours * 20 * (1 + data.upgrades.nets * 0.2));
        
        setOfflineReport({
          time: offlineHours,
          fish: offlineFish
        });
        
        data.fish += offlineFish;
      }
      
      setGameState(data);
    }
  }, []);

  // Initialize game
  useEffect(() => {
    loadGame();
    
    // Auto-save every 30 seconds
    const saveInterval = setInterval(saveGame, 30000);
    
    return () => clearInterval(saveInterval);
  }, [loadGame, saveGame]);

  // Main game loop
  useEffect(() => {
    gameLoopRef.current = setInterval(() => {
      setGameState(prev => {
        const now = Date.now();
        let newState = { ...prev };

        // Passive fishing income (every 5 seconds)
        if (now - lastIdleUpdate.current > 5000) {
          const idleIncome = Math.floor(1 + prev.upgrades.nets * 0.2);
          newState.fish += idleIncome;
          lastIdleUpdate.current = now;
        }

        // Check multiplier expiration
        if (prev.multiplierEndTime > 0 && now > prev.multiplierEndTime) {
          newState.activeMultiplier = 1;
          newState.multiplierEndTime = 0;
        }

        // Energy regeneration
        if (newState.boatEnergy < 100) {
          newState.boatEnergy = Math.min(100, newState.boatEnergy + 0.5);
        }

        return newState;
      });
    }, 1000);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, []);

  // Handle fishing click
  const handleFishingClick = (event) => {
    if (gameState.boatEnergy < 10) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Create ripple effect
    const rippleId = Date.now();
    setRipples(prev => [...prev, { id: rippleId, x, y }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== rippleId));
    }, 600);

    // Calculate catch
    const fishCaught = Math.floor(gameState.fishingPower * gameState.activeMultiplier);
    let pearlsCaught = 0;
    let artifactsCaught = 0;

    // Pearl chance
    if (Math.random() < gameState.pearlChance + (gameState.upgrades.oysters * 0.01)) {
      pearlsCaught = 1;
    }

    // Artifact chance (very rare)
    if (Math.random() < 0.001 && gameState.currentZone >= 3) {
      artifactsCaught = 1;
    }

    setGameState(prev => ({
      ...prev,
      fish: prev.fish + fishCaught,
      pearls: prev.pearls + pearlsCaught,
      artifacts: prev.artifacts + artifactsCaught,
      boatEnergy: Math.max(0, prev.boatEnergy - 10),
      depth: prev.depth + 1
    }));

    // Show notification
    if (fishCaught > 0 || pearlsCaught > 0 || artifactsCaught > 0) {
      const items = [];
      if (fishCaught > 0) items.push(`${fishCaught} рыба`);
      if (pearlsCaught > 0) items.push(`${pearlsCaught} жемчуг`);
      if (artifactsCaught > 0) items.push(`${artifactsCaught} артефакт`);
      
      showNotification(`Поймано: ${items.join(', ')}`);
    }
  };

  // Show notification
  const showNotification = (text) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, text }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // Handle upgrade purchase
  const buyUpgrade = (upgradeId) => {
    const upgrade = UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return;

    const currentLevel = gameState.upgrades[upgradeId];
    const price = Math.floor(upgrade.basePrice * Math.pow(1.5, currentLevel));
    const currency = upgrade.currency;

    if (gameState[currency] >= price) {
      setGameState(prev => ({
        ...prev,
        [currency]: prev[currency] - price,
        upgrades: {
          ...prev.upgrades,
          [upgradeId]: prev.upgrades[upgradeId] + 1
        },
        fishingPower: upgradeId === 'nets' ? prev.fishingPower + 0.2 : prev.fishingPower,
        pearlChance: upgradeId === 'oysters' ? prev.pearlChance + 0.01 : prev.pearlChance,
        currentZone: upgradeId === 'lanterns' && prev.upgrades.lanterns === 0 ? Math.min(prev.currentZone + 1, ZONES.length - 1) : prev.currentZone,
        activeMultiplier: upgradeId === 'spirit' ? 2 : prev.activeMultiplier,
        multiplierEndTime: upgradeId === 'spirit' ? Date.now() + 600000 : prev.multiplierEndTime // 10 minutes
      }));

      showNotification(`Улучшение "${upgrade.name}" куплено!`);
    }
  };

  const currentZone = ZONES[gameState.currentZone];

  return (
    <div className="zen-container">
      <div className="ocean-surface"></div>
      
      {/* Zone indicator */}
      <div className="zone-indicator">
        {currentZone.name}
      </div>

      {/* Currency display */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-30">
        <div className="flex gap-4">
          <div className="currency-display flex items-center gap-2">
            <svg className="fish-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 5-5v10zm2-5l5-5v10l-5-5z"/>
            </svg>
            {Math.floor(gameState.fish)}
          </div>
          <div className="currency-display flex items-center gap-2">
            <svg className="fish-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            {Math.floor(gameState.pearls)}
          </div>
          <div className="currency-display flex items-center gap-2">
            <svg className="fish-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
            {Math.floor(gameState.artifacts)}
          </div>
        </div>
        
        {/* Energy bar */}
        <div className="currency-display">
          <div className="progress-bar w-24 h-3">
            <div 
              className="progress-fill" 
              style={{ width: `${gameState.boatEnergy}%` }}
            ></div>
          </div>
          <div className="text-xs mt-1">Энергия лодки</div>
        </div>
      </div>

      {/* Fishing boat */}
      <div className="fishing-boat"></div>

      {/* Fishing area with ripples */}
      <div className="fishing-area" onClick={handleFishingClick}>
        {ripples.map(ripple => (
          <div
            key={ripple.id}
            className="ripple-effect"
            style={{
              left: ripple.x - 25,
              top: ripple.y - 25,
              width: 50,
              height: 50
            }}
          />
        ))}
      </div>

      {/* Bottom navigation */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4 z-30">
        <button 
          className="zen-button"
          onClick={() => setActivePanel('upgrades')}
        >
          Апгрейды
        </button>
        <button 
          className="zen-button"
          onClick={() => setActivePanel('inventory')}
        >
          Инвентарь
        </button>
        <button 
          className="zen-button"
          onClick={() => setActivePanel('menu')}
        >
          Меню
        </button>
      </div>

      {/* Notifications */}
      <div className="absolute top-20 right-4 z-40">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className="currency-display mb-2 text-sm animate-bounce"
          >
            {notification.text}
          </div>
        ))}
      </div>

      {/* Offline report modal */}
      {offlineReport && (
        <div className="panel-overlay" onClick={() => setOfflineReport(null)}>
          <div className="panel-content p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Добро пожаловать обратно!</h2>
            <p className="mb-4">
              Ты отсутствовал {offlineReport.time.toFixed(1)} ч.
            </p>
            <p className="mb-4">
              Поймано рыб: {offlineReport.fish}
            </p>
            <div className="haiku-text">
              Время течёт.<br/>
              Сети ловят в тишине.<br/>
              Море не спит.
            </div>
            <button 
              className="zen-button w-full mt-4"
              onClick={() => setOfflineReport(null)}
            >
              Продолжить
            </button>
          </div>
        </div>
      )}

      {/* Panel overlays */}
      {activePanel === 'upgrades' && (
        <window.UpgradePanel 
          gameState={gameState}
          upgrades={UPGRADES}
          onBuyUpgrade={buyUpgrade}
          onClose={() => setActivePanel(null)}
        />
      )}

      {activePanel === 'inventory' && (
        <window.InventoryPanel 
          gameState={gameState}
          zones={ZONES}
          onClose={() => setActivePanel(null)}
        />
      )}

      {activePanel === 'menu' && (
        <window.MenuPanel 
          gameState={gameState}
          onSave={saveGame}
          onClose={() => setActivePanel(null)}
        />
      )}
    </div>
  );
}

window.GameEngine = GameEngine;