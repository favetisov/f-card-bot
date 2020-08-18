import { WebhookRequest } from '../models/webhook-request';

export const useCategoryMiddleware = (request: WebhookRequest) => {
  if (request.answer) return;
  if (!request.message?.text) return;
  if (request.message.text.indexOf('/list') !== 0) return;

  const categories = [];

  if (!categories.length) {
    request.answer = {
      method: 'sendMessage',
      chat_id: request.message.chat.id,
      text: "You don't have any category yet. Click `create` to add category",
      reply_markup: {
        inline_keyboard: [[{ text: 'create new category', callback_data: 'cmd_create_category' }]],
      },
    };
  } else {
  }
};
