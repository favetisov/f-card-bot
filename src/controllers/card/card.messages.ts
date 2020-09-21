import { Context } from '@src/context';
import { CardI18n as i18n } from './card.i18n';
import { button } from '@src/tools/button';
import { localize } from '@src/tools/localize';
import { CALLBACK_COMMAND } from '@src/enums/callback-command';
import { PARSE_MODE } from '@src/enums/parse-mode';
import { Card } from '@src/models/card';

export const CardMessages = {
  provideQuestion: (context: Context) => {
    const buttons = [
      [
        button({
          text: localize(context, i18n.cancel_card_creation),
          command: CALLBACK_COMMAND.addCardCancel,
          clickReport: localize(context, i18n.card_creation_canceled),
        }),
      ],
    ];

    return {
      chat_id: context.update.chatId,
      text: localize(context, i18n.provide_card_question),
      reply_markup: { inline_keyboard: buttons },
      parse_mode: PARSE_MODE.markdown2,
    };
  },

  provideAnswer: (context: Context, cardId: number) => {
    const buttons = [
      [
        button({
          text: localize(context, i18n.unsolved),
          command: CALLBACK_COMMAND.addCardEmptyAnswer,
          parameters: { cardId },
          clickReport: localize(context, i18n.set_unsolved),
        }),
      ],
    ];

    return {
      chat_id: context.update.chatId,
      text: localize(context, i18n.provide_card_answer),
      reply_markup: { inline_keyboard: buttons },
      parse_mode: PARSE_MODE.markdown2,
    };
  },

  provideNewQuestion: (context: Context, card: Card) => {
    const buttons = [
      [
        button({
          text: localize(context, i18n.cancel_card_edit),
          command: CALLBACK_COMMAND.editCardQuestionCancel,
          parameters: { cardId: card.id },
          clickReport: localize(context, i18n.cancel_card_creation),
        }),
      ],
    ];

    return {
      chat_id: context.update.chatId,
      text: localize(context, i18n.provide_card_question),
      reply_markup: { inline_keyboard: buttons },
      parse_mode: PARSE_MODE.markdown2,
    };
  },

  provideNewAnswer: (context: Context) => {
    const buttons = [
      [
        button({
          text: localize(context, i18n.unsolved),
          command: CALLBACK_COMMAND.addCardEmptyAnswer,
          clickReport: localize(context, i18n.set_unsolved),
        }),
      ],
    ];

    return {
      chat_id: context.update.chatId,
      text: localize(context, i18n.provide_new_card_answer),
      reply_markup: { inline_keyboard: buttons },
      parse_mode: PARSE_MODE.markdown2,
    };
  },

  confirmCardRemoval: (context: Context) => {
    const buttons = [
      [
        button({
          text: localize(context, i18n.cancel_card_delete),
          command: CALLBACK_COMMAND.deleteCardCancel,
          clickReport: localize(context, i18n.card_removal_canceled),
        }),
      ],
      [
        button({
          text: localize(context, i18n.confirm_card_delete),
          command: CALLBACK_COMMAND.deleteCardConfirm,
          clickReport: localize(context, i18n.card_deleted),
        }),
      ],
    ];

    return {
      chat_id: context.update.chatId,
      text: localize(context, i18n.card_deleted),
      reply_markup: { inline_keyboard: buttons },
      parse_mode: PARSE_MODE.markdown2,
    };
  },

  incorrectQuestionFormat: (context: Context) => {
    const buttons = [
      [
        button({
          text: localize(context, i18n.cancel_card_creation),
          command: CALLBACK_COMMAND.addCardCancel,
          clickReport: localize(context, i18n.card_creation_canceled),
        }),
      ],
    ];
    return incorrectFormatMsg(context, buttons);
  },

  incorrectAnswerFormat: (context: Context) => {
    const buttons = [
      [
        button({
          text: localize(context, i18n.unsolved),
          command: CALLBACK_COMMAND.addCardEmptyAnswer,
          clickReport: localize(context, i18n.set_unsolved),
        }),
      ],
    ];
    return incorrectFormatMsg(context, buttons);
  },

  incorrectNewQuestionFormat: (context: Context) => {
    const buttons = [
      [
        button({
          text: localize(context, i18n.cancel_card_edit),
          command: CALLBACK_COMMAND.editCardQuestionCancel,
          clickReport: localize(context, i18n.card_edit_canceled),
        }),
      ],
    ];
    return incorrectFormatMsg(context, buttons);
  },

  incorrectNewAnswerFormat: (context: Context) => {
    const buttons = [
      [
        button({
          text: localize(context, i18n.unsolved),
          command: CALLBACK_COMMAND.addCardEmptyAnswer,
          clickReport: localize(context, i18n.set_unsolved),
        }),
      ],
    ];
    return incorrectFormatMsg(context, buttons);
  },
};

const incorrectFormatMsg = (context, buttons) => ({
  chat_id: context.update.chatId,
  text: localize(context, i18n.incorrect_format),
  reply_markup: { inline_keyboard: buttons },
  parse_mode: PARSE_MODE.markdown2,
});
