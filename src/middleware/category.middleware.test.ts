import { WebhookRequest } from '../models/webhook-request';
import { categoryMiddleware } from './category.middleware';
import { Category } from '../models/category';

const CHAT_ID = 1;

class UserDataMock {
  data = {
    state: '',
    categories: <Category[]>[],
  };

  async update(data) {
    for (const key in data) {
      this.data[key] = data[key];
    }
  }
  async get() {
    return {
      data: () => this.data,
    };
  }
}
const userDataMock = new UserDataMock();

const botRequestMock = (log: any) => async (method, params) => {
  log.push({ method, params });
  return { ok: true, result: { message_id: 1 } };
};

test('get empty list', async () => {
  const request = new WebhookRequest();
  request.message = { chat: { id: CHAT_ID }, text: '/list' };
  request.userData = userDataMock;
  await categoryMiddleware(request);
  expect(request).toHaveProperty('answer');
  expect(request).toHaveProperty('answer');
  expect(request.answer).toHaveProperty('method', 'sendMessage');
  expect(request.answer).toHaveProperty('reply_markup');
  expect(request.answer['reply_markup']).toHaveProperty('inline_keyboard');
});

test('start category creation', async () => {
  const request = new WebhookRequest();
  request.callbackQuery = { id: 1, message: { id: 1, chat: { id: CHAT_ID } }, data: 'cmd_create_category' };
  const botCallsLog: any = [];
  request.botRequest = botRequestMock(botCallsLog);
  request.userData = userDataMock;
  await categoryMiddleware(request);
  /** removing message with create button */
  expect(botCallsLog.filter((l) => l.method == 'deleteMessage')).toHaveLength(1);
  /** sending "provide category name" message */
  expect(botCallsLog.filter((l) => l.method == 'sendMessage')).toHaveLength(1);
  /** mark query as executed */
  expect(botCallsLog.filter((l) => l.method == 'answerCallbackQuery')).toHaveLength(1);
  expect(request.userData.data).toHaveProperty('state', 'waiting_for_category_name');
  expect(request.userData.data.hangingMessages.filter((m) => m.type === 'provide_category')).toHaveLength(1);
});

test('cancel category creation', async () => {
  const request = new WebhookRequest();
  request.userData = userDataMock;
  const botCallsLog: any = [];
  request.botRequest = botRequestMock(botCallsLog);
  expect(request.userData.data).toHaveProperty('state', 'waiting_for_category_name');
  request.callbackQuery = { id: 1, message: { chat: { id: CHAT_ID } }, data: 'cmd_create_category_cancel' };
  await categoryMiddleware(request);
  /** deleting 'provide category name' message and reseting state */
  expect(botCallsLog.filter((l) => l.method == 'deleteMessage')).toHaveLength(1);
  expect(request.userData.data).not.toHaveProperty('state', 'waiting_for_category_name');
  expect(request.userData.data.hangingMessages.filter((m) => m.type === 'provide_category')).toHaveLength(0);
  /** mark query as executed */
  expect(botCallsLog.filter((l) => l.method == 'answerCallbackQuery')).toHaveLength(1);
});

test('create category', async () => {
  const initRequest = new WebhookRequest();
  initRequest.callbackQuery = { id: 1, message: { chat: { id: CHAT_ID } }, data: 'cmd_create_category' };
  initRequest.userData = userDataMock;
  initRequest.botRequest = botRequestMock([]);
  await categoryMiddleware(initRequest);
  const nameRequest = new WebhookRequest();
  nameRequest.message = { chat: { id: CHAT_ID }, text: 'Test' };
  nameRequest.userData = userDataMock;
  const botCallsLog: any = [];
  nameRequest.botRequest = botRequestMock(botCallsLog);
  await categoryMiddleware(nameRequest);
  expect(nameRequest.userData.data).toHaveProperty('categories');
  expect(nameRequest.userData.data.categories.find((c) => c.name == 'Test')).not.toEqual(null);
  expect(nameRequest.userData.data).not.toHaveProperty('state', 'waiting_for_category_name');
  expect(nameRequest.userData.data.provideCategoryNameMessageId).toBe(undefined);
  /** deleting "provide category name" message */
  expect(botCallsLog.filter((l) => l.method == 'deleteMessage')).toHaveLength(1);
  expect(nameRequest.userData.data.hangingMessages.filter((m) => m.type === 'provide_category')).toHaveLength(0);
  /** sending and pinning message with current category */
  expect(botCallsLog.filter((l) => l.method == 'sendMessage')).toHaveLength(1);
  expect(botCallsLog.filter((l) => l.method == 'pinChatMessage')).toHaveLength(1);
});

test('trying to create category with existing name', async () => {
  const initRequest = new WebhookRequest();
  initRequest.callbackQuery = { id: 1, message: { chat: { id: CHAT_ID } }, data: 'cmd_create_category' };
  initRequest.userData = userDataMock;
  initRequest.botRequest = botRequestMock([]);
  expect(initRequest.userData.data.categories.length).toEqual(1);
  await categoryMiddleware(initRequest);
  const nameRequest = new WebhookRequest();
  nameRequest.message = { chat: { id: CHAT_ID }, text: 'Test' };
  nameRequest.userData = userDataMock;
  const botCallsLog: any = [];
  nameRequest.botRequest = botRequestMock(botCallsLog);
  await categoryMiddleware(nameRequest);
  expect(nameRequest.userData.data.categories.length).toEqual(1);

  /** sending "category exists" message and adding it's id to userData */
  expect(botCallsLog.filter((l) => l.method == 'sendMessage')).toHaveLength(1);
  expect(nameRequest.userData.data.hangingMessages.filter((m) => m.type === 'name_exists')).toHaveLength(1);

  /** provide category message should stay */
  expect(nameRequest.userData.data.hangingMessages.filter((m) => m.type === 'provide_category')).toHaveLength(1);

  const successRequest = new WebhookRequest();
  successRequest.message = { chat: { id: CHAT_ID }, text: 'New Name' };
  successRequest.userData = userDataMock;
  const succBotCallsLog: any = [];
  successRequest.botRequest = botRequestMock(succBotCallsLog);
  await categoryMiddleware(successRequest);
  /** hanging messages should be deleted */
  expect(successRequest.userData.data.hangingMessages.filter((m) => m.type === 'name_exists')).toHaveLength(0);
  expect(successRequest.userData.data.hangingMessages.filter((m) => m.type === 'provide_category')).toHaveLength(0);
  expect(succBotCallsLog.filter((l) => l.method == 'deleteMessage')).toHaveLength(2);
});

test('create category with description', async () => {
  const initRequest = new WebhookRequest();
  initRequest.callbackQuery = { id: 1, message: { chat: { id: CHAT_ID } }, data: 'cmd_create_category' };
  initRequest.userData = userDataMock;
  initRequest.botRequest = botRequestMock([]);
  await categoryMiddleware(initRequest);
  const nameRequest = new WebhookRequest();
  nameRequest.message = { chat: { id: CHAT_ID }, text: `Second\n Description ` };
  nameRequest.userData = userDataMock;
  nameRequest.botRequest = botRequestMock([]);
  await categoryMiddleware(nameRequest);
  expect(nameRequest.userData.data).toHaveProperty('categories');
  expect(nameRequest.userData.data.categories.find((c) => c.description === 'Description')).not.toEqual(null);
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
