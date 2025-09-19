
import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { HistoryIcon } from './icons/Icons';

export const History: React.FC = () => {
    const rideHistory = useLiveQuery(() => db.rides.orderBy('dateStart').reverse().toArray(), []);

    return (
        <div className="p-2">
            <h2 className="text-2xl font-bold mb-4 text-center text-light-accent dark:text-dark-accent">Ride History</h2>

            <div className="space-y-4">
                {rideHistory && rideHistory.length > 0 ? (
                    rideHistory.map(ride => {
                        const durationMinutes = (ride.dateEnd.getTime() - ride.dateStart.getTime()) / 60000;
                        return (
                            <div key={ride.id} className="bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-md">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-bold text-lg">{ride.distanceKm} km</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{ride.dateStart.toLocaleDateString()}</p>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Duration</p>
                                        <p className="font-semibold">{Math.round(durationMinutes)} min</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Avg. Speed</p>
                                        <p className="font-semibold">{ride.avgSpeedKmH} km/h</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Fuel Used</p>
                                        <p className="font-semibold">{ride.fuelUsed.toFixed(2)} L</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        <HistoryIcon className="mx-auto w-12 h-12 mb-4" />
                        <h3 className="font-semibold text-lg">No Ride History</h3>
                        <p>Start a ride from the dashboard to see your history here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
