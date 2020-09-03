import { RequestMock } from '../test-utils/request.mock';
import { route } from '../router';

describe('ping controller', () => {
  const request = new RequestMock({});

  beforeEach(async () => {
    request.refresh();
  });

  afterAll(async () => {
    await request.cleanAll();
  });

  test('simple ping test', async () => {
    request.message = { id: 1, chat: { id: request.env.CHAT_ID }, text: '/ping' };
    await route(request);
    expect(request.countCalls('sendMessage')).toEqual(1);
    expect(request.requestLog[0].params.text).toBe('pong');
  });
});
