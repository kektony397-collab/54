
import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { DEFAULT_MILEAGE_KMPL } from '../constants';

export const useTheme = () => {
  const settings = useLiveQuery(() => db.settings.get(1));
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Set theme based on DB settings, default to dark if not found.
    const initialTheme = settings?.theme || 'dark';
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, [settings]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    
    // Persist the new theme to the database
    const currentSettings = await db.settings.get(1);
    if (currentSettings) {
        await db.settings.update(1, { theme: newTheme });
    } else {
        // This case is unlikely if populate works, but handles it just in case.
        await db.settings.add({ id: 1, theme: newTheme, userAverageKmpl: DEFAULT_MILEAGE_KMPL });
    }
  };

  return { theme, toggleTheme };
};
