import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkDependencies = () => {
      if (
        window.GameEngine &&
        window.UpgradePanel &&
        window.InventoryPanel &&
        window.MenuPanel
      ) {
        setIsReady(true);
      }
    };

    checkDependencies();
    const interval = setInterval(checkDependencies, 100);

    return () => clearInterval(interval);
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-400 to-blue-800">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Тихая глубина</h1>
          <div className="animate-pulse text-sky-200">Загрузка...</div>
        </div>
      </div>
    );
  }

  return <window.GameEngine />;
}

createRoot(document.getElementById('renderDiv')).render(<App />);