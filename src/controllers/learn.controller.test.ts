import { RequestMock } from '../test-utils/request.mock';
import { route } from '../router';
import { COMMANDS } from '../tools/commands';

describe('learn controller', () => {
  const request = new RequestMock({});
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

  beforeEach(async () => {
    request.refresh();
  });

  afterAll(async () => {
    // await request.cleanAll();
  });

  test('start learning', async () => {
    request.message = { id: 1, chat: { id: request.env.CHAT_ID }, text: '/go' };
    await route(request);
    expect(request.countCalls('sendMessage')).toEqual(1);
  });

  test('skipping card', async () => {
    const cardMessageId = request.requestLog[0].result.result.message_id;
    request.callbackQuery = {
      id: 1, // sadly there is no way to emulate callback query so this will cause error in the console
      message: { message_id: cardMessageId, chat: { id: request.env.CHAT_ID } },
      data: COMMANDS.skipCard,
    };
    await route(request);
    expect(request.countCalls('sendMessage')).toEqual(1);
  });

  test('show answer', async () => {
    const cardMessageId = request.requestLog[1].result.result.message_id;
    request.user.data.categories[0].cards = [request.user.data.categories[0].cards[1]]; // removing card without answer
    request.callbackQuery = {
      id: 1, // sadly there is no way to emulate callback query so this will cause error in the console
      message: { message_id: cardMessageId, chat: { id: request.env.CHAT_ID } },
      data: COMMANDS.skipCard,
    };
    await route(request);
    request.refresh();

    request.callbackQuery = {
      id: 1, // sadly there is no way to emulate callback query so this will cause error in the console
      message: { message_id: cardMessageId, chat: { id: request.env.CHAT_ID } },
      data: COMMANDS.showAnswer,
    };
    await route(request);
    expect(request.countCalls('sendMessage')).toEqual(1);
  });

  test('marking answer', async () => {
    const answerMessageId = request.requestLog[2].result.result.message_id;
    request.callbackQuery = {
      id: 1, // sadly there is no way to emulate callback query so this will cause error in the console
      message: { message_id: answerMessageId, chat: { id: request.env.CHAT_ID } },
      data: COMMANDS.markAnswer + '-1',
    };

    await route(request);
    expect(request.countCalls('sendMessage')).toEqual(1);
  });
});
