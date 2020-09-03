import { RequestMock } from '../test-utils/request.mock';
import { route } from '../router';
import { STATE } from '../tools/states';
import { COMMANDS } from '../tools/commands';
import { LANGUAGE } from '../tools/language';

describe('language controller', () => {
  const request = new RequestMock({});

  beforeEach(async () => {
    request.refresh();
  });

  afterAll(async () => {
    await request.cleanAll();
  });

  test('asking for language', async () => {
    request.message = { id: 1, chat: { id: request.env.CHAT_ID }, text: '/lang' };
    await route(request);
    /** "select language" should be sent */
    expect(request.countCalls('sendMessage')).toEqual(1);
    expect(request.requestLog[0].params.text).toContain('language');
  });

  test('selecting language in casual mode', async () => {
    const selectLanguageId = request.requestLog[0].result.result.message_id;
    request.callbackQuery = {
      id: 1, // sadly there is no way to emulate callback query so this will cause error in the console
      message: { message_id: selectLanguageId, chat: { id: request.env.CHAT_ID } },
      data: COMMANDS.selectLanguage + LANGUAGE.en,
    };
    await route(request);
    /** "language selected" message should be sent */
    expect(request.countCalls('sendMessage')).toEqual(1);
    /** "select language" message should be deleted */
    expect(request.countCalls('deleteMessage')).toEqual(1);
    expect(request.user.data.state).toBe(STATE.ready);
    expect(request.user.data.language).toBe(LANGUAGE.en);

    /** commands list should be updated */
    expect(request.countCalls('setMyCommands')).toEqual(1);
  });
});
