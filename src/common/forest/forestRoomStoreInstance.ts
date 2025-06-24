// forestRoomStoreInstance.ts
// Singleton instance for the forest room store abstraction

import ForestRoomJsonStore from './ForestRoomJsonStore';
import { ForestRoomStore } from './ForestRoomStore';
import Room from '../../forest/Room';

// You can swap this out for another backend later
const forestRoomStore: ForestRoomStore<any> = new ForestRoomJsonStore<ReturnType<Room['toJSON']>>();

export default forestRoomStore;
