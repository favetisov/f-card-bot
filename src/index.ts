import { FsSession } from './session/fs-session';
import { Context } from './context';
import { LANGUAGE } from './enums/language';
import { STATE } from './enums/state';
import { getHandler } from './tools/router';
import { Message } from 'telegram-typings';
import { entitiesToMd, escapeMd } from './tools/escape-md';
import { botCall, edit } from './bot';
import { Category } from './models/category';
import { PARSE_MODE } from './enums/parse-mode';

const session = new FsSession<{ language: LANGUAGE; state: STATE; lastMessage?: Message; categories: Category[] }>(
  __dirname + '/../users.json',
  { language: LANGUAGE.unknown, state: STATE.notInitialized, categories: [] },
);
const context = new Context(session);

export const onmessage = async (req, res) => {
  await context.setUpdate(req.body);

  const contextHandler = getHandler(context);
  if (!contextHandler) {
    if (context.update.callbackData) {
      await botCall('answerCallbackQuery', {
        callback_query_id: context.update.callback_query?.id,
        text: 'No handler found for this command',
        show_alert: true,
      });
    }
    return res.send('No handler found, this update will be ignored');
  }

  if (context.update.callbackData) {
    const updateMessage = (message: Message, clickReport: string) => {
      return edit({
        chat_id: message.chat.id,
        message_id: message.message_id,
        text: entitiesToMd(message.text, message.entities) + escapeMd(`\n\n---------------\n`) + clickReport,
        parse_mode: PARSE_MODE.markdown2,
      });
    };
    await Promise.all([
      updateMessage(context.update.callbackData.message, context.update.callbackData.clickReport),
      contextHandler(context),
    ]);
    await botCall('answerCallbackQuery', {
      callback_query_id: context.update.callback_query?.id,
    });
  } else {
    const removeButtons = () => {
      if (!context.session.data.lastMessage) return;
      return edit({
        chat_id: context.update.chatId,
        message_id: context.session.data.lastMessage.message_id,
        text: entitiesToMd(context.session.data.lastMessage.text) + ' ',
        parse_mode: PARSE_MODE.markdown2,
      });
    };
    await Promise.all([removeButtons(), contextHandler(context)]);
  }
  res.send('ok');
};
