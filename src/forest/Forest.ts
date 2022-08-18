import dateReviver from '../common/dateReviver';
import BaseForest from './BaseForest';
import RoomCreateResponse from './responses/RoomCreateResponse';
import Room from './Room';

export default class Forest extends BaseForest {
  async createRoom(duration: number | undefined): Promise<Room | null> {
    const request = await this.fetch(
      '/rooms',
      {
        room_type: 'chartered',
        target_duration: duration ?? 1500,
        tree_type: 0,
      },
    );

    if (request.status === 201) {
      const roomDataString = await request.text();
      const roomData = JSON.parse(roomDataString, dateReviver) as RoomCreateResponse;

      // TODO: runtime checking

      return new Room(
        this.token,
        roomData,
      );
    }

    return null;
  }
}
