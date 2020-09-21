import { MessageEntity } from 'telegram-typings';

export interface Card {
  id: number;
  question: { text?: string; caption?: string; photoId?: string; videoId?: string; entities?: MessageEntity[] };
  editing: boolean;
  answer: { text?: string; caption?: string; photoId?: string; videoId?: string; entities?: MessageEntity[] } | null;
  attempts: Array<{ timestamp: number; mark: number }>;
}
