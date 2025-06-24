// ForestRoomStore.ts
// Abstraction for forest room state persistence

export interface ForestRoomStore<T> {
  loadRooms(): Promise<T[]>;
  saveRooms(rooms: T[]): Promise<void>;
}
