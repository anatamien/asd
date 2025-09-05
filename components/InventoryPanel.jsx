import React from 'react';

function InventoryPanel({ gameState, zones, onClose }) {
  const currentZone = zones[gameState.currentZone];
  
  const achievements = [
    {
      name: 'Первый улов',
      description: 'Поймай свою первую рыбу',
      completed: gameState.fish > 0,
      haiku: 'Первая рыба.\nВода кольцами идёт.\nНачало пути.'
    },
    {
      name: 'Сто рыб',
      description: 'Поймай 100 рыб',
      completed: gameState.fish >= 100,
      haiku: 'Поймал сто рыб.\nТишина под ветром спит.\nЛодка качнулась.'
    },
    {
      name: 'Жемчужный ловец',
      description: 'Найди свой первый жемчуг',
      completed: gameState.pearls > 0,
      haiku: 'Жемчуг в глубине.\nОкеан дарит сокровища.\nСвет в темноте.'
    },
    {
      name: 'Хранитель артефактов',
      description: 'Найди древний артефакт',
      completed: gameState.artifacts > 0,
      haiku: 'Древность молчит.\nАртефакт помнит эпохи.\nТайна раскрыта.'
    }
  ];

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel-content p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Инвентарь</h2>
          <button 
            className="text-xl hover:text-white transition-colors"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Current Zone */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">Текущая зона</h3>
          <div className="border border-opacity-30 border-sky-300 rounded-lg p-4 bg-slate-700 bg-opacity-30">
            <h4 className="font-bold">{currentZone.name}</h4>
            <p className="text-sm text-sky-200">Глубина: {gameState.depth}м</p>
            <div className="mt-2">
              <p className="text-sm">Обитатели:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {currentZone.fishTypes.map(fish => (
                  <span key={fish} className="text-xs bg-sky-900 bg-opacity-50 px-2 py-1 rounded">
                    {fish}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">Достижения</h3>
          <div className="space-y-3">
            {achievements.map((achievement, index) => (
              <div 
                key={index}
                className={`border border-opacity-30 rounded-lg p-3 ${
                  achievement.completed 
                    ? 'border-sky-300 bg-slate-700 bg-opacity-30' 
                    : 'border-gray-500 bg-gray-800 bg-opacity-30'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`font-bold ${achievement.completed ? 'text-sky-200' : 'text-gray-400'}`}>
                    {achievement.name}
                  </h4>
                  <span className={`text-sm ${achievement.completed ? 'text-green-400' : 'text-gray-500'}`}>
                    {achievement.completed ? '✓' : '○'}
                  </span>
                </div>
                <p className={`text-xs ${achievement.completed ? 'text-sky-300' : 'text-gray-500'}`}>
                  {achievement.description}
                </p>
                {achievement.completed && (
                  <div className="haiku-text mt-2 text-xs">
                    {achievement.haiku.split('\n').map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div>
          <h3 className="text-lg font-bold mb-2">Статистика</h3>
          <div className="border border-opacity-30 border-sky-300 rounded-lg p-4 bg-slate-700 bg-opacity-30">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-sky-200">Всего рыбы:</p>
                <p className="font-bold">{Math.floor(gameState.fish)}</p>
              </div>
              <div>
                <p className="text-sky-200">Жемчуга:</p>
                <p className="font-bold">{Math.floor(gameState.pearls)}</p>
              </div>
              <div>
                <p className="text-sky-200">Артефакты:</p>
                <p className="font-bold">{Math.floor(gameState.artifacts)}</p>
              </div>
              <div>
                <p className="text-sky-200">Глубина:</p>
                <p className="font-bold">{gameState.depth}м</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.InventoryPanel = InventoryPanel;