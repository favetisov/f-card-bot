import { Request } from '../models/request';
import { STATE } from '../tools/states';
import { LanguageController } from './language.controller';
import { i18n } from '../tools/i18n';
import { COMMANDS } from '../tools/commands';

export const StartController = {
  onStartMessage: async (request: Request) => {
    await request.user.update({ state: STATE.waitingForWelcomeMessage });
    return LanguageController.sendLanguageMessage(request);
  },

  afterLanguageSelected: async (request: Request) => {
    await request.botRequest('sendMessage', {
      text: i18n.how_it_works[request.user.data.language],
      chat_id: request.chatId,
      parse_mode: 'MarkdownV2',
      reply_markup: {
        inline_keyboard: [
          [{ text: i18n.create_new_category[request.user.data.language], callback_data: COMMANDS.createCategory }],
        ],
      },
    });
  },

  afterCategoryCreated: async (request: Request) => {
    await request.botRequest('sendMessage', {
      text: i18n.first_category_created[request.user.data.language],
      chat_id: request.chatId,
    });
  },
};
