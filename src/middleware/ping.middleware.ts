import { WebhookRequest } from '../models/webhook-request';

export const pingMiddleware = async (request: WebhookRequest) => {
  if (request.answer) return;
  if (request.message?.text !== '/ping') return;

  const response = await request.botRequest('sendMessage', {
    chat_id: request.message.chat.id,
    text: 'pong!',
  });

  request.answer = {
    method: 'sendMessage',
    chat_id: request.message.chat.id,
    text: JSON.stringify(response),
  };
};
