const { useState, useEffect, useRef } = React;

// SVG Icons Component
const Icons = {
  Fish: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 5-5v3h6v4h-6v3z"/>
    </svg>
  ),
  Pearl: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <circle cx="12" cy="12" r="8" fill="currentColor" opacity="0.8"/>
      <circle cx="12" cy="12" r="4" fill="white" opacity="0.6"/>
    </svg>
  ),
  Net: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  Upgrade: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="currentColor" d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z"/>
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="currentColor" d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
    </svg>
  ),
  Inventory: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  )
};

// Game State Hook
const useGameState = () => {
  const [gameState, setGameState] = useState(() => {
    const saved = localStorage.getItem('silentDepthsGame');
    return saved ? JSON.parse(saved) : {
      fish: 0,
      pearls: 0,
      artifacts: 0,
      clickPower: 1,
      autoFishRate: 0,
      upgrades: {
        nets: 0,
        pearls: 0,
        spirit: 0,
        depth: 0
      },
      achievements: [],
      lastSave: Date.now(),
      settings: {
        sound: true,
        music: true
      },
      inventory: {
        commonFish: 0,
        rareFish: 0,
        legendaryFish: 0,
        corals: 0
      }
    };
  });

  useEffect(() => {
    localStorage.setItem('silentDepthsGame', JSON.stringify(gameState));
  }, [gameState]);

  return [gameState, setGameState];
};

