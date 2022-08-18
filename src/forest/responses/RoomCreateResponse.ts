export default interface RoomCreateResponse {
  // chopper_user_id: null;
  created_at: Date;
  end_time: Date | null;
  host_user_id: number;
  id: number;
  // intl_id: null;
  is_success: boolean;
  notification_scheduled_at: Date | null;
  participants_count: number;
  room_type: string;
  scheduled_start_time: Date | null;
  start_time: Date | null;
  success_rate_threshold: number;
  target_duration: number;
  token: string;
  tree_type: number;
  updated_at: Date;
}
