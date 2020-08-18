import { Message } from './message';

export interface Answer {
  chat_id: number;
}

export interface NullAnswer extends Answer {}

export interface SendMessageAnswer extends Answer {
  method: 'sendMessage';
  text: string;
  reply_markup?: any;
}

export class WebhookRequest {
  answer: NullAnswer | SendMessageAnswer;
  constructor(public message: Message) {}
}
