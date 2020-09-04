import { RequestMock } from '../test-utils/request.mock';
import { route } from '../router';
import { STATE } from '../tools/states';
import { MSG_TYPE } from '../tools/msg-type';
import { COMMANDS } from '../tools/commands';

describe('category controller', () => {
  const request = new RequestMock({});

  beforeEach(async () => {
    request.refresh();
  });

  afterAll(async () => {
    // await request.cleanAll();
  });

  test('empty categories list', async () => {
    request.message = { id: 1, chat: { id: request.env.CHAT_ID }, text: '/list' };
    await route(request);
    /** sending "no categories" message */
    expect(request.countCalls('sendMessage')).toEqual(1);
  });

  test('start category creation', async () => {
    /** getting previous message with empty list and button */
    const listMessageId = request.requestLog[0].result.result.message_id;
    request.callbackQuery = {
      id: 1, // sadly there is no way to emulate callback query so this will cause error in the console
      message: { message_id: listMessageId, chat: { id: request.env.CHAT_ID } },
      data: COMMANDS.createCategory,
    };
    await route(request);
    /** sending "provide category name" message */
    expect(request.countCalls('sendMessage')).toEqual(1);
    /** mark query as executed */
    expect(request.countCalls('answerCallbackQuery')).toEqual(1);
    expect(request.user.data).toHaveProperty('state', STATE.waitingForCategoryName);
    expect(request.user.data.hangingMessages.filter((m) => m.type === MSG_TYPE.provideCategory)).toHaveLength(1);
  });

  test('cancel category creation', async () => {
    expect(request.user.data).toHaveProperty('state', STATE.waitingForCategoryName);
    request.callbackQuery = {
      id: 1, // sadly there is no way to emulate callback query so this will cause error in the console
      message: { message_id: 1, chat: { id: request.env.CHAT_ID } },
      data: COMMANDS.cancelCategoryCreation,
    };
    await route(request);

    /** deleting 'provide category name' message and resetting state */
    expect(request.countCalls('deleteMessage')).toEqual(1);
    expect(request.user.data).not.toHaveProperty('state', STATE.waitingForCategoryName);
    expect(request.user.data.hangingMessages.filter((m) => m.type === MSG_TYPE.provideCategory)).toHaveLength(0);
    /** mark query as executed */
    expect(request.countCalls('answerCallbackQuery')).toEqual(1);
  });

  test('create category', async () => {
    request.callbackQuery = {
      id: 1, // sadly there is no way to emulate callback query so this will cause error in the console
      message: { message_id: 1, chat: { id: request.env.CHAT_ID } },
      data: COMMANDS.createCategory,
    };
    await route(request);
    request.refresh();
    request.message = { id: 1, chat: { id: request.env.CHAT_ID }, text: 'Test' };
    await route(request);

    /** checking that category is created */
    expect(request.user.data.categories.some((c) => c.name == 'Test')).not.toBe(false);
    expect(request.user.data).not.toHaveProperty('state', STATE.waitingForCategoryName);

    /** previous messages are removed */
    expect(request.countCalls('deleteMessage')).toEqual(1);
    expect(request.user.data.hangingMessages.some((m) => m.type === MSG_TYPE.provideCategory)).toBe(false);

    /** sending and pinning message with current category */
    expect(request.countCalls('sendMessage')).toEqual(1);
    // expect(request.countCalls('pinChatMessage')).toEqual(1);
  });

  test('trying to create category with existing name', async () => {
    request.callbackQuery = {
      id: 1, // sadly there is no way to emulate callback query so this will cause error in the console
      message: { message_id: 1, chat: { id: request.env.CHAT_ID } },
      data: COMMANDS.createCategory,
    };
    await route(request);

    request.refresh();
    request.message = { id: 1, chat: { id: request.env.CHAT_ID }, text: 'Test' };
    await route(request);
    expect(request.user.data.categories.length).toEqual(1);

    /** sending "category exists" message and adding it's id to userData */
    expect(request.countCalls('sendMessage')).toEqual(1);
    expect(request.user.data.hangingMessages.filter((m) => m.type === MSG_TYPE.categoryNameExists)).toHaveLength(1);
    /** provide category message should stay */
    expect(request.user.data.hangingMessages.filter((m) => m.type === MSG_TYPE.provideCategory)).toHaveLength(1);

    request.refresh();
    request.message = { id: 1, chat: { id: request.env.CHAT_ID }, text: 'New Name' };
    await route(request);

    /** hanging messages should be deleted */
    expect(request.user.data.hangingMessages.filter((m) => m.type === MSG_TYPE.categoryNameExists)).toHaveLength(0);
    expect(request.user.data.hangingMessages.filter((m) => m.type === MSG_TYPE.provideCategory)).toHaveLength(0);
    expect(request.countCalls('deleteMessage')).toEqual(2);
  });

  test('create category with description', async () => {
    request.callbackQuery = {
      id: 1, // sadly there is no way to emulate callback query so this will cause error in the console
      message: { message_id: 1, chat: { id: request.env.CHAT_ID } },
      data: COMMANDS.createCategory,
    };
    await route(request);

    request.refresh();
    request.message = { id: 1, chat: { id: request.env.CHAT_ID }, text: `Second\n Description ` };
    await route(request);

    /** checking that category is created */
    expect(request.user.data).toHaveProperty('categories');
    expect(request.user.data.categories.find((c) => c.description === 'Description')).not.toEqual(null);
  });

  test('list created categories', async () => {
    request.message = { id: 1, chat: { id: request.env.CHAT_ID }, text: '/list' };
    await route(request);

    /** message is sent and containing created categories */
    expect(request.countCalls('sendMessage')).toEqual(1);
    expect(request.user.data.categories.filter((c) => c.selected)).toHaveLength(1);
    const text = request.requestLog[request.requestLog.length - 1].params.text;
    expect(request.user.data.categories.filter((c) => c.selected)).toHaveLength(1);
    expect(request.user.data.categories.find((c) => c.selected)?.name).toBe('Second');
  });

  test('select category', async () => {
    request.callbackQuery = {
      id: 1,
      message: { message_id: 1, chat: { id: request.env.CHAT_ID } },
      data: COMMANDS.selectCategory + 'Test',
    };
    await route(request);
    /** mark query as executed */
    expect(request.countCalls('answerCallbackQuery')).toEqual(1);
    /** "category selected" message should be sent and pinned" */
    expect(request.countCalls('sendMessage')).toEqual(1);
    // expect(request.countCalls('pinChatMessage')).toEqual(1);

    /** desired category is selected (others are not) */
    expect(request.user.data.categories.find((c) => c.selected)?.name).toBe('Test');
    expect(request.user.data.categories.filter((c) => c.selected)).toHaveLength(1);
  });

  test('get current state', async () => {
    request.user.data.categories = [
      {
        name: 'Test',
        description: 'Test category',
        selected: true,
        cards: [
          { id: 1, published: true, question: { text: 'First question' }, attempts: [] },
          {
            id: 1,
            published: true,
            question: { text: 'Second question' },
            answer: { text: 'Second answer ' },
            attempts: [],
          },
        ],
      },
    ];
    request.message = { id: 1, chat: { id: request.env.CHAT_ID }, text: '/info' };
    await route(request);
    /** sending info message */
    expect(request.countCalls('sendMessage')).toEqual(1);
  });

  test('removing category (but cancelling confirm)', async () => {
    let sentMessages = request.requestLog.filter((m) => m.method === 'sendMessage');
    const infoMessageId = sentMessages[sentMessages.length - 1].result.result.message_id;
    request.callbackQuery = {
      id: 1, // sadly there is no way to emulate callback query so this will cause error in the console
      message: { message_id: infoMessageId, chat: { id: request.env.CHAT_ID } },
      data: COMMANDS.deleteCategory,
    };
    await route(request);
    /** confirm message should be sent */
    expect(request.countCalls('sendMessage')).toEqual(1);
    /** category info message should be deleted */
    expect(request.countCalls('deleteMessage')).toEqual(1);

    sentMessages = request.requestLog.filter((m) => m.method === 'sendMessage');
    const confirmMessageId = sentMessages[sentMessages.length - 1].result.result.message_id;
    request.refresh();
    request.callbackQuery = {
      id: 1, // sadly there is no way to emulate callback query so this will cause error in the console
      message: { message_id: confirmMessageId, chat: { id: request.env.CHAT_ID } },
      data: COMMANDS.deleteCategoryCancel,
    };
    await route(request);
    /** confirm message should be deleted */
    expect(request.countCalls('deleteMessage')).toEqual(1);
    expect(request.user.data.hangingMessages.some((m) => m.type === MSG_TYPE.categoryRemovalConfirm)).toBe(true);
    /** category not removed */
    expect(request.user.data.categories.some((c) => c.name === 'Test')).toBe(true);
  });

  test('removing category (for good)', async () => {
    request.message = { id: 1, chat: { id: request.env.CHAT_ID }, text: '/list' };
    await route(request);
    request.refresh();

    let sentMessages = request.requestLog.filter((m) => m.method === 'sendMessage');
    const infoMessageId = sentMessages[sentMessages.length - 1].result.result.message_id;
    request.callbackQuery = {
      id: 1, // sadly there is no way to emulate callback query so this will cause error in the console
      message: { message_id: infoMessageId, chat: { id: request.env.CHAT_ID } },
      data: COMMANDS.deleteCategory,
    };
    await route(request);
    /** confirm message should be sent */
    expect(request.countCalls('sendMessage')).toEqual(1);
    /** category info message should be deleted */
    expect(request.countCalls('deleteMessage')).toEqual(1);

    sentMessages = request.requestLog.filter((m) => m.method === 'sendMessage');
    const confirmMessageId = sentMessages[sentMessages.length - 1].result.result.message_id;
    request.refresh();
    request.callbackQuery = {
      id: 1, // sadly there is no way to emulate callback query so this will cause error in the console
      message: { message_id: confirmMessageId, chat: { id: request.env.CHAT_ID } },
      data: COMMANDS.deleteCategoryConfirm,
    };
    await route(request);
    /** confirm message should be deleted */
    expect(request.countCalls('deleteMessage')).toEqual(1);
    expect(request.user.data.hangingMessages.some((m) => m.type === MSG_TYPE.categoryRemovalConfirm)).toBe(false);
    /** category removed */
    expect(request.user.data.categories.some((c) => c.name === 'Test')).toBe(false);
  });
});
