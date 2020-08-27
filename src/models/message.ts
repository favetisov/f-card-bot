import { Chat } from './chat';

export interface Message {
  id?: number;
  chat: Chat;
  text?: string;
}
