import { RequestMock } from '../test-utils/request.mock';
import { route } from '../router';
import { STATE } from '../tools/states';

describe('card controller', () => {
  const request = new RequestMock({});

  beforeEach(async () => {
    request.refresh();
  });

  afterAll(async () => {
    // await request.cleanAll();
  });

  test('create card when no category exists', async () => {
    request.message = { id: 1, chat: { id: request.env.CHAT_ID }, text: '/add' };
    await route(request);
    /** "no categories" message should be sent */
    expect(request.countCalls('sendMessage')).toEqual(1);
    expect(request.user.data.state).not.toBe(STATE.waitingForCardQuestion);
  });

  test('create card', async () => {
    request.user.update({
      categories: [{ name: 'Test', selected: true, cards: [] }],
    });
    request.message = { id: 1, chat: { id: request.env.CHAT_ID }, text: '/add' };
    await route(request);
    /** "provide question" message should be sent */
    expect(request.countCalls('sendMessage')).toEqual(1);
    expect(request.user.data.state).toBe(STATE.waitingForCardQuestion);

    request.refresh();
    request.message = { id: 1, chat: { id: request.env.CHAT_ID }, text: 'Test question' };
    await route(request);

    /** "card created" message should be sent */
    expect(request.countCalls('sendMessage')).toEqual(1);
    expect(request.user.data.state).toBe(STATE.waitingForCardAnswer);
    expect(request.user.data.categories.find((c) => c.selected).cards.filter((c) => !c.published)).toHaveLength(1);
    /** "enter question" message should be deleted */
    expect(request.countCalls('deleteMessage')).toEqual(1);

    request.refresh();
    request.message = { id: 1, chat: { id: request.env.CHAT_ID }, text: 'Test answer' };
    await route(request);

    /** "answer saved" message should be sent */
    expect(request.countCalls('sendMessage')).toEqual(1);
    expect(request.user.data.state).toBe(STATE.ready);
    expect(request.user.data.categories.find((c) => c.selected).cards).toHaveLength(1);
    expect(request.user.data.categories.find((c) => c.selected).cards.filter((c) => !c.published)).toHaveLength(0);

    /** "card created" message should be deleted */
    expect(request.countCalls('sendMessage')).toEqual(1);

    /** "enter answer" message should be deleted */
    expect(request.countCalls('deleteMessage')).toEqual(1);
    expect(request.user.data.hangingMessages).toHaveLength(0);
  });
});
