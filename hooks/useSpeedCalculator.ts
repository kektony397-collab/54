
import { useState, useEffect, useRef, useCallback } from 'react';
import type { PositionData } from '../types';

// Haversine formula to calculate distance between two lat/lon points in meters
const haversineDistance = (pos1: PositionData, pos2: PositionData): number => {
    const R = 6371e3; // metres
    const φ1 = pos1.coords.latitude * Math.PI / 180;
    const φ2 = pos2.coords.latitude * Math.PI / 180;
    const Δφ = (pos2.coords.latitude - pos1.coords.latitude) * Math.PI / 180;
    const Δλ = (pos2.coords.longitude - pos1.coords.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
};

// Exponential smoothing factor. Lower value = more smoothing.
const SMOOTHING_FACTOR = 0.3;

export const useSpeedCalculator = (position: PositionData | null) => {
    const [speedKmh, setSpeedKmh] = useState(0);
    const [distanceKm, setDistanceKm] = useState(0);
    const [avgSpeedKmh, setAvgSpeedKmh] = useState(0);

    const lastPositionRef = useRef<PositionData | null>(null);
    const smoothedSpeedRef = useRef(0);
    const tripDataRef = useRef({
        totalDistance: 0,
        startTime: 0,
    });

    const resetTrip = useCallback(() => {
        setDistanceKm(0);
        setAvgSpeedKmh(0);
        tripDataRef.current = { totalDistance: 0, startTime: Date.now() };
        lastPositionRef.current = null;
    }, []);

    useEffect(() => {
        if (!position) return;

        if (lastPositionRef.current) {
            const lastPos = lastPositionRef.current;
            const distanceMeters = haversineDistance(lastPos, position);
            
            // Only update if moved a meaningful distance to avoid drift while stationary
            if (distanceMeters > position.coords.accuracy) {
                 const timeSeconds = (position.timestamp - lastPos.timestamp) / 1000;
                
                if (timeSeconds > 0) {
                    const rawSpeedMps = distanceMeters / timeSeconds;
                    const rawSpeedKmh = rawSpeedMps * 3.6;
                    
                    // Apply exponential smoothing
                    smoothedSpeedRef.current = (SMOOTHING_FACTOR * rawSpeedKmh) + ((1 - SMOOTHING_FACTOR) * smoothedSpeedRef.current);
                    setSpeedKmh(smoothedSpeedRef.current);
                    
                    // Update trip data
                    tripDataRef.current.totalDistance += distanceMeters;
                    setDistanceKm(tripDataRef.current.totalDistance / 1000);
                }
            }
        }

        // Update last position regardless of movement for next calculation
        lastPositionRef.current = position;

        // Update average speed
        const tripDurationSeconds = (Date.now() - tripDataRef.current.startTime) / 1000;
        if (tripDurationSeconds > 0) {
            const avgMps = tripDataRef.current.totalDistance / tripDurationSeconds;
            setAvgSpeedKmh(avgMps * 3.6);
        }
    }, [position]);

    return { speedKmh, distanceKm, avgSpeedKmh, resetTrip };
};
