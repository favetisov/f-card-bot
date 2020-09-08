import { Request } from '../models/request';
import { i18n } from '../tools/i18n';
import { COMMANDS } from '../tools/commands';
import { STATE } from '../tools/states';
import { MSG_TYPE } from '../tools/msg-type';
import { CategoryController } from './category.controller';

export const CardController = {
  onAddCard: async (request: Request) => {
    const category = request.user.data.categories.find((c) => c.selected);

    if (category) {
      await request.user.update({ state: STATE.waitingForCardQuestion });
      const { result } = await request.botRequest('sendMessage', {
        text: i18n.provide_card_question[request.user.data.language],
        chat_id: request.chatId,
        reply_markup: {
          inline_keyboard: [
            [{ text: i18n.cancel[request.user.data.language], callback_data: COMMANDS.cancelCategoryCreation }],
          ],
        },
        parse_mode: 'MarkdownV2',
      });

      await request.user.update({
        hangingMessages: [
          ...request.user.data.hangingMessages,
          { id: result.message_id, type: MSG_TYPE.provideCardQuestion },
        ],
      });
    } else {
      return CardController.sendNoCategoriesMessage(request);
    }
  },

  addCardQuestion: async (request: Request) => {
    const text = request.message.text?.trim();
    const photoId = request.message.photo && request.message.photo[0].file_id;
    const videoId = request.message.video?.file_id;
    const caption = request.message?.caption?.trim();

    if (text || photoId || videoId) {
      const category = request.user.data.categories.find((c) => c.selected);
      if (!category) {
        await CardController.sendNoCategoriesMessage(request);
      } else {
        const maxId = Math.max(...category.cards.map((c) => c.id), 0);
        const question = { text, photoId, videoId, caption };
        Object.keys(question).forEach(key => question[key] === undefined && delete question[key]);
        category.cards.push({
          id: maxId + 1,
          question: question,
          published: false,
          answer: null,
          attempts: [],
        });
        await request.user.update({ categories: request.user.data.categories, state: STATE.waitingForCardAnswer });

        const provideQuestionMessageId = request.user.data.hangingMessages.find(
          (m) => m.type === MSG_TYPE.provideCardQuestion,
        )?.id;
        await request.botRequest('deleteMessage', {
          chat_id: request.chatId,
          message_id: provideQuestionMessageId,
        });
        await request.user.update({
          hangingMessages: request.user.data.hangingMessages.filter((c) => c.id !== provideQuestionMessageId),
        });

        const { result } = await request.botRequest('sendMessage', {
          text: i18n.card_created[request.user.data.language],
          chat_id: request.chatId,
          reply_markup: {
            inline_keyboard: [
              [{ text: i18n.unsolved[request.user.data.language], callback_data: COMMANDS.setEmptyCardAnswer }],
            ],
          },
          parse_mode: 'MarkdownV2',
        });
        await request.user.update({
          hangingMessages: [
            ...request.user.data.hangingMessages,
            { id: result.message_id, type: MSG_TYPE.cardCreated },
          ],
        });
      }
    } else {
      await request.botRequest('sendMessage', {
        text: i18n.incorrect_card_format[request.user.data.language],
        chat_id: request.chatId,
      });
    }
  },

  addCardAnswer: async (request: Request) => {
    const text = request.message.text?.trim();
    const photoId = request.message.photo && request.message.photo[0].file_id;
    const videoId = request.message.video?.file_id;
    const caption = request.message?.caption?.trim();

    if (text || photoId || videoId) {
      const card = request.user.data.categories.find((c) => c.selected)?.cards.find((c) => !c.published);
      if (!card) {
        await request.botRequest('sendMessage', {
          text: i18n.card_not_found[request.user.data.language],
          chat_id: request.chatId,
          parse_mode: 'MarkdownV2',
        });
      } else {
        card.published = true;
        card.answer = { text, photoId, videoId, caption };
        await request.user.update({ categories: request.user.data.categories, state: STATE.ready });

        const cardCreatedMessageId = request.user.data.hangingMessages.find((m) => m.type === MSG_TYPE.cardCreated)?.id;
        await request.botRequest('deleteMessage', {
          chat_id: request.chatId,
          message_id: cardCreatedMessageId,
        });
        await request.user.update({
          hangingMessages: request.user.data.hangingMessages.filter((c) => c.id !== cardCreatedMessageId),
        });

        await request.botRequest('sendMessage', {
          text: i18n.answer_added[request.user.data.language],
          chat_id: request.chatId,
          parse_mode: 'MarkdownV2',
        });
      }
    } else {
      await request.botRequest('sendMessage', {
        text: i18n.incorrect_card_format[request.user.data.language],
        chat_id: request.chatId,
      });
    }
  },

  addEmptyCardAnswer: async (request: Request) => {
    const card = request.user.data.categories.find((c) => c.selected)?.cards.find((c) => !c.published);
    if (card) {
      card.published = true;
      await request.user.update({ categories: request.user.data.categories, state: STATE.ready });
      await CategoryController.getCurrentState(request);
    }
  },

  sendNoCategoriesMessage: (request: Request) => {
    return request.botRequest('sendMessage', {
      text: i18n.you_dont_have_categories[request.user.data.language],
      chat_id: request.chatId,
      reply_markup: {
        inline_keyboard: [
          [{ text: i18n.create_new_category[request.user.data.language], callback_data: COMMANDS.createCategory }],
        ],
      },
      parse_mode: 'MarkdownV2',
    });
  },
};
