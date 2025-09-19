
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Refuel } from '../types';

export const FuelTracker: React.FC = () => {
    const [litres, setLitres] = useState('');
    const [price, setPrice] = useState('');
    const [odometer, setOdometer] = useState('');
    const [error, setError] = useState('');
    
    // Fetch refuels sorted by most recent date
    const refuelHistory = useLiveQuery(() => db.refuels.orderBy('date').reverse().toArray(), []);

    const handleAddRefuel = async (e: React.FormEvent) => {
        e.preventDefault();
        const litresNum = parseFloat(litres);
        const priceNum = parseFloat(price);

        if (isNaN(litresNum) || isNaN(priceNum) || litresNum <= 0 || priceNum <= 0) {
            setError('Please enter valid positive numbers for litres and price.');
            return;
        }
        setError('');

        const newRefuel: Refuel = {
            date: new Date(),
            litres: litresNum,
            pricePerLitre: priceNum,
            totalCost: litresNum * priceNum,
            odometer: odometer ? parseInt(odometer, 10) : undefined,
        };

        try {
            await db.refuels.add(newRefuel);
            setLitres('');
            setPrice('');
            setOdometer('');
        } catch (err) {
            console.error('Failed to add refuel:', err);
            setError('Could not save refuel entry.');
        }
    };
    
    return (
        <div className="p-2">
            <h2 className="text-2xl font-bold mb-4 text-center text-light-accent dark:text-dark-accent">Fuel Log</h2>
            
            <form onSubmit={handleAddRefuel} className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-lg font-semibold mb-4">Add New Refuel</h3>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="litres" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Litres</label>
                        <input
                            type="number"
                            id="litres"
                            value={litres}
                            onChange={(e) => setLitres(e.target.value)}
                            className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-light-accent focus:border-light-accent sm:text-sm p-2"
                            placeholder="e.g., 5.5"
                            step="0.01"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price per Litre (₹)</label>
                        <input
                            type="number"
                            id="price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-light-accent focus:border-light-accent sm:text-sm p-2"
                            placeholder="e.g., 102.45"
                            step="0.01"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="odometer" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Odometer (km, optional)</label>
                        <input
                            type="number"
                            id="odometer"
                            value={odometer}
                            onChange={(e) => setOdometer(e.target.value)}
                            className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-light-accent focus:border-light-accent sm:text-sm p-2"
                            placeholder="e.g., 12345"
                        />
                    </div>
                </div>
                <button type="submit" className="mt-6 w-full bg-light-accent hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                    Add Refuel
                </button>
            </form>

            <h3 className="text-lg font-semibold mb-4">Refuel History</h3>
            <div className="space-y-3">
                {refuelHistory && refuelHistory.length > 0 ? (
                    refuelHistory.map(refuel => (
                        <div key={refuel.id} className="bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-sm flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{refuel.litres.toFixed(2)} L @ ₹{refuel.pricePerLitre.toFixed(2)}/L</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{refuel.date.toLocaleString()}</p>
                            </div>
                            <p className="text-lg font-bold">₹{refuel.totalCost.toFixed(2)}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400">No refuel history yet.</p>
                )}
            </div>
        </div>
    );
};
