import React from 'react';

function UpgradePanel({ gameState, upgrades, onBuyUpgrade, onClose }) {
  const getUpgradePrice = (upgrade, currentLevel) => {
    return Math.floor(upgrade.basePrice * Math.pow(1.5, currentLevel));
  };

  const canAfford = (upgrade, price) => {
    return gameState[upgrade.currency] >= price;
  };

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel-content p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Апгрейды</h2>
          <button 
            className="text-xl hover:text-white transition-colors"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {upgrades.map(upgrade => {
            const currentLevel = gameState.upgrades[upgrade.id];
            const price = getUpgradePrice(upgrade, currentLevel);
            const affordable = canAfford(upgrade, price);
            
            return (
              <div 
                key={upgrade.id}
                className="border border-opacity-30 border-sky-300 rounded-lg p-4 bg-slate-700 bg-opacity-30"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{upgrade.name}</h3>
                    <p className="text-sm text-sky-200">Уровень {currentLevel}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-sky-200">
                      {price} {upgrade.currency === 'fish' ? 'рыба' : 
                             upgrade.currency === 'pearls' ? 'жемчуг' : 'артефакты'}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm mb-2">{upgrade.effect}</p>
                
                <div className="haiku-text mb-4">
                  {upgrade.haiku.split('\n').map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
                
                <button
                  className={`zen-button w-full ${!affordable ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => affordable && onBuyUpgrade(upgrade.id)}
                  disabled={!affordable}
                >
                  Купить
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

window.UpgradePanel = UpgradePanel;