import { Context } from '@src/context';
import { routes } from '../routes';
import { STATE } from '@src/enums/state';
import { CALLBACK_COMMAND } from '@src/enums/callback-command';

type Handler = (context: Context) => Promise<void>;

export interface BaseRoute {
  handler: Handler;
}

export interface MessageRoute extends BaseRoute {
  onMessage: string | RegExp;
  state?: STATE;
}

export interface CommandRoute extends BaseRoute {
  onCommand: CALLBACK_COMMAND;
}

export const getHandler = (context: Context): Handler | undefined => {
  const route = routes.find((r) => {
    if ('onMessage' in r) {
      if (!context.update.message?.text) return;
      if (r.state && context.session.data.state !== r.state) return;
      if (r.onMessage instanceof RegExp) {
        return r.onMessage.test(context.update.message.text);
      } else {
        return context.update.message.text === r.onMessage;
      }
    } else if ('onCommand' in r) {
      if (!context.update.callbackData) return;
      return context.update.callbackData.command === r.onCommand;
    } else {
      return; // other methods not supported yet
    }
  });

  return route?.handler;
};
