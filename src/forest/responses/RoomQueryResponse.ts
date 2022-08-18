import RoomCreateResponse from './RoomCreateResponse';

export interface Participant {
  avatar: string;
  failed_at: Date | null;
  is_host: boolean;
  name: string;
  user_id: number;
}

export interface RoomQueryResponse extends RoomCreateResponse {
  participants: Participant[];
}
