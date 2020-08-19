import { WebhookRequest } from '../models/webhook-request';
import { categoryMiddleware } from './category.middleware';
import { load, save } from '../services/storage.service';

const CHAT_ID = 1;

beforeAll(() => {
  save(CHAT_ID, { state: '', categories: [] });
});

test('get empty list', () => {
  const request = new WebhookRequest();
  request.message = { chat: { id: CHAT_ID }, text: '/list' };
  categoryMiddleware(request);
  expect(request).toHaveProperty('answer');
  expect(request.answer).toHaveProperty('method', 'sendMessage');
  expect(request.answer).toHaveProperty('reply_markup');
  expect(request.answer['reply_markup']).toHaveProperty('inline_keyboard');
});

test('start category creation', () => {
  const request = new WebhookRequest();
  request.callbackQuery = { message: { chat: { id: CHAT_ID } }, data: 'cmd_create_category' };
  categoryMiddleware(request);
  expect(load(CHAT_ID)).toHaveProperty('state', 'waiting_for_category_name');
  expect(request).toHaveProperty('answer');
  expect(request.answer).toHaveProperty('method', 'sendMessage');
  expect(request.answer).toHaveProperty('reply_markup');
  expect(request.answer['reply_markup']).toHaveProperty('inline_keyboard');
});

test('cancel category creation', () => {
  expect(load(CHAT_ID)).toHaveProperty('state', 'waiting_for_category_name');
  const request = new WebhookRequest();
  request.callbackQuery = { message: { chat: { id: CHAT_ID } }, data: 'cmd_create_category_cancel' };
  categoryMiddleware(request);
  expect(load(CHAT_ID)).not.toHaveProperty('state', 'waiting_for_category_name');
});

test('create category', () => {
  const initRequest = new WebhookRequest();
  initRequest.callbackQuery = { message: { chat: { id: CHAT_ID } }, data: 'cmd_create_category' };
  categoryMiddleware(initRequest);
  const nameRequest = new WebhookRequest();
  nameRequest.message = { chat: { id: CHAT_ID }, text: 'Test' };
  categoryMiddleware(nameRequest);
  const userData = load(CHAT_ID);
  expect(userData).toHaveProperty('categories');
  expect(userData.categories.find((c) => c.name == 'Test')).not.toEqual(null);
});

test('trying to create category with existing name', () => {
  expect(load(CHAT_ID).categories.length).toEqual(1);
  const initRequest = new WebhookRequest();
  initRequest.callbackQuery = { message: { chat: { id: CHAT_ID } }, data: 'cmd_create_category' };
  categoryMiddleware(initRequest);
  const nameRequest = new WebhookRequest();
  nameRequest.message = { chat: { id: CHAT_ID }, text: 'Test' };
  categoryMiddleware(nameRequest);
  expect(load(CHAT_ID).categories.length).toEqual(1);
  expect(nameRequest.answer['text']).toEqual(expect.stringContaining('exists'));
});

test('create category with description', () => {
  const initRequest = new WebhookRequest();
  initRequest.callbackQuery = { message: { chat: { id: CHAT_ID } }, data: 'cmd_create_category' };
  categoryMiddleware(initRequest);
  const nameRequest = new WebhookRequest();
  nameRequest.message = { chat: { id: CHAT_ID }, text: `Second\n Description ` };
  categoryMiddleware(nameRequest);
  const userData = load(CHAT_ID);
  expect(userData).toHaveProperty('categories');
  expect(userData.categories.find((c) => c.description === 'Description')).not.toEqual(null);
});

test('list created categories', () => {
  const request = new WebhookRequest();
  request.message = { chat: { id: CHAT_ID }, text: '/list' };
  categoryMiddleware(request);
  expect(request).toHaveProperty('answer');
  expect(request.answer).toHaveProperty('method', 'sendMessage');
  expect(request.answer).toHaveProperty('text');
  const text = request.answer['text'];
  expect(text.includes('Test') && text.includes('Second') && text.includes('Description')).toBe(true);
});
