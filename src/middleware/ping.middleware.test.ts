import { pingMiddleware } from './ping.middleware';
import { WebhookRequest } from '../models/webhook-request';

test('simple ping test', () => {
  const request = new WebhookRequest();
  request.message = { chat: { id: 1 }, text: '/ping' };
  pingMiddleware(request);
  expect(request).toHaveProperty('answer');
  expect(request.answer).toHaveProperty('method', 'sendMessage');
  expect(request.answer).toHaveProperty('text', 'pong');
});

test('not a ping message', () => {
  const request = new WebhookRequest();
  request.message = { chat: { id: 1 }, text: 'not a ping' };
  pingMiddleware(request);
  expect(request).not.toHaveProperty('answer');
});
