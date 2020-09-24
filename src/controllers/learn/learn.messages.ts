import { Context } from '@src/context';
import { Card } from '@src/models/card';
import { button } from '@src/tools/button';
import { localize } from '@src/tools/localize';
import { CALLBACK_COMMAND } from '@src/enums/callback-command';
import { LearnI18n as i18n } from './learn.i18n';
import { entitiesToMd, escapeMd } from '@src/tools/escape-md';

export const LearnMessages = {
  question: (context: Context, card: Card) => {
    const buttons = [
      [
        button({
          text: localize(context, i18n.skip_card),
          command: CALLBACK_COMMAND.skipCard,
          parameters: { cardId: card.id },
          clickReport: localize(context, i18n.card_skipped),
        }),
        button({
          text: localize(context, i18n.stop_learning),
          command: CALLBACK_COMMAND.showState,
          clickReport: localize(context, i18n.learning_stopped),
        }),
        button({
          text: localize(context, i18n.edit_question),
          command: CALLBACK_COMMAND.editCardQuestion,
          parameters: { cardId: card.id },
          clickReport: localize(context, i18n.editing_question),
        }),
      ],
    ];
    if (card.answer?.text) {
      buttons.unshift([
        button({
          text: localize(context, i18n.show_answer),
          command: CALLBACK_COMMAND.showAnswer,
          parameters: { cardId: card.id },
          clickReport: localize(context, i18n.showing_answer),
        }),
      ]);
    } else {
      buttons.unshift([
        button({
          text: localize(context, i18n.set_answer),
          command: CALLBACK_COMMAND.editCardAnswer,
          parameters: { cardId: card.id },
          clickReport: localize(context, i18n.setting_answer),
        }),
      ]);
    }

    return {
      chat_id: context.update.chatId,
      text:
        localize(context, i18n.card_number, { number: card.id + '' }) +
        localize(context, i18n.card_knowledge, {
          score: escapeMd((card.attempts || []).reduce((s, a) => s + a.mark, 0) + ''),
        }) +
        '\n\n' +
        localize(context, i18n.question) +
        entitiesToMd(card.question?.text, card.question.entities),
      parse_mode: 'MarkdownV2',
      reply_markup: { inline_keyboard: buttons },
    };
  },

  answer: (context: Context, card: Card) => {
    const buttons = [
      [
        button({
          text: localize(context, i18n.bad),
          command: CALLBACK_COMMAND.markAnswer,
          parameters: { cardId: card.id, mark: -1 },
          clickReport: localize(context, i18n.marked_as, { mark: localize(context, i18n.bad) }),
        }),
        button({
          text: localize(context, i18n.mediocre),
          command: CALLBACK_COMMAND.markAnswer,
          parameters: { cardId: card.id, mark: 0 },
          clickReport: localize(context, i18n.marked_as, { mark: localize(context, i18n.mediocre) }),
        }),
        button({
          text: localize(context, i18n.good),
          command: CALLBACK_COMMAND.markAnswer,
          parameters: { cardId: card.id, mark: 1 },
          clickReport: localize(context, i18n.marked_as, { mark: localize(context, i18n.good) }),
        }),
      ],
      [
        button({
          text: localize(context, i18n.edit_question),
          command: CALLBACK_COMMAND.editCardQuestion,
          parameters: { cardId: card.id },
          clickReport: localize(context, i18n.editing_question),
        }),
        button({
          text: localize(context, i18n.edit_answer),
          command: CALLBACK_COMMAND.editCardAnswer,
          parameters: { cardId: card.id },
          clickReport: localize(context, i18n.editing_answer),
        }),
      ],
    ];

    return {
      chat_id: context.update.chatId,
      text:
        localize(context, i18n.card_number, { number: card.id + '' }) +
        '\n\n' +
        localize(context, i18n.answer) +
        entitiesToMd(card.answer?.text, card.answer?.entities) +
        escapeMd('\n\n-------------------\n') +
        localize(context, i18n.mark_answer),
      parse_mode: 'MarkdownV2',
      reply_markup: { inline_keyboard: buttons },
    };
  },
};
