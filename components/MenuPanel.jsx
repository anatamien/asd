import React, { useState } from 'react';

function MenuPanel({ gameState, onSave, onClose }) {
  const [settings, setSettings] = useState({
    sound: true,
    music: true,
    language: 'ru'
  });

  const [showAbout, setShowAbout] = useState(false);

  const handleReset = () => {
    if (confirm('Вы уверены, что хотите сбросить весь прогресс?')) {
      localStorage.removeItem('silentDepthsSave');
      window.location.reload();
    }
  };

  const exportSave = () => {
    const saveData = JSON.stringify(gameState);
    const blob = new Blob([saveData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'silent_depths_save.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (showAbout) {
    return (
      <div className="panel-overlay" onClick={onClose}>
        <div className="panel-content p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">О игре</h2>
            <button 
              className="text-xl hover:text-white transition-colors"
              onClick={() => setShowAbout(false)}
            >
              ✕
            </button>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-bold text-lg mb-2">Тихая глубина</h3>
              <p className="text-sky-200">海の静けさ</p>
            </div>

            <div className="haiku-text">
              Море зовёт нас.<br/>
              В тишине волн — наш покой.<br/>
              Вечность в одном миге.
            </div>

            <div>
              <p className="text-sky-200 mb-2">
                Медитативная idle-игра, вдохновлённая японской эстетикой 90-х годов.
              </p>
              <p className="text-sky-200 mb-2">
                Управляйте рыбацкой лодкой, ловите рыбу, собирайте жемчуг и открывайте тайны морской бездны.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-2">Как играть:</h4>
              <ul className="text-sky-200 space-y-1">
                <li>• Тапайте по морю для ловли рыбы</li>
                <li>• Улучшайте снаряжение</li>
                <li>• Исследуйте новые зоны</li>
                <li>• Собирайте достижения</li>
                <li>• Наслаждайтесь медитативным процессом</li>
              </ul>
            </div>

            <div className="haiku-text">
              Путь рыбака прост.<br/>
              Терпение — наш учитель.<br/>
              Глубина ждёт нас.
            </div>
          </div>

          <button 
            className="zen-button w-full mt-6"
            onClick={() => setShowAbout(false)}
          >
            Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel-content p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Меню</h2>
          <button 
            className="text-xl hover:text-white transition-colors"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Settings */}
          <div>
            <h3 className="text-lg font-bold mb-3">Настройки</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Звуки</span>
                <button
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.sound ? 'bg-sky-500' : 'bg-gray-600'
                  }`}
                  onClick={() => setSettings(prev => ({ ...prev, sound: !prev.sound }))}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.sound ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              <div className="flex justify-between items-center">
                <span>Музыка</span>
                <button
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.music ? 'bg-sky-500' : 'bg-gray-600'
                  }`}
                  onClick={() => setSettings(prev => ({ ...prev, music: !prev.music }))}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.music ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Game Management */}
          <div>
            <h3 className="text-lg font-bold mb-3">Управление игрой</h3>
            <div className="space-y-2">
              <button 
                className="zen-button w-full"
                onClick={onSave}
              >
                Сохранить игру
              </button>
              
              <button 
                className="zen-button w-full"
                onClick={exportSave}
              >
                Экспорт сохранения
              </button>
              
              <button 
                className="zen-button w-full bg-red-900 bg-opacity-50 hover:bg-red-800"
                onClick={handleReset}
              >
                Сброс прогресса
              </button>
            </div>
          </div>

          {/* About */}
          <div>
            <button 
              className="zen-button w-full"
              onClick={() => setShowAbout(true)}
            >
              О игре
            </button>
          </div>

          {/* Zen Quote */}
          <div className="haiku-text mt-6">
            Тишина в сердце.<br/>
            Волны несут нас к покою.<br/>
            Здесь и сейчас — всё.
          </div>
        </div>
      </div>
    </div>
  );
}

window.MenuPanel = MenuPanel;