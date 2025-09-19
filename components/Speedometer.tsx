
import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useGeolocation } from '../hooks/useGeolocation';
import { useSpeedCalculator } from '../hooks/useSpeedCalculator';
import { db } from '../db';
import type { Ride } from '../types';
import { DEFAULT_MILEAGE_KMPL } from '../constants';

export const Speedometer: React.FC = () => {
    const [isRiding, setIsRiding] = useState(false);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const { position, error, permissionState } = useGeolocation(isRiding);
    const { speedKmh, distanceKm, avgSpeedKmh, resetTrip } = useSpeedCalculator(position);
    
    const settings = useLiveQuery(() => db.settings.get(1));
    const totalFuel = useLiveQuery(async () => {
        const refuels = await db.refuels.toArray();
        const rides = await db.rides.toArray();
        const totalLitres = refuels.reduce((sum, r) => sum + r.litres, 0);
        const totalFuelUsed = rides.reduce((sum, r) => sum + r.fuelUsed, 0);
        return totalLitres - totalFuelUsed;
    }, []);

    const estimatedRange = settings && totalFuel ? totalFuel * settings.userAverageKmpl : 0;

    const startRide = () => {
        resetTrip();
        setStartTime(new Date());
        setIsRiding(true);
    };

    const stopRide = async () => {
        setIsRiding(false);
        if (distanceKm > 0.01 && startTime) { // Only save meaningful rides
            const userAverage = settings?.userAverageKmpl || DEFAULT_MILEAGE_KMPL;
            const newRide: Ride = {
                dateStart: startTime,
                dateEnd: new Date(),
                distanceKm: parseFloat(distanceKm.toFixed(2)),
                avgSpeedKmH: parseFloat(avgSpeedKmh.toFixed(1)),
                fuelUsed: distanceKm / userAverage,
            };
            try {
                await db.rides.add(newRide);
            } catch (err) {
                console.error("Failed to save ride:", err);
            }
        }
        setStartTime(null);
    };

    const renderPermissionRequest = () => (
        <div className="text-center p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <h3 className="font-bold text-lg mb-2">Location Permission Required</h3>
            <p className="text-sm">This app needs access to your location to function as a speedometer. Please grant permission when prompted.</p>
            {permissionState === 'denied' && (
                <p className="mt-2 text-red-500 dark:text-red-400 font-semibold">Permission was denied. You need to enable it in your browser settings.</p>
            )}
        </div>
    );

    return (
        <div className="flex flex-col items-center justify-between flex-grow h-full text-center">
            <div className="w-full">
                {permissionState !== 'granted' && !isRiding && renderPermissionRequest()}
                {error && <div className="text-red-500 dark:text-red-400 p-2 bg-red-100 dark:bg-red-900 rounded-md">{error}</div>}
            </div>

            <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
                <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" className="stroke-current text-gray-200 dark:text-gray-700" strokeWidth="5" fill="none" />
                    <circle cx="50" cy="50" r="45" className="stroke-current text-light-accent dark:text-dark-accent" strokeWidth="5" fill="none"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (Math.min(speedKmh, 150) / 150) * 283}
                        transform="rotate(-90 50 50)"
                        style={{ transition: 'stroke-dashoffset 0.3s' }}
                    />
                </svg>
                <div className="z-10">
                    <div className="text-7xl sm:text-8xl font-black tracking-tighter">
                        {Math.round(speedKmh)}
                    </div>
                    <div className="text-lg font-semibold text-gray-500 dark:text-gray-400 -mt-2">
                        km/h
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm my-8">
                <div className="bg-light-card dark:bg-dark-card p-4 rounded-lg shadow">
                    <div className="text-gray-500 dark:text-gray-400 text-sm">Trip Distance</div>
                    <div className="text-2xl font-bold">{distanceKm.toFixed(2)} <span className="text-lg">km</span></div>
                </div>
                <div className="bg-light-card dark:bg-dark-card p-4 rounded-lg shadow">
                    <div className="text-gray-500 dark:text-gray-400 text-sm">Est. Range</div>
                    <div className="text-2xl font-bold">{estimatedRange.toFixed(0)} <span className="text-lg">km</span></div>
                </div>
            </div>

            <div className="w-full max-w-sm">
                {!isRiding ? (
                    <button
                        onClick={startRide}
                        disabled={permissionState === 'denied'}
                        className="w-full py-4 text-2xl font-bold text-white bg-green-500 rounded-lg shadow-lg hover:bg-green-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        START RIDE
                    </button>
                ) : (
                    <button
                        onClick={stopRide}
                        className="w-full py-4 text-2xl font-bold text-white bg-red-500 rounded-lg shadow-lg hover:bg-red-600 transition"
                    >
                        STOP RIDE
                    </button>
                )}
            </div>
        </div>
    );
};
