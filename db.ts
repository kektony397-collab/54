
import Dexie, { type Table } from 'dexie';
import type { Ride, Refuel, Settings } from './types';
import { DEFAULT_MILEAGE_KMPL } from './constants';

export class AppDB extends Dexie {
  rides!: Table<Ride>;
  refuels!: Table<Refuel>;
  settings!: Table<Settings>;

  constructor() {
    super('index.db');
    this.version(1).stores({
      rides: '++id, dateStart',
      refuels: '++id, date',
      settings: '++id',
    });
    this.on('populate', this.populate);
  }

  populate = async () => {
    await this.settings.add({
      userAverageKmpl: DEFAULT_MILEAGE_KMPL,
      theme: 'dark'
    });
  }
}

export const db = new AppDB();
