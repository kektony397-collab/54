
import React, { useState, useCallback } from 'react';
import { Speedometer } from './components/Speedometer';
import { FuelTracker } from './components/FuelTracker';
import { History } from './components/History';
import { Settings } from './components/Settings';
import { Footer } from './components/Footer';
import { useTheme } from './hooks/useTheme';
import { SpeedometerIcon, FuelIcon, HistoryIcon, SettingsIcon } from './components/icons/Icons';
import type { AppView } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('dashboard');
  const { theme, toggleTheme } = useTheme();

  const renderView = useCallback(() => {
    switch (view) {
      case 'dashboard':
        return <Speedometer />;
      case 'fuel':
        return <FuelTracker />;
      case 'history':
        return <History />;
      case 'settings':
        return <Settings toggleTheme={toggleTheme} currentTheme={theme} />;
      default:
        return <Speedometer />;
    }
  }, [view, theme, toggleTheme]);

  const NavItem: React.FC<{
    targetView: AppView;
    label: string;
    children: React.ReactNode;
  }> = ({ targetView, label, children }) => (
    <button
      onClick={() => setView(targetView)}
      className={`flex flex-col items-center justify-center w-full p-2 rounded-lg transition-colors duration-200 ${
        view === targetView
          ? 'bg-light-accent text-white dark:bg-dark-accent'
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-card'
      }`}
      aria-label={label}
    >
      {children}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );

  return (
    <div className="font-sans">
      <div className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text min-h-screen flex flex-col">
        <main className="flex-grow container mx-auto p-4 flex flex-col">
          {renderView()}
        </main>
        <nav className="sticky bottom-0 bg-light-card dark:bg-dark-card shadow-lg border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-md mx-auto grid grid-cols-4 gap-2 p-2">
            <NavItem targetView="dashboard" label="Speed">
              <SpeedometerIcon />
            </NavItem>
            <NavItem targetView="fuel" label="Fuel">
              <FuelIcon />
            </NavItem>
            <NavItem targetView="history" label="History">
              <HistoryIcon />
            </NavItem>
            <NavItem targetView="settings" label="Settings">
              <SettingsIcon />
            </NavItem>
          </div>
        </nav>
        <Footer />
      </div>
    </div>
  );
};

export default App;
