import { RequestMock } from '../test-utils/request.mock';
import { route } from '../router';
import { STATE } from '../tools/states';
import { COMMANDS } from '../tools/commands';
import { LANGUAGE } from '../tools/language';

describe('start controller', () => {
  const request = new RequestMock({});
  request.user.update({ tutorialCompleted: false });

  beforeEach(async () => {
    request.refresh();
  });

  afterAll(async () => {
    // await request.cleanAll();
  });

  test('starting bot', async () => {
    request.message = { id: 1, chat: { id: request.env.CHAT_ID }, text: '/start' };
    await route(request);
    /** "select language" should be sent */
    expect(request.countCalls('sendMessage')).toEqual(1);
    expect(request.requestLog[0].params.text).toContain('language');
    expect(request.user.data.state).toBe(STATE.waitingForWelcomeMessage);
  });

  test('selecting language in welcome mode', async () => {
    const selectLanguageId = request.requestLog[0].result.result.message_id;
    request.callbackQuery = {
      id: 1, // sadly there is no way to emulate callback query so this will cause error in the console
      message: { message_id: selectLanguageId, chat: { id: request.env.CHAT_ID } },
      data: COMMANDS.selectLanguage + LANGUAGE.ru,
    };
    await route(request);
    /** welcome message should be sent */
    expect(request.countCalls('sendMessage')).toEqual(1);
    /** "select language" message should be deleted */
    expect(request.countCalls('deleteMessage')).toEqual(1);
    expect(request.user.data.language).toBe(LANGUAGE.ru);
  });

  test('create category in welcome mode', async () => {
    request.callbackQuery = {
      id: 1, // sadly there is no way to emulate callback query so this will cause error in the console
      message: { message_id: 1, chat: { id: request.env.CHAT_ID } },
      data: COMMANDS.createCategory,
    };
    await route(request);
    request.refresh();
    request.message = { id: 1, chat: { id: request.env.CHAT_ID }, text: 'Test' };
    await route(request);

    /** sending and pinning message with current category */
    expect(request.countCalls('sendMessage')).toEqual(1);
  });
});
