
export interface Ride {
  id?: number;
  dateStart: Date;
  dateEnd: Date;
  distanceKm: number;
  avgSpeedKmH: number;
  fuelUsed: number; // Renamed from fuelUsedL for clarity
}

export interface Refuel {
  id?: number;
  date: Date;
  litres: number;
  pricePerLitre: number;
  totalCost: number;
  odometer?: number; // Renamed from odometerKm for clarity
}

export interface Settings {
    id?: number;
    userAverageKmpl: number;
    theme: 'light' | 'dark';
}

export type AppView = 'dashboard' | 'fuel' | 'history' | 'settings';

export interface PositionData {
    coords: {
        latitude: number;
        longitude: number;
        accuracy: number;
        speed: number | null;
    };
    timestamp: number;
}
