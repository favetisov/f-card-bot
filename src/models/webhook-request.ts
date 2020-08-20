import { Message } from './message';
import { CallbackQuery } from './callback-query';

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
  chatStates: any;
  message?: Message;
  callbackQuery?: CallbackQuery;
  answer: NullAnswer | SendMessageAnswer;
}