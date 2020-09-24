// todo add LANGUAGE typings
import { emoji } from '@src/tools/emoji';

export const CategoryI18n = {
  create_new_category: {
    en: 'Create new category ' + emoji.heavy_plus_sign,
    ru: 'Создать новую категорию ' + emoji.heavy_plus_sign,
  },
  creating_new_category: {
    en: 'Creating new category',
    ru: 'Создаём новую категорию',
  },
  select_category: {
    en: 'Select category ${name}',
    ru: 'Выбрать категорию ${name}',
  },
  selected_category: {
    en: 'Selected *${name}*',
    ru: 'Выбрана *${name}*',
  },
  you_dont_have_categories: {
    en: "You don't have any category yet",
    ru: 'У вас пока нет ни одной категории',
  },
  you_have_categories: {
    en: '*Select category*\n\nPick category from list below ' + emoji.point_down,
    ru: '*Выберите категорию*\n\nВыберите категорию из списка ниже ' + emoji.point_down,
  },
  cancel_creation: {
    en: 'Cancel category creation',
    ru: 'Отменить создание категории',
  },
  category_creation_canceled: {
    en: 'Creation canceled',
    ru: 'Создание отменено',
  },
  provide_category_name: {
    en: 'Please provide category name\\. You can add optional description on a new line\\.',
    ru: `Введите название категории\\. Если хотите, можете добавить описание на новой строчке`,
  },
  provide_new_category_name: {
    en: 'Please provide new category name and description \\(on a new line\\)',
    ru: 'Введите новое название категории и её описание \\(на новой строчке\\)',
  },
  category_change_canceled: {
    en: 'Category edit canceled',
    ru: 'Редактирование категории отменено',
  },
  category_name_exists: {
    en: 'Category with name *${name}* exists\\. Please provide different name',
    ru: 'Категория с названием *${name}* уже существует\\. Введите другое название',
  },
  change_category: {
    en: 'Change category',
    ru: 'Сменить категорию',
  },
  changing_category: {
    en: 'Changing category',
    ru: 'Меняем категорию',
  },
  add_card: {
    en: 'Add card',
    ru: 'Добавить карточку',
  },
  adding_card: {
    en: 'Creating card',
    ru: 'Добавляем карточку',
  },
  edit_category: {
    en: 'Edit category',
    ru: 'Редактировать категорию',
  },
  editing_category: {
    en: 'Editing category',
    ru: 'Редактируем категорию',
  },
  delete_category: {
    en: 'Delete category',
    ru: 'Удалить категорию',
  },
  deleting_category: {
    en: 'Deleting category',
    ru: 'Удаляем категорию',
  },
  start_learning: {
    en: 'Start learning',
    ru: 'Начать повторять',
  },
  learning_started: {
    en: 'Starting learning',
    ru: 'Начинаем повторять',
  },
  confirm_category_removal: {
    en: 'Do you really want to delete category?',
    ru: 'Вы действительно хотите удалить категорию?',
  },
  cancel: {
    en: 'Cancel',
    ru: 'Отменить',
  },
  category_removal_canceled: {
    en: 'Category removal canceled',
    ru: 'Удаление категории отменено',
  },
  delete: {
    en: 'Delete',
    ru: 'Удалить',
  },
  category_deleted: {
    en: 'Category deleted',
    ru: 'Категория удалена',
  },
  state: {
    en: '*${name}*\nunsolved: ${unsolved}\nfresh: ${fresh}\nin progress: ${in_progress}\nlearned: ${learned}',
    ru: '*${name}*\nнерешённые: ${unsolved}\nсвежие: ${fresh}\nв процессе: ${in_progress}\nвыучены: ${learned}',
  },
  category_not_found: {
    en: "Unable to find category on '${query}'",
    ru: "Не получилось найти категорию по запросу '${query}'",
  },
};
