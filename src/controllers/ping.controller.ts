import { Request } from '../models/request';

export const PingController = {
  ping: async (request: Request) => {
    await request.botRequest('sendMessage', {
      text: 'pong',
      chat_id: request.chatId,
    });
  },
};
