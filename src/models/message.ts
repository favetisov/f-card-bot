import { Chat } from './chat';

export interface Message {
  id: number;
  chat: Chat;
  text?: string;
  caption?: string;
  photo?: Array<{ file_id: string }>;
  video?: { file_id: string };
}
