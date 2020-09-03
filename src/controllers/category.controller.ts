import { Request } from '../models/request';
import { COMMANDS } from '../tools/commands';
import { i18n } from '../tools/i18n';
import { STATE } from '../tools/states';
import { MSG_TYPE } from '../tools/msg-type';
import { StartController } from './start.controller';

export const CategoryController = {
  listCategories: async (request: Request) => {
    const categories = request.user.data.categories;

    if (!categories.length) {
      await request.botRequest('sendMessage', {
        chat_id: request.chatId,
        text: i18n.you_dont_have_categories[request.user.data.language],
        reply_markup: {
          inline_keyboard: [
            [{ text: i18n.create_new_category[request.user.data.language], callback_data: COMMANDS.createCategory }],
          ],
        },
        parse_mode: 'MarkdownV2',
      });
    } else {
      let text = i18n.you_have_categories[request.user.data.language];
      await request.botRequest('sendMessage', {
        chat_id: request.chatId,
        text,
        parse_mode: 'MarkdownV2',
        reply_markup: {
          inline_keyboard: [
            ...categories.map((c) => [{ text: c.name, callback_data: COMMANDS.selectCategory + c.name }]),
            [{ text: i18n.create_new_category[request.user.data.language], callback_data: COMMANDS.createCategory }],
          ],
        },
      });
    }
  },

  onCreateCategory: async (request) => {
    await request.botRequest('answerCallbackQuery', {
      callback_query_id: request.callbackQuery.id,
    });

    const { result } = await request.botRequest('sendMessage', {
      chat_id: request.chatId,
      text: i18n.provide_category_name[request.user.data.language],
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: i18n.cancel_category_creation[request.user.data.language],
              callback_data: COMMANDS.cancelCategoryCreation,
            },
          ],
        ],
      },
    });

    return request.user.update({
      state: STATE.waitingForCategoryName,
      hangingMessages: [
        ...(request.user.data.hangingMessages || []),
        { id: result.message_id, type: MSG_TYPE.provideCategory },
      ],
    });
  },

  cancelCategoryCreation: async (request) => {
    const hangingMessages = request.user.data.hangingMessages;
    for (const msg of hangingMessages.filter((t) =>
      [MSG_TYPE.categoryNameExists, MSG_TYPE.provideCategory].includes(t.type),
    )) {
      await request.botRequest('deleteMessage', {
        chat_id: request.chatId,
        message_id: msg.id,
      });
    }

    await request.botRequest('answerCallbackQuery', {
      callback_query_id: request.callbackQuery.id,
    });

    await request.user.update({
      state: STATE.ready,
      hangingMessages: (request.user.data.hangingMessages || []).filter(
        (t) => ![MSG_TYPE.categoryNameExists, MSG_TYPE.provideCategory].includes(t.type),
      ),
    });
  },

  createCategory: async (request) => {
    const categoryName = request.message.text.split(`\n`)[0].trim();
    let categoryDescription = '';
    if (request.message.text.indexOf('\n') !== -1) {
      categoryDescription = request.message.text.slice(request.message.text.indexOf('\n')).trim();
    }
    const categories = request.user.data.categories;
    if (categories.find((c) => c.name == categoryName)) {
      const { result } = await request.botRequest('sendMessage', {
        chat_id: request.chatId,
        text: i18n.category_name_exists[request.user.data.language],
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: i18n.cancel_category_creation[request.user.data.language],
                callback_data: COMMANDS.cancelCategoryCreation,
              },
            ],
          ],
        },
      });
      await request.user.update({
        hangingMessages: [
          ...(request.user.data.hangingMessages || []),
          { id: result.message_id, type: MSG_TYPE.categoryNameExists },
        ],
      });
    } else {
      categories.forEach((c) => (c.selected = false));
      categories.push({ name: categoryName, description: categoryDescription, cards: [], selected: true });
      const hangingMessages = request.user.data.hangingMessages || [];
      for (const msg of hangingMessages.filter((t) =>
        [MSG_TYPE.categoryNameExists, MSG_TYPE.provideCategory].includes(t.type),
      )) {
        await request.botRequest('deleteMessage', {
          chat_id: request.chatId,
          message_id: msg.id,
        });
      }

      await request.user.update({
        categories,
        state: '',
        hangingMessages: hangingMessages.filter(
          (t) => ![MSG_TYPE.categoryNameExists, MSG_TYPE.provideCategory].includes(t.type),
        ),
      });
      if (request.user.tutorialCompleted) {
        await CategoryController.getCurrentState(request);
      } else {
        await StartController.afterCategoryCreated(request);
      }
    }
  },

  sendCategorySelectedMessage: async (request) => {
    const categories = request.user.data.categories;
    const { result } = await request.botRequest('sendMessage', {
      chat_id: request.chatId,
      text: i18n.current_category_is[request.user.data.language](categories.find((c) => c.selected).name),
      parse_mode: 'MarkdownV2',
    });

    return request.botRequest('pinChatMessage', {
      chat_id: request.chatId,
      message_id: result.message_id,
      disable_notification: true,
    });
  },

  selectCategory: async (request) => {
    const categories = request.user.data.categories;
    const categoryName = request.callbackQuery.data.split(COMMANDS.selectCategory)[1];
    if (!categories.some((c) => c.name == categoryName)) return;

    categories.forEach((c) => (c.selected = c.name === categoryName));
    await request.user.update({ categories });
    await request.botRequest('answerCallbackQuery', { callback_query_id: request.callbackQuery.id });
    // return CategoryController.sendCategorySelectedMessage(request);
    return CategoryController.getCurrentState(request);
  },

  getCurrentState: async (request) => {
    const category = request.user.data.categories.find((c) => c.selected);
    const cardsLevels = category.cards.map((c) => {
      if (!c.answer) return -1;
      return c.attempts.length;
    });

    await request.botRequest('sendMessage', {
      chat_id: request.chatId,
      text: `*${category.name}*\n ${category.description ? '_' + category.description + '_\n' : ''}      
unsolved: ${cardsLevels.filter((l) => l === -1).length}
new: ${cardsLevels.filter((l) => l === 0).length}
in progress: ${cardsLevels.filter((l) => l > 0 && l < 3).length}
learned: ${cardsLevels.filter((l) => l > 3).length}
`,
      parse_mode: 'MarkdownV2',
      reply_markup: {
        inline_keyboard: [
          [{ text: i18n.start_learning[request.user.data.language], callback_data: COMMANDS.startLearning }],
          [{ text: i18n.add_card[request.user.data.language], callback_data: COMMANDS.changeCategory }],
          [{ text: i18n.edit_category[request.user.data.language], callback_data: COMMANDS.changeCategory }],
        ],
      },
    });
  },
};
