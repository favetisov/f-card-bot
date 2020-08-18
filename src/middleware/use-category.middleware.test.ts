import { WebhookRequest } from '../models/webhook-request';
import { useCategoryMiddleware } from './use-category.middleware';

test('get empty list', () => {
  const request = new WebhookRequest({ chat: { id: 1 }, text: '/list' });
  useCategoryMiddleware(request);
  expect(request).toHaveProperty('answer');
  expect(request.answer).toHaveProperty('method', 'sendMessage');
  expect(request.answer).toHaveProperty('reply_markup');
  expect(request.answer['reply_markup']).toHaveProperty('inline_keyboard');
});

test('create category', () => {
  const request = new WebhookRequest({ chat: { id: 1 }, text: 'cmd_create_category' });
  // useCategoryMiddleware(request);
  // expect(request).toHaveProperty('answer');
  // expect(request.answer).toHaveProperty('method', 'sendMessage');
  // expect(request.answer).toHaveProperty('reply_markup');
  // expect(request.answer['reply_markup']).toHaveProperty('inline_keyboard');
});
