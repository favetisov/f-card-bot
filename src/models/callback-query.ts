import { Message } from './message';

export interface CallbackQuery {
  message: Message;
  data: string;
}
