import { Context } from '@src/context';
import { send } from '@src/bot';
import { CategoryMessages as msg } from './category.messages';
import { STATE } from '@src/enums/state';
import { Message } from 'telegram-typings';
import { Category } from '@src/models/category';

export const CategoryController = {
  /**
   * List existing categories
   * @param context
   */
  list: async (context: Context) => {
    await send(context, msg.list(context));
  },

  inlineSwitchCategory: async (context: Context) => {
    if (context.update.message?.text) {
      const categoryName = context.update.message.text.split('/sel ')[1];
      const categories = context.session.data.categories;
      const category = categories.find((c) => c.name.toLowerCase().includes(categoryName.toLowerCase()));
      if (category) {
        categories.forEach((c) => (c.selected = category.name === c.name));
        await Promise.all([
          context.session.update(context.sessionKey, { categories, state: STATE.ready }),
          send(context, msg.state(context)),
        ]);
      } else {
        await send(context, msg.categoryNotFound(context, categoryName));
        await send(context, msg.list(context));
      }
    }
  },

  /**
   * "Create category" button clicked
   * @param context
   */
  onCreateCategory: async (context: Context) => {
    await Promise.all([
      send(context, msg.provideCategoryName(context)),
      context.session.update(context.sessionKey, { state: STATE.waitingForCategoryName }),
    ]);
  },

  /**
   * "cancel category creation" button clicked
   * @param context
   */
  onCreateCategoryCancel: async (context: Context) => {
    await Promise.all([
      context.session.update(context.sessionKey, { state: STATE.ready }),
      send(context, msg.list(context)),
    ]);
  },

  /**
   * received category name
   * @param context
   */
  createCategory: async (context: Context) => {
    if (!context.update.message?.text) return;
    const { categoryName, categoryDescription } = parseCategoryName(context.update.message);
    const categories: Category[] = context.session.data.categories || [];

    if (categories.find((c) => c.name.toLowerCase() == categoryName.toLowerCase())) {
      await send(context, msg.categoryExists(context, categoryName));
    } else {
      categories.forEach((c) => (c.selected = false));
      categories.push({ name: categoryName, description: categoryDescription, cards: [], selected: true });
      await Promise.all([
        context.session.update(context.sessionKey, { categories, state: STATE.ready }),
        send(context, msg.state(context)),
      ]);
    }
  },

  /**
   * category selected via button click
   * @param context
   */
  onSelectCategory: async (context: Context) => {
    const categoryName = context.update.callbackData?.parameters[0];
    const categories = context.session.data.categories;
    categories.forEach((c) => (c.selected = categoryName === c.name));
    await Promise.all([context.session.update(context.sessionKey, { categories }), send(context, msg.state(context))]);
  },

  /**
   * clicked 'edit category' button
   * @param context
   */
  onEditCategory: async (context: Context) => {
    await Promise.all([
      context.session.update(context.sessionKey, { state: STATE.waitingForNewCategoryName }),
      send(context, msg.provideNewCategoryName(context)),
    ]);
  },

  /**
   * received category name
   * @param context
   */
  editCategory: async (context: Context) => {
    if (!context.update.message?.text) return;
    const { categoryName, categoryDescription } = parseCategoryName(context.update.message);
    const categories = context.session.data.categories;
    const category = categories.find((c) => c.selected);
    const existingName = categories.find((c) => c.name == categoryName);
    if (existingName && existingName.name !== category.name) {
      await send(context, msg.categoryExists(context, categoryName));
    } else {
      category.name = categoryName;
      category.description = categoryDescription;
      await Promise.all([
        context.session.update(context.sessionKey, { state: STATE.ready, categories }),
        send(context, msg.state(context)),
      ]);
    }
  },

  /**
   * category editing canceled
   * @param context
   */
  onEditCategoryCancel: async (context: Context) => {
    await Promise.all([
      context.session.update(context.sessionKey, { state: STATE.ready }),
      send(context, msg.state(context)),
    ]);
  },

  /**
   * 'show state' button clicked
   * @param context
   */
  onShowState: async (context: Context) => {
    await send(context, msg.state(context));
  },

  /**
   * clicking "delete category" button
   * @param context
   */
  onDeleteCategory: async (context: Context) => {
    await send(context, msg.confirmCategoryRemoval(context));
  },

  /**
   * cancelling category removal
   * @param context
   */
  onDeleteCategoryCancel: async (context: Context) => {
    await send(context, msg.state(context));
  },

  /**
   * category removal confirmed
   * @param context
   */
  onDeleteCategoryConfirm: async (context: Context) => {
    const category = context.session.data.categories.find(
      (c) => c.name === context.update.callbackData?.parameters['name'],
    );
    if (category) {
      // todo fix
      // await context.session.update(context.sessionKey, {
      //   categories: context.session.data.categories.filter(
      //     (c) => c.name !== context.update.callbackData?.parameters['name'],
      //   ),
      // });
      // await send(context, msg.list(context));
    }
  },
};

const parseCategoryName = (message: Message) => {
  if (!message?.text) return { categoryName: '', categoryDescription: '' };
  const categoryName = message.text.split(`\n`)[0].trim();
  let categoryDescription = '';
  if (message.text.indexOf('\n') !== -1) {
    categoryDescription = message.text.slice(message.text.indexOf('\n')).trim();
  }
  return { categoryName, categoryDescription };
};
