import { Chat } from './chat';

export interface CallbackQuery {
  id: number;
  message: { message_id: number; chat: Chat };
  data: string;
}
