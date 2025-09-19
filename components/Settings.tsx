import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Settings as SettingsType } from '../types';
import { DEFAULT_MILEAGE_KMPL } from '../constants';

interface SettingsProps {
    toggleTheme: () => void;
    currentTheme: 'light' | 'dark';
}

export const Settings: React.FC<SettingsProps> = ({ toggleTheme, currentTheme }) => {
    const settingsData = useLiveQuery(() => db.settings.get(1));
    const [averageKmpl, setAverageKmpl] = useState<string>(DEFAULT_MILEAGE_KMPL.toString());
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        if (settingsData) {
            setAverageKmpl(settingsData.userAverageKmpl.toString());
        }
    }, [settingsData]);

    const handleSaveSettings = async () => {
        const kmpl = parseFloat(averageKmpl);
        if (isNaN(kmpl) || kmpl <= 0) {
            setSaveMessage('Please enter a valid mileage.');
            return;
        }

        const currentSettings = await db.settings.get(1);
        const settingsToSave: Partial<SettingsType> = { userAverageKmpl: kmpl };
        
        try {
            if (currentSettings) {
                await db.settings.update(1, settingsToSave);
            } else {
                // FIX: Construct the object directly to satisfy the `Settings` type, which requires `userAverageKmpl`.
                // Spreading a `Partial<SettingsType>` caused a type error because `userAverageKmpl` was inferred as optional.
                await db.settings.add({ id: 1, userAverageKmpl: kmpl, theme: currentTheme });
            }
            setSaveMessage('Settings saved successfully!');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (err) {
            console.error("Failed to save settings:", err);
            setSaveMessage('Error saving settings.');
        }
    };
    
    return (
        <div className="p-2">
            <h2 className="text-2xl font-bold mb-6 text-center text-light-accent dark:text-dark-accent">Settings</h2>
            <div className="space-y-6 max-w-md mx-auto">
                <div className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-md">
                    <label htmlFor="averageKmpl" className="block text-lg font-semibold mb-2">My Bike's Average (km/L)</label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Set your bike's average mileage to get more accurate range and fuel usage estimates.
                    </p>
                    <input
                        type="number"
                        id="averageKmpl"
                        value={averageKmpl}
                        onChange={(e) => setAverageKmpl(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-light-accent focus:border-light-accent p-2"
                        placeholder="e.g., 44.0"
                        step="0.1"
                    />
                </div>

                <div className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-md flex justify-between items-center">
                    <div className="flex-grow">
                        <p className="text-lg font-semibold">Theme</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark mode.</p>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors bg-gray-200 dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-accent"
                    >
                        <span className="sr-only">Toggle theme</span>
                        <span
                            className={`${
                                currentTheme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                            } inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
                        />
                    </button>
                </div>

                <div className="text-center">
                    <button
                        onClick={handleSaveSettings}
                        className="bg-light-accent hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
                    >
                        Save Settings
                    </button>
                    {saveMessage && <p className="mt-4 text-green-600 dark:text-green-400">{saveMessage}</p>}
                </div>
            </div>
        </div>
    );
};