import { Request } from '../models/request';
import { COMMANDS } from '../tools/commands';
import { emoji } from '../emoji';
import { MSG_TYPE } from '../tools/msg-type';

export const LearnController = {
  showCard: async (request: Request) => {
    const category = request.user.data.categories.find((c) => c.selected);
    const cards = category?.cards || [];
    const card = cards[Math.round(Math.random() * (cards.length - 1))];

    let response;
    if (card.answer) {
      response = await request.botRequest('sendMessage', {
        chat_id: request.chatId,
        text: card.question.text,
        parse_mode: 'MarkdownV2',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Show answer ' + emoji.open_book, callback_data: COMMANDS.showAnswer }],
            [
              {
                text: 'Skip card         ' + emoji.fast_forward,
                callback_data: COMMANDS.skipCard,
              },
            ],
          ],
        },
      });
    } else {
      response = await request.botRequest('sendMessage', {
        chat_id: request.chatId,
        text: card.question.text + `\n\n _This is unsolved card that had no answer\\. You can add it now_`,
        parse_mode: 'MarkdownV2',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Set answer ' + emoji.pencil, callback_data: COMMANDS.setAnswer }],
            [{ text: 'Skip card    ' + emoji.fast_forward, callback_data: COMMANDS.skipCard }],
          ],
        },
      });
    }

    await request.user.update({
      currentCardId: card.id,
      hangingMessages: [
        ...request.user.data.hangingMessages.filter((m) => m.type !== MSG_TYPE.cardDisplayed),
        { id: response.result.message_id, type: MSG_TYPE.cardDisplayed },
      ],
    });
  },

  showAnswer: async (request: Request) => {
    const category = request.user.data.categories.find((c) => c.selected);
    const card = category?.cards.find((c) => c.id === request.user.data.currentCardId);
    if (card && card.answer) {
      const { result } = await request.botRequest('sendMessage', {
        chat_id: request.chatId,
        text:
          card.answer.text +
          `\n\n_how successful was your answer?\n\\(this defines when the card will be displayed next time\\)_`,
        parse_mode: 'MarkdownV2',
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'bad ' + emoji.red_circle, callback_data: COMMANDS.setAnswer },
              { text: 'mediocre' + emoji.yellow_circle, callback_data: COMMANDS.setAnswer },
              { text: 'nice' + emoji.green_circle, callback_data: COMMANDS.setAnswer },
            ],
          ],
        },
      });

      await request.user.update({
        hangingMessages: [
          ...request.user.data.hangingMessages.filter((m) => m.type !== MSG_TYPE.answerDisplayed),
          { id: result.message_id, type: MSG_TYPE.answerDisplayed },
        ],
      });
    }
  },

  markAnswer: async (request: Request) => {
    const category = request.user.data.categories.find((c) => c.selected);
    const card = category?.cards.find((c) => c.id === request.user.data.currentCardId);
    const mark = parseInt(request.callbackQuery.data.split(COMMANDS.markAnswer)[1]);
    if (card) {
      card.attempts.push({ timestamp: new Date().getTime(), mark });
      await request.user.update({ categories: request.user.data.categories });

      await request.botRequest('editMessageText', {
        chat_id: request.chatId,
        message_id: request.user.data.hangingMessages.find((m) => m.type === MSG_TYPE.cardDisplayed)?.id,
        text:
          card.question.text +
          '\n\n' +
          [emoji.red_circle, emoji.yellow_circle, emoji.green_circle][mark + 1] +
          card.answer?.text,
        parse_mode: 'MarkdownV2',
      });

      await request.botRequest('deleteMessage', {
        chat_id: request.chatId,
        message_id: request.user.data.hangingMessages.find((m) => m.type === MSG_TYPE.answerDisplayed)?.id,
      });

      await LearnController.showCard(request);
    }
  },
};