// Main Game Component
const SilentDepthsGame = () => {
  const [gameState, setGameState] = useGameState();
  const [currentScreen, setCurrentScreen] = useState('game');
  const [ripples, setRipples] = useState([]);
  const audioRef = useRef();

  // Offline Progress Calculation
  useEffect(() => {
    const now = Date.now();
    const timeDiff = Math.min(now - gameState.lastSave, 8 * 60 * 60 * 1000); // Max 8 hours
    const offlineFish = Math.floor((timeDiff / 1000) * (gameState.autoFishRate / 60));
    
    if (offlineFish > 0) {
      setGameState(prev => ({
        ...prev,
        fish: prev.fish + offlineFish,
        lastSave: now
      }));
    }
  }, []);

  // Auto-fishing interval
  useEffect(() => {
    if (gameState.autoFishRate > 0) {
      const interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          fish: prev.fish + prev.autoFishRate,
          lastSave: Date.now()
        }));
      }, 60000); // Every minute
      return () => clearInterval(interval);
    }
  }, [gameState.autoFishRate]);

  // Click handler for fishing
  const handleFishClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Add ripple effect
    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 1000);

    // Add fish
    const fishGained = gameState.clickPower + Math.floor(Math.random() * 2);
    const pearlChance = 0.01 + (gameState.upgrades.pearls * 0.01);
    const pearlGained = Math.random() < pearlChance ? 1 : 0;

    setGameState(prev => ({
      ...prev,
      fish: prev.fish + fishGained,
      pearls: prev.pearls + pearlGained,
      lastSave: Date.now()
    }));
  };

  // Upgrade definitions
  const upgrades = [
    {
      id: 'nets',
      name: 'Новые сети',
      description: '+20% к скорости ловли',
      haiku: 'Капля в сети ждёт.\nТени шевелятся в ней.\nТишина гудит.',
      cost: () => 30 * Math.pow(2, gameState.upgrades.nets),
      currency: 'fish',
      effect: () => {
        setGameState(prev => ({
          ...prev,
          clickPower: prev.clickPower + 1,
          upgrades: { ...prev.upgrades, nets: prev.upgrades.nets + 1 }
        }));
      }
    },
    {
      id: 'pearls',
      name: 'Жемчужные устрицы',
      description: 'Шанс +1% жемчуга',
      haiku: 'Перламутр спит.\nОкеан не делится.\nНо ты нашёл свет.',
      cost: () => 5 * Math.pow(3, gameState.upgrades.pearls),
      currency: 'pearls',
      effect: () => {
        setGameState(prev => ({
          ...prev,
          upgrades: { ...prev.upgrades, pearls: prev.upgrades.pearls + 1 }
        }));
      }
    },
    {
      id: 'spirit',
      name: 'Дух океана',
      description: 'Автоматическая рыбалка',
      haiku: 'Глубина поёт.\nДревний дух шепчет волне.\nЛодка просыпается.',
      cost: () => 1 + gameState.upgrades.spirit,
      currency: 'artifacts',
      effect: () => {
        setGameState(prev => ({
          ...prev,
          autoFishRate: prev.autoFishRate + 1,
          upgrades: { ...prev.upgrades, spirit: prev.upgrades.spirit + 1 }
        }));
      }
    }
  ];

  // Screen Components
  const GameScreen = () => (
    <div className="h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden">
      {/* Ocean Background */}
      <div 
        className="absolute inset-0 cursor-pointer"
        style={{
          backgroundImage: 'url(assets/ocean-bg.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        onClick={handleFishClick}
      >
        {/* Ripple Effects */}
        {ripples.map(ripple => (
          <div
            key={ripple.id}
            className="absolute border-2 border-green-300 rounded-full ripple pointer-events-none"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20
            }}
          />
        ))}
      </div>

      {/* Floating Boat */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 floating">
        <img 
          src="assets/boat.webp" 
          alt="Fishing Boat" 
          className="w-32 h-16 md:w-48 md:h-24 filter drop-shadow-lg"
        />
      </div>

      {/* Top UI Panel */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-slate-900/80 to-transparent p-4">
        <div className="flex justify-between items-center text-white">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-blue-800/50 px-3 py-2 rounded-lg zen-glow">
              <Icons.Fish />
              <span className="font-medium">{gameState.fish}</span>
            </div>
            <div className="flex items-center space-x-2 bg-purple-800/50 px-3 py-2 rounded-lg zen-glow">
              <Icons.Pearl />
              <span className="font-medium">{gameState.pearls}</span>
            </div>
            {gameState.artifacts > 0 && (
              <div className="flex items-center space-x-2 bg-amber-800/50 px-3 py-2 rounded-lg zen-glow">
                <span className="text-amber-200">⚱️</span>
                <span className="font-medium">{gameState.artifacts}</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm opacity-75">クリック力</div>
            <div className="text-lg font-bold">{gameState.clickPower}</div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent p-4">
        <div className="flex justify-center space-x-6">
          {[
            { id: 'upgrades', icon: Icons.Upgrade, label: 'Апгрейды' },
            { id: 'inventory', icon: Icons.Inventory, label: 'Инвентарь' },
            { id: 'settings', icon: Icons.Settings, label: 'Меню' }
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setCurrentScreen(id)}
              className="flex flex-col items-center space-y-1 text-white/80 hover:text-white transition-all duration-300 hover:scale-110"
            >
              <div className="p-3 bg-slate-800/50 rounded-lg zen-glow hover:bg-slate-700/50">
                <Icon />
              </div>
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Zen Message */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-center text-white/60 max-w-xs">
        <p className="text-sm italic">
          Тихая вода,<br/>
          рыба ждёт прикосновенья.<br/>
          Душа находит покой.
        </p>
      </div>
    </div>
  );

  const UpgradeScreen = () => (
    <div className="h-screen bg-gradient-to-b from-slate-900 to-blue-900 p-4 overflow-y-auto">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">アップグレード</h2>
          <button
            onClick={() => setCurrentScreen('game')}
            className="text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {upgrades.map(upgrade => {
            const cost = upgrade.cost();
            const canAfford = gameState[upgrade.currency] >= cost;
            
            return (
              <div 
                key={upgrade.id}
                className="bg-slate-800/50 rounded-lg p-4 zen-glow border border-slate-700"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-white font-medium">{upgrade.name}</h3>
                    <p className="text-slate-300 text-sm">{upgrade.description}</p>
                    <p className="text-slate-400 text-xs mt-1">
                      レベル: {gameState.upgrades[upgrade.id]}
                    </p>
                  </div>
                  <button
                    onClick={() => canAfford && upgrade.effect()}
                    disabled={!canAfford}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      canAfford 
                        ? 'bg-green-600 hover:bg-green-500 text-white' 
                        : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {cost} {upgrade.currency === 'fish' ? '🐟' : upgrade.currency === 'pearls' ? '💎' : '⚱️'}
                  </button>
                </div>
                <div className="text-slate-300 text-xs italic border-t border-slate-600 pt-2">
                  {upgrade.haiku}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const InventoryScreen = () => (
    <div className="h-screen bg-gradient-to-b from-slate-900 to-blue-900 p-4 overflow-y-auto">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">インベントリ</h2>
          <button
            onClick={() => setCurrentScreen('game')}
            className="text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { name: 'Обычная рыба', count: Math.floor(gameState.fish * 0.7), icon: '🐟' },
            { name: 'Редкая рыба', count: Math.floor(gameState.fish * 0.2), icon: '🐠' },
            { name: 'Легендарная рыба', count: Math.floor(gameState.fish * 0.1), icon: '🦈' },
            { name: 'Жемчуг', count: gameState.pearls, icon: '💎' },
            { name: 'Кораллы', count: gameState.inventory.corals, icon: '🪸' },
            { name: 'Артефакты', count: gameState.artifacts, icon: '⚱️' }
          ].map((item, index) => (
            <div 
              key={index}
              className="bg-slate-800/50 rounded-lg p-4 text-center zen-glow border border-slate-700"
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-white text-sm font-medium">{item.name}</div>
              <div className="text-slate-300 text-lg">{item.count}</div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h3 className="text-white font-medium mb-4">達成</h3>
          <div className="space-y-3">
            {[
              { name: 'Первая рыба', desc: 'Капля упала.\nРыба серебром мелькнула.\nПуть начинается.', unlocked: gameState.fish >= 1 },
              { name: 'Сто рыб', desc: 'Поймал сто рыб.\nТишина под ветром спит.\nЛодка качнулась.', unlocked: gameState.fish >= 100 },
              { name: 'Первый жемчуг', desc: 'Глубина дарит.\nПерламутровый секрет.\nСвет в темноте моря.', unlocked: gameState.pearls >= 1 }
            ].map((achievement, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${
                  achievement.unlocked 
                    ? 'bg-green-800/30 border-green-600 text-green-200' 
                    : 'bg-slate-800/30 border-slate-600 text-slate-400'
                }`}
              >
                <div className="font-medium">{achievement.name}</div>
                <div className="text-xs italic mt-1">{achievement.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const SettingsScreen = () => (
    <div className="h-screen bg-gradient-to-b from-slate-900 to-blue-900 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">設定</h2>
          <button
            onClick={() => setCurrentScreen('game')}
            className="text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-4 zen-glow border border-slate-700">
            <h3 className="text-white font-medium mb-4">Аудио</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Музыка</span>
                <button
                  onClick={() => setGameState(prev => ({
                    ...prev,
                    settings: { ...prev.settings, music: !prev.settings.music }
                  }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    gameState.settings.music ? 'bg-green-600' : 'bg-slate-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    gameState.settings.music ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Звуки</span>
                <button
                  onClick={() => setGameState(prev => ({
                    ...prev,
                    settings: { ...prev.settings, sound: !prev.settings.sound }
                  }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    gameState.settings.sound ? 'bg-green-600' : 'bg-slate-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    gameState.settings.sound ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 zen-glow border border-slate-700">
            <h3 className="text-white font-medium mb-4">Энциклопедия</h3>
            <div className="space-y-3 text-slate-300 text-sm">
              <div>
                <div className="font-medium text-white">Тихая отмель</div>
                <div className="italic">Первые шаги в мир тишины. Здесь обитает обычная рыба.</div>
              </div>
              <div>
                <div className="font-medium text-white">Песнь рифов</div>
                <div className="italic">Кораллы поют древние мелодии. Источник жемчуга.</div>
              </div>
              <div>
                <div className="font-medium text-white">Свет медуз</div>
                <div className="italic">Биолюминесцентные создания освещают путь.</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 zen-glow border border-slate-700">
            <h3 className="text-white font-medium mb-2">О игре</h3>
            <p className="text-slate-300 text-sm italic">
              "Тихая глубина" - медитативное путешествие в мир океанского покоя.
              Найдите гармонию в простоте рыбалки.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Screen Renderer
  const renderScreen = () => {
    switch (currentScreen) {
      case 'upgrades': return <UpgradeScreen />;
      case 'inventory': return <InventoryScreen />;
      case 'settings': return <SettingsScreen />;
      default: return <GameScreen />;
    }
  };

  return (
    <div className="select-none">
      {renderScreen()}
      
      {/* Background Audio */}
      {gameState.settings.music && (
        <audio ref={audioRef} loop autoPlay>
          <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgTEkfNAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgTEkfN" type="audio/wav" />
        </audio>
      )}
    </div>
  );
};

// Render the app
ReactDOM.render(<SilentDepthsGame />, document.getElementById('root'));