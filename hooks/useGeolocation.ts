
import { useState, useEffect, useRef } from 'react';
import type { PositionData } from '../types';

export const useGeolocation = (enabled: boolean) => {
  const [position, setPosition] = useState<PositionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt');

  const watchId = useRef<number | null>(null);

  useEffect(() => {
    // Query for permission status on mount and listen for changes.
    let isMounted = true;
    const checkPermission = async () => {
      if (!('permissions' in navigator)) return;
      try {
        const status = await navigator.permissions.query({ name: 'geolocation' });
        if (isMounted) {
          setPermissionState(status.state);
          status.onchange = () => {
            if (isMounted) setPermissionState(status.state);
          };
        }
      } catch (e) {
        console.error("Permission API not supported", e);
      }
    };
    checkPermission();
    
    return () => { isMounted = false; }
  }, []); // Run only once on mount

  useEffect(() => {
    if (!enabled) {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      return;
    }
    
    // watchPosition will automatically trigger a permission prompt if needed.
    const onSuccess = (pos: GeolocationPosition) => {
        const { latitude, longitude, accuracy, speed } = pos.coords;
        setPosition({
            coords: { latitude, longitude, accuracy, speed },
            timestamp: pos.timestamp
        });
        setError(null);
    };

    const onError = (err: GeolocationPositionError) => {
        if (err.code === err.PERMISSION_DENIED) {
            setError("Geolocation permission denied. Please enable it in your browser settings.");
        } else {
            setError(`Geolocation error: ${err.message} (Code: ${err.code})`);
        }
    };

    watchId.current = navigator.geolocation.watchPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
    });

    return () => {
        if (watchId.current !== null) {
            navigator.geolocation.clearWatch(watchId.current);
        }
    };
  }, [enabled]);

  return { position, error, permissionState };
};
