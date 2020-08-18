import { WebhookRequest } from '../models/webhook-request';

export const pingMiddleware = (request: WebhookRequest) => {
  if (request.answer) return;
  if (request.message.text !== '/ping') return;
  request.answer = {
    method: 'sendMessage',
    chat_id: request.message.chat.id,
    text: 'pong',
  };
};
