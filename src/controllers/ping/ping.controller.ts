import { PingMessages } from './ping.messages';
import { Context } from '@src/context';
import { send } from '@src/bot';

export const PingController = {
  ping: async (context: Context) => {
    await send(context, PingMessages.ping(context));
  },
};
