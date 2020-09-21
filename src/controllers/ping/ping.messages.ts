import { Context } from '@src/context';
import { localize } from '@src/tools/localize';
import { PingI18n } from './ping.i18n';
import { PARSE_MODE } from '@src/enums/parse-mode';

export const PingMessages = {
  ping: (context: Context) => ({
    chat_id: context.update.chatId,
    text: localize(context, PingI18n.pong),
    parse_mode: PARSE_MODE.markdown2,
  }),
};
