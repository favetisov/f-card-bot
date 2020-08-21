import { Message } from './message';

export interface CallbackQuery {
  id: number;
  message: Message;
  data: string;
}
