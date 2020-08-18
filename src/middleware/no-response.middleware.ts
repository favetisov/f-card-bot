import { WebhookRequest } from '../models/webhook-request';

export const noResponseMiddleware = (request: WebhookRequest) => {
  if (request.answer) return;
  request.answer = { chat_id: 0, method: 'sendMessage', text: JSON.stringify(request.message) };
};
