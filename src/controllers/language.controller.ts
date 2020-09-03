import { Request } from '../models/request';
import { emoji } from '../emoji';
import { COMMANDS } from '../tools/commands';
import { LANGUAGE } from '../tools/language';
import { i18n } from '../tools/i18n';
import { StartController } from './start.controller';

export const LanguageController = {
  sendLanguageMessage: async (request: Request) => {
    const text = `Interface language / Язык интерфейса`;
    const response = await request.botRequest('sendMessage', {
      chat_id: request.chatId,
      text,
      reply_markup: {
        inline_keyboard: [
          [{ text: emoji.ru + ' Русский', callback_data: COMMANDS.selectLanguage + LANGUAGE.ru }],
          [{ text: emoji.uk + ' English', callback_data: COMMANDS.selectLanguage + LANGUAGE.en }],
        ],
      },
    });
  },

  selectLanguage: async (request: Request) => {
    const language = request.callbackQuery.data.split(COMMANDS.selectLanguage)[1];
    await request.user.update({ language });

    await request.botRequest('setMyCommands', {
      commands: [
        { command: '/list', description: i18n.list_command_description[language] },
        { command: '/add', description: i18n.add_command_description[language] },
        { command: '/go', description: i18n.go_command_description[language] },
        { command: '/lang', description: 'Select Language / Выбрать язык' },
      ],
    });

    await request.botRequest('deleteMessage', {
      chat_id: request.chatId,
      message_id: request.callbackQuery.message.message_id,
    });

    if (request.user.data.tutorialCompleted) {
      const text = i18n.language_selected[language];
      await request.botRequest('sendMessage', {
        chat_id: request.chatId,
        text,
        parse_mode: 'MarkdownV2',
        disable_web_page_preview: true,
      });
    } else {
      await StartController.afterLanguageSelected(request);
    }
  },
};
