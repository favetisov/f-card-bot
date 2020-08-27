import { categoryMiddleware } from './category.middleware';
import { RequestMock } from '../test-utils/request.mock';

const request = new RequestMock();

beforeEach(async () => {
  request.refresh();
});

afterAll(async () => {
  await request.cleanAll();
});

test('get empty list', async () => {
  request.message = { chat: { id: request.env.CHAT_ID }, text: '/list' };
  await categoryMiddleware(request);
  /** sending "no categories" message */
  expect(request.countCalls('sendMessage')).toEqual(1);
});

test('start category creation', async () => {
  /** getting previous message with empty list and button */
  const listMessageId = request.requestLog[0].result.result.message_id;
  request.callbackQuery = {
    id: 1, // sadly there is no way to emulate callback query so this will cause error in the console
    message: { message_id: listMessageId, chat: { id: request.env.CHAT_ID } },
    data: 'cmd_create_category',
  };
  await categoryMiddleware(request);
  /** removing message with create button */
  expect(request.countCalls('deleteMessage')).toEqual(1);
  /** sending "provide category name" message */
  expect(request.countCalls('sendMessage')).toEqual(1);
  /** mark query as executed */
  expect(request.countCalls('answerCallbackQuery')).toEqual(1);
  expect(request.userData.data).toHaveProperty('state', 'waiting_for_category_name');
  expect(request.userData.data.hangingMessages.filter((m) => m.type === 'provide_category')).toHaveLength(1);
});

test('cancel category creation', async () => {
  expect(request.userData.data).toHaveProperty('state', 'waiting_for_category_name');
  request.callbackQuery = {
    id: 1, // sadly there is no way to emulate callback query so this will cause error in the console
    message: { message_id: 1, chat: { id: request.env.CHAT_ID } },
    data: 'cmd_create_category_cancel',
  };
  await categoryMiddleware(request);

  /** deleting 'provide category name' message and reseting state */
  expect(request.countCalls('deleteMessage')).toEqual(1);
  expect(request.userData.data).not.toHaveProperty('state', 'waiting_for_category_name');
  expect(request.userData.data.hangingMessages.filter((m) => m.type === 'provide_category')).toHaveLength(0);
  /** mark query as executed */
  expect(request.countCalls('answerCallbackQuery')).toEqual(1);
});

test('create category', async () => {
  request.callbackQuery = {
    id: 1, // sadly there is no way to emulate callback query so this will cause error in the console
    message: { message_id: 1, chat: { id: request.env.CHAT_ID } },
    data: 'cmd_create_category',
  };
  await categoryMiddleware(request);
  request.refresh();
  request.message = { chat: { id: request.env.CHAT_ID }, text: 'Test' };
  await categoryMiddleware(request);

  /** checking that category is created */
  expect(request.userData.data).toHaveProperty('categories');
  expect(request.userData.data.categories.find((c) => c.name == 'Test')).not.toEqual(null);
  expect(request.userData.data).not.toHaveProperty('state', 'waiting_for_category_name');

  /** previous messages are removed */
  expect(request.countCalls('deleteMessage')).toEqual(1);
  expect(request.userData.data.hangingMessages.filter((m) => m.type === 'provide_category')).toHaveLength(0);

  /** sending and pinning message with current category */
  expect(request.countCalls('sendMessage')).toEqual(1);
  expect(request.countCalls('pinChatMessage')).toEqual(1);
});

test('trying to create category with existing name', async () => {
  request.callbackQuery = {
    id: 1, // sadly there is no way to emulate callback query so this will cause error in the console
    message: { message_id: 1, chat: { id: request.env.CHAT_ID } },
    data: 'cmd_create_category',
  };
  await categoryMiddleware(request);

  request.refresh();
  request.message = { chat: { id: request.env.CHAT_ID }, text: 'Test' };
  await categoryMiddleware(request);
  expect(request.userData.data.categories.length).toEqual(1);

  /** sending "category exists" message and adding it's id to userData */
  expect(request.countCalls('sendMessage')).toEqual(1);
  expect(request.userData.data.hangingMessages.filter((m) => m.type === 'name_exists')).toHaveLength(1);
  /** provide category message should stay */
  expect(request.userData.data.hangingMessages.filter((m) => m.type === 'provide_category')).toHaveLength(1);

  request.refresh();
  request.message = { chat: { id: request.env.CHAT_ID }, text: 'New Name' };
  await categoryMiddleware(request);

  /** hanging messages should be deleted */
  expect(request.userData.data.hangingMessages.filter((m) => m.type === 'name_exists')).toHaveLength(0);
  expect(request.userData.data.hangingMessages.filter((m) => m.type === 'provide_category')).toHaveLength(0);
  expect(request.countCalls('deleteMessage')).toEqual(2);
});

test('create category with description', async () => {
  request.callbackQuery = {
    id: 1, // sadly there is no way to emulate callback query so this will cause error in the console
    message: { message_id: 1, chat: { id: request.env.CHAT_ID } },
    data: 'cmd_create_category',
  };
  await categoryMiddleware(request);

  request.refresh();
  request.message = { chat: { id: request.env.CHAT_ID }, text: `Second\n Description ` };
  await categoryMiddleware(request);

  /** checking that category is created */
  expect(request.userData.data).toHaveProperty('categories');
  expect(request.userData.data.categories.find((c) => c.description === 'Description')).not.toEqual(null);
});

test('list created categories', async () => {
  request.message = { chat: { id: request.env.CHAT_ID }, text: '/list' };
  await categoryMiddleware(request);

  /** message is sent and containing created categories */
  expect(request.countCalls('sendMessage')).toEqual(1);
  expect(request.userData.data.categories.filter((c) => c.selected)).toHaveLength(1);
  const text = request.requestLog[request.requestLog.length - 1].params.text;
  expect(text.includes('Test') && text.includes('Second') && text.includes('Description')).toBe(true);
  expect(request.userData.data.categories.filter((c) => c.selected)).toHaveLength(1);
  expect(request.userData.data.categories.find((c) => c.selected)?.name).toBe('Second');
});

test('select category', async () => {
  request.callbackQuery = {
    id: 1,
    message: { message_id: 1, chat: { id: request.env.CHAT_ID } },
    data: 'cmd_select_category_Test',
  };
  await categoryMiddleware(request);
  /** mark query as executed */
  expect(request.countCalls('answerCallbackQuery')).toEqual(1);
  /** "category selected" message should be sent and pinned" */
  expect(request.countCalls('sendMessage')).toEqual(1);
  expect(request.countCalls('pinChatMessage')).toEqual(1);

  /** desired category is selected (others are not) */
  expect(request.userData.data.categories.find((c) => c.selected)?.name).toBe('Test');
  expect(request.userData.data.categories.filter((c) => c.selected)).toHaveLength(1);
});
