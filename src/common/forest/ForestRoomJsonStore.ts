/* eslint-disable class-methods-use-this */
// ForestRoomJsonStore.ts
// JSON file backend for ForestRoomStore

import { promises as fs } from 'fs';
import path from 'path';
import { ForestRoomStore } from './ForestRoomStore';

const DATA_PATH = path.join(process.cwd(), 'forest-rooms.json');

export default class ForestRoomJsonStore<T> implements ForestRoomStore<T> {
  async loadRooms(): Promise<T[]> {
    try {
      const data = await fs.readFile(DATA_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }

  async saveRooms(rooms: T[]): Promise<void> {
    await fs.writeFile(DATA_PATH, JSON.stringify(rooms, null, 2), 'utf-8');
  }
}
