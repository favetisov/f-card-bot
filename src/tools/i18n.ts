import { emoji } from '../emoji';

export const i18n = {
  cancel: {
    en: 'Cancel',
    ru: 'Отменить',
  },
  welcome_message: {
    en: `
      ${emoji.uk} *Welcome\\!*
          
/list to all categories and select/create one
/add to add card to current category
/go to start learning
/help to show this message again
/lang to change interface language

You can learn more about how Bot works here:
https://github\\.com/favetisov/f\\-card\\-bot    
You are more than welcome to contribute  `,
    ru: `${emoji.ru} *Приветствуем\\!*   
      
/list вывести список категорий и выбрать/создать новую 
/add добавить карточку в текущей категории
/go начать повторять 
/help ещё раз вывести это сообщение 
/lang чтобы сменить язык интерфейса

О том, как устроен Бот можно почитать здесь:
https://github\\.com/favetisov/f\\-card\\-bot
Приветствуется любая помощь в развитии 
    `,
  },
  how_it_works: {
    en: ` ${emoji.uk} *Welcome\\!*
    
Cards that you will add to bot should be divided into categories\\. E\\.g\\. "Spanish words", "Animals", "Math\\. analysis exam"\\.

Let's create first category\\! Click button below to do so  ${emoji.point_down}
`,
    ru: `${emoji.ru} *Ура, давайте начинать\\!*  
Карточки, которые вы будете добавлять в бота, должны быть разбиты по категориям\\. 

Например, "Английские слова", "Животные", "Экзамен по мат\\.анализу"\\.

Давайте создадим первую категорию\\. Для этого нажмите кнопку под этим сообщением ${emoji.point_down}
`,
  },
  first_category_created: {
    en: "Nice! Now let's fill the category with cards you want to memorize. Type `/add` to start creation process.",
    ru:
      'Отлично! Теперь давайте добавим в категорию карточки, которые будем запоминать. Напишите `/add` чтобы начать создание карточки',
  },
  language_selected: {
    en: emoji.uk + ' English language selected',
    ru: emoji.ru + ' Выбран русский язык',
  },
  list_command_description: {
    en: 'show all categories and select/create one',
    ru: 'вывести список категорий и выбрать/создать новую',
  },
  add_command_description: {
    en: 'to add card to current category',
    ru: 'создать карточку в текущей категории',
  },
  go_command_description: {
    en: 'start memorizing',
    ru: 'начать повторять',
  },
  you_dont_have_categories: {
    en: "You don't have any category yet\\. Click button below to create category",
    ru: 'У вас пока нет ни одной категории\\. Нажмите кнопку под этим сообщением чтобы создать категорию',
  },
  create_new_category: {
    en: 'Create new category ' + emoji.heavy_plus_sign,
    ru: 'Создать категорию ' + emoji.heavy_plus_sign,
  },
  provide_category_name: {
    en: 'Please provide category name. You can add optional description on a new line.',
    ru: 'Введите название категории. Если хотите, можете добавить описание на новой строчке',
  },
  provide_new_category_name: {
    en: 'Please provide new category name and description (on a new line)',
    ru: 'Введите новое название категории и её описание (на новой строчке)',
  },
  no_category_to_edit: {
    en: 'Category you are trying to edit does not exist',
    ru: 'Категория, которую вы пытаетесь изменить, не существует',
  },
  cancel_category_creation: {
    en: 'Cancel creation',
    ru: 'Отменить создание',
  },
  category_name_exists: {
    en: 'Category with this name already exists. Please provide different name',
    ru: 'Категория с этим названием уже существует. Пожалуйста, введите другое название',
  },
  current_category_is: {
    en: (name) =>
      `Current category is *${name}*\\. Send \`/list\` to get full list and select/add category; use buttons below for further actions`,
    ru: (name) =>
      `Выбрана категория *${name}*\\. Напишите \`/list\` чтобы посмотреть список категорий; используйте кнопки внизу чтобы добавить карточки или изменить категорию`,
  },
  you_have_categories: {
    en: 'Select category ' + emoji.point_down,
    ru: 'Выберите категорию ' + emoji.point_down,
  },
  provide_card_question: {
    en: '*Provide card question*\\.\nIt can be a text, image, video or anything of these combined\\.',
    ru: '*Введите вопрос карточки*\\.\nЭто может быть текст, картинка, видео или их сочетание\\.',
  },
  incorrect_card_format: {
    en: 'Incorrect format. Only text, image and video is allowed',
    ru: 'Некорректный формат. Резрешены только текст, картинка или видео',
  },
  card_created: {
    en:
      "*Card created*\\.\nAdd answer text/photo/video or click 'unsolved' to leave it empty\\. You always can add it later",
    ru:
      "*Карточка создана*\\.\nТеперь введите текст/фото/видео ответа или нажмите 'не решена', чтобы оставить ответ пустым\\. Вы всегда сможете добавить его позже",
  },
  unsolved: {
    en: 'Unsolved',
    ru: 'Не решена',
  },
  card_not_found: {
    en: 'Something went wrong: we could not find card to attach answer to...',
    ru: 'Что-то сломалось: не получается найти карточку, к которой мы хотим прикрепить ответ...',
  },
  answer_added: {
    en: `*Answer added* ${emoji.ok_hand}\n\n \`/add\` to create more cards\n \`/info\` to get current state \n\`/go\` to start learning`,
    ru: `*Ответ добавлен*\\. ${emoji.ok_hand}\n\n \`/add\` \\- добавить ещё карточек\n\ \`/info\` \\- текущий статус\n \`/go\` \\-  начать повторять`,
  },
  edit_category: {
    en: 'Change category name/description  ' + emoji.pencil,
    ru: 'Изменить название/описание  ' + emoji.pencil,
  },
  add_card: {
    en: 'Add card  ' + emoji.heavy_plus_sign,
    ru: 'Добавить карточку  ' + emoji.heavy_plus_sign,
  },
  start_learning: {
    en: 'Start learning  ' + emoji.arrow_forward,
    ru: 'Начать повторять  ' + emoji.arrow_forward,
  },
  delete_category: {
    en: 'Delete category ' + emoji.wastebasket,
    ru: 'Удалить категорию ' + emoji.wastebasket,
  },
  confirm_category_removal: {
    en: (name) => `Do you really want to delete category *${name}*?`,
    ru: (name) => `Вы действительно хотите удалить категорию  *${name}*?`,
  },
  remove: {
    en: 'Delete',
    ru: 'Удалить',
  },
};
