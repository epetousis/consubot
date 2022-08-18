import BaseForest from './BaseForest';
import RoomCreateResponse from './responses/RoomCreateResponse';
import { Participant, RoomQueryResponse } from './responses/RoomQueryResponse';

function secondsToTime(e: number) {
  const h = Math.floor(e / 3600).toString().padStart(2, '0');
  const m = Math.floor((e % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(e % 60).toString().padStart(2, '0');

  return `${h}:${m}:${s}`;
}

/** Represents a room in the Forest API. */
export default class Room extends BaseForest {
  /** The data that this room was created with. Used to serialise this room to JSON. */
  private roomCreationData: RoomCreateResponse;

  /** The internal database identifier for the room. */
  roomId: number;

  /** The length of the room's timer in seconds. */
  targetDuration: number;

  /** The token used to join the room. Also known as the "room code." */
  roomToken: string;

  /** Determines whether the tree is alive or not. */
  isSuccess: boolean;

  /** The time when the room was started. */
  startTime?: Date;

  /** The time when the room ended. */
  endTime?: Date;

  /** A list of the users in this room. */
  participants?: Participant[];

  /**
   * Returns the target duration in minutes.
   */
  get targetDurationInMinutes() {
    return Math.floor(this.targetDuration / 60);
  }

  /**
   * Returns the seconds remaining for this room's timer, or `-1` if the room hasn't started yet.
   */
  get secondsRemaining() {
    if (!this.startTime) return -1;

    const startDate = new Date(this.startTime);
    const secondsElapsed = ((new Date()).getTime() - startDate.getTime()) / 1000;
    return this.targetDuration - secondsElapsed;
  }

  /**
   * Returns the time remaining for this room in human-readable hh:mm:ss format.
   */
  get humanReadableTimeRemaining() {
    return secondsToTime(this.secondsRemaining);
  }

  /**
   * Returns whether the tree has grown or not.
   */
  get treeHasGrown() {
    if (!this.endTime) return false;

    return Date.now() > this.endTime.getTime();
  }

  constructor(
    token: string,
    roomData: RoomCreateResponse,
  ) {
    super(token);

    this.roomCreationData = roomData;
    this.roomId = roomData.id;
    this.targetDuration = roomData.target_duration;
    this.roomToken = roomData.token;
    this.isSuccess = roomData.is_success;
    this.startTime = roomData.start_time ?? undefined;
    this.endTime = roomData.end_time ?? undefined;
  }

  /** Updates the settings for this room. */
  async updateRoom(options: Record<string, string | number>): Promise<boolean> {
    const request = await this.fetch(
      `/rooms/${this.roomId}`,
      options,
    );
    return request.status === 200;
  }

  /**
   * Get details for this room, update itself and return true if they have changed.
   * This method should be called once after creation, and regularly after a room has been started.
   * @returns `true` if the room details have changed or `false` if not.
   */
  async queryRoom(): Promise<boolean> {
    const request = await this.fetch(
      `/rooms/${this.roomId}?detail=true`,
      null,
      'get',
    );

    // Forest's API returns 401 if the room is no longer valid.
    if (request.status === 401) return false;

    const data = await request.json() as RoomQueryResponse;

    this.roomId = data.id;
    this.targetDuration = data.target_duration;
    this.roomToken = data.token;
    this.participants = data.participants;
    this.endTime = data.end_time ?? undefined;

    // If 304, room has not changed since last query.
    return request.status === 200;
  }

  /** Leaves the room. */
  async leaveRoom(): Promise<boolean> {
    const request = await this.fetch(
      `/rooms/${this.roomId}/leave`,
      {},
      'put',
    );
    return request.status === 200;
  }

  /** Plants the tree for everyone. */
  async startTree(): Promise<boolean> {
    const request = await this.fetch(
      `/rooms/${this.roomId}/start`,
      {},
      'put',
    );
    // If response code === 423, not enough people are in the room.
    return request.status === 200;
  }

  /** Kills the tree for everyone and leaves a dead tree in everyone's forest. */
  async endTree(): Promise<boolean> {
    const request = await this.fetch(
      `/rooms/${this.roomId}/chop`,
      {
        end_time: (new Date()).toISOString(),
      },
      'put',
    );
    return request.status === 200;
  }

  /** Returns the room creation data for this room. */
  toJSON() {
    return {
      type: 'room',
      data: this.roomCreationData,
    };
  }
}
