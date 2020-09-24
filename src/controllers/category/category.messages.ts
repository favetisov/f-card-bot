import { Context } from '@src/context';
import { localize } from '@src/tools/localize';
import { CategoryI18n as i18n } from './category.i18n';
import { CALLBACK_COMMAND } from '@src/enums/callback-command';
import { PARSE_MODE } from '@src/enums/parse-mode';
import { button } from '@src/tools/button';
import { Category } from '@src/models/category';

export const CategoryMessages = {
  list: (context: Context) => {
    const buttons = [
      [
        button({
          text: localize(context, i18n.create_new_category),
          command: CALLBACK_COMMAND.createCategory,
          clickReport: localize(context, i18n.creating_new_category),
        }),
      ],
    ];

    let text: string;
    const categories = context.session.data.categories;
    if (!categories.length) {
      text = localize(context, i18n.you_dont_have_categories);
    } else {
      text = localize(context, i18n.you_have_categories);
      buttons.unshift(
        ...categories.map((c) => [
          button({
            text: c.name,
            command: CALLBACK_COMMAND.selectCategory,
            parameters: [c.name],
            clickReport: localize(context, i18n.selected_category, { name: c.name }),
          }),
        ]),
      );
    }
    console.log(buttons);

    return {
      chat_id: context.update.chatId,
      text: text,
      reply_markup: { inline_keyboard: buttons },
      parse_mode: PARSE_MODE.markdown2,
    };
  },

  categoryNotFound: (context: Context, query: string) => {
    return {
      chat_id: context.update.chatId,
      text: localize(context, i18n.category_not_found, { query }),
      parse_mode: PARSE_MODE.markdown2,
    };
  },

  provideCategoryName: (context: Context) => {
    const buttons = [
      [
        button({
          text: localize(context, i18n.cancel_creation),
          command: CALLBACK_COMMAND.createCategoryCancel,
          clickReport: localize(context, i18n.category_creation_canceled),
        }),
      ],
    ];
    return {
      chat_id: context.update.chatId,
      text: localize(context, i18n.provide_category_name),
      reply_markup: { inline_keyboard: buttons },
      parse_mode: PARSE_MODE.markdown2,
    };
  },

  provideNewCategoryName: (context: Context) => {
    const buttons = [
      [
        button({
          text: localize(context, i18n.cancel),
          command: CALLBACK_COMMAND.createCategoryCancel,
          clickReport: localize(context, i18n.category_change_canceled),
        }),
      ],
    ];
    return {
      chat_id: context.update.chatId,
      text: localize(context, i18n.provide_new_category_name),
      reply_markup: { inline_keyboard: buttons },
      parse_mode: PARSE_MODE.markdown2,
    };
  },

  categoryExists: (context: Context, categoryName: string) => {
    const buttons = [
      [
        button({
          text: localize(context, i18n.cancel),
          command: CALLBACK_COMMAND.createCategoryCancel,
          clickReport: localize(context, i18n.category_creation_canceled),
        }),
      ],
    ];
    return {
      chat_id: context.update.chatId,
      text: localize(context, i18n.category_name_exists, { name: categoryName }),
      reply_markup: { inline_keyboard: buttons },
      parse_mode: PARSE_MODE.markdown2,
    };
  },

  state: (context: Context) => {
    const category = context.session.data.categories.find((c) => c.selected);
    const buttons = [
      [
        button({
          text: localize(context, i18n.change_category),
          command: CALLBACK_COMMAND.listCategories,
          clickReport: localize(context, i18n.changing_category),
        }),
        button({
          text: localize(context, i18n.add_card),
          command: CALLBACK_COMMAND.addCard,
          clickReport: localize(context, i18n.adding_card),
        }),
      ],
      [
        button({
          text: localize(context, i18n.edit_category),
          command: CALLBACK_COMMAND.editCategory,
          parameters: { name: category.name },
          clickReport: localize(context, i18n.editing_category),
        }),
        button({
          text: localize(context, i18n.delete_category),
          command: CALLBACK_COMMAND.deleteCategory,
          parameters: { name: category.name },
          clickReport: localize(context, i18n.deleting_category),
        }),
      ],
    ];

    if (category.cards.length) {
      buttons.push([
        button({
          text: localize(context, i18n.start_learning),
          command: CALLBACK_COMMAND.showNextCard,
          clickReport: localize(context, i18n.learning_started),
        }),
      ]);
    }

    return {
      chat_id: context.update.chatId,
      text: localize(context, i18n.state, getCategoryStats(category)),
      reply_markup: { inline_keyboard: buttons },
      parse_mode: PARSE_MODE.markdown2,
    };
  },

  confirmCategoryRemoval: (context: Context) => {
    const category = context.session.data.categories.find((c) => c.selected);
    const buttons = [
      [
        button({
          text: localize(context, i18n.cancel),
          command: CALLBACK_COMMAND.deleteCategoryCancel,
          clickReport: localize(context, i18n.category_removal_canceled),
        }),
      ],
      [
        button({
          text: localize(context, i18n.delete),
          command: CALLBACK_COMMAND.deleteCategoryConfirm,
          parameters: { name: category.name },
          clickReport: localize(context, i18n.category_deleted),
        }),
      ],
    ];

    return {
      chat_id: context.update.chatId,
      text: localize(context, i18n.confirm_category_removal),
      reply_markup: { inline_keyboard: buttons },
      parse_mode: PARSE_MODE.markdown2,
    };
  },
};

const getCategoryStats = (category: Category) => {
  const calcCardScore = (card) => card.attempts.reduce((sum, attempt) => sum + attempt.mark, 0);

  const unsolved = category.cards.filter((c) => !c.answer).length + '';
  const fresh = category.cards.filter((c) => c.answer && !c.attempts.length).length + '';
  const in_progress = category.cards.filter((c) => c.answer && c.attempts.length && calcCardScore(c) < 3).length + '';
  const learned = category.cards.filter((c) => c.answer && calcCardScore(c) >= 3).length + '';
  return { name: category.name, unsolved, fresh, in_progress, learned };
};
