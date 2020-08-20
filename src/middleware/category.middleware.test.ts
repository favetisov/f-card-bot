import { WebhookRequest } from '../models/webhook-request';
import { categoryMiddleware } from './category.middleware';
import { Category } from '../models/category';

const CHAT_ID = 1;

class UserDataMock {
  state = '';
  categories: Category[] = [];
  async update(data) {
    for (const key in data) {
      this[key] = data[key];
    }
  }
  async get(key) {
    return this[key];
  }
}
const userDataMock = new UserDataMock();

test('get empty list', async () => {
  const request = new WebhookRequest();
  request.message = { chat: { id: CHAT_ID }, text: '/list' };
  request.userData = userDataMock;
  await categoryMiddleware(request);
  expect(request).toHaveProperty('answer');
  expect(request.answer).toHaveProperty('method', 'sendMessage');
  expect(request.answer).toHaveProperty('reply_markup');
  expect(request.answer['reply_markup']).toHaveProperty('inline_keyboard');
});

test('start category creation', async () => {
  const request = new WebhookRequest();
  request.callbackQuery = { message: { chat: { id: CHAT_ID } }, data: 'cmd_create_category' };
  request.userData = userDataMock;
  await categoryMiddleware(request);
  expect(request.userData).toHaveProperty('state', 'waiting_for_category_name');
  expect(request).toHaveProperty('answer');
  expect(request.answer).toHaveProperty('method', 'sendMessage');
  expect(request.answer).toHaveProperty('reply_markup');
  expect(request.answer['reply_markup']).toHaveProperty('inline_keyboard');
});

test('cancel category creation', async () => {
  const request = new WebhookRequest();
  request.userData = userDataMock;
  expect(request.userData).toHaveProperty('state', 'waiting_for_category_name');
  request.callbackQuery = { message: { chat: { id: CHAT_ID } }, data: 'cmd_create_category_cancel' };
  await categoryMiddleware(request);
  expect(request.userData).not.toHaveProperty('state', 'waiting_for_category_name');
});

test('create category', async () => {
  const initRequest = new WebhookRequest();
  initRequest.callbackQuery = { message: { chat: { id: CHAT_ID } }, data: 'cmd_create_category' };
  initRequest.userData = userDataMock;
  await categoryMiddleware(initRequest);
  const nameRequest = new WebhookRequest();
  nameRequest.message = { chat: { id: CHAT_ID }, text: 'Test' };
  nameRequest.userData = userDataMock;
  await categoryMiddleware(nameRequest);
  expect(nameRequest.userData).toHaveProperty('categories');
  expect(nameRequest.userData.categories.find((c) => c.name == 'Test')).not.toEqual(null);
});

test('trying to create category with existing name', async () => {
  const initRequest = new WebhookRequest();
  initRequest.callbackQuery = { message: { chat: { id: CHAT_ID } }, data: 'cmd_create_category' };
  initRequest.userData = userDataMock;
  expect(initRequest.userData.categories.length).toEqual(1);
  await categoryMiddleware(initRequest);
  const nameRequest = new WebhookRequest();
  nameRequest.message = { chat: { id: CHAT_ID }, text: 'Test' };
  nameRequest.userData = userDataMock;
  await categoryMiddleware(nameRequest);
  expect(nameRequest.userData.categories.length).toEqual(1);
  expect(nameRequest.answer['text']).toEqual(expect.stringContaining('exists'));
});

test('create category with description', async () => {
  const initRequest = new WebhookRequest();
  initRequest.callbackQuery = { message: { chat: { id: CHAT_ID } }, data: 'cmd_create_category' };
  initRequest.userData = userDataMock;
  await categoryMiddleware(initRequest);
  const nameRequest = new WebhookRequest();
  nameRequest.message = { chat: { id: CHAT_ID }, text: `Second\n Description ` };
  nameRequest.userData = userDataMock;
  await categoryMiddleware(nameRequest);
  expect(nameRequest.userData).toHaveProperty('categories');
  expect(nameRequest.userData.categories.find((c) => c.description === 'Description')).not.toEqual(null);
});

test('list created categories', async () => {
  const request = new WebhookRequest();
  request.message = { chat: { id: CHAT_ID }, text: '/list' };
  request.userData = userDataMock;
  await categoryMiddleware(request);
  expect(request).toHaveProperty('answer');
  expect(request.answer).toHaveProperty('method', 'sendMessage');
  expect(request.answer).toHaveProperty('text');
  const text = request.answer['text'];
  expect(text.includes('Test') && text.includes('Second') && text.includes('Description')).toBe(true);
});
