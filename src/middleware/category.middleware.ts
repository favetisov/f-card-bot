import { WebhookRequest } from '../models/webhook-request';
import { load, save } from '../services/storage.service';

const COMMANDS = {
  create: 'cmd_create_category',
  cancelCreation: 'cmd_create_category_cancel',
};

const STATES = {
  waitingForCategoryName: 'waiting_for_category_name',
};

export const categoryMiddleware = (request: WebhookRequest) => {
  if (request.answer) return;

  if (request.message?.text?.indexOf('/list') === 0) {
    return listCategories(request);
  } else if (request.callbackQuery?.data == COMMANDS.create) {
    return onCreateCallback(request);
  } else if (request.message?.text && load(request.message?.chat?.id)?.state === STATES.waitingForCategoryName) {
    return createCategory(request);
  } else if (request.callbackQuery?.data == COMMANDS.cancelCreation) {
    return cancelCreation(request);
  }
};

const listCategories = (request) => {
  const categories = load(request.message.chat.id).categories;

  if (!categories?.length) {
    request.answer = {
      method: 'sendMessage',
      chat_id: request.message.chat.id,
      text: "You don't have any category yet. Click `create` to add category",
      reply_markup: {
        inline_keyboard: [[{ text: 'create new category', callback_data: COMMANDS.create }]],
      },
    };
  } else {
    request.answer = {
      method: 'sendMessage',
      chat_id: request.message.chat.id,
      text: categories.map((c) => c.name + (c.description ? `\n` + c.description : '')).join(`\n`),
      reply_markup: {
        inline_keyboard: [[{ text: 'create new category', callback_data: COMMANDS.create }]],
      },
    };
  }
};

export const onCreateCallback = (request) => {
  const chatId = request.callbackQuery.message.chat.id;
  save(chatId, Object.assign(load(chatId) || {}, { state: STATES.waitingForCategoryName }));
  request.answer = {
    method: 'sendMessage',
    chat_id: request.callbackQuery.message.chat.id,
    text: 'Please provide category name. You can add optional description on a new line.',
    reply_markup: {
      inline_keyboard: [[{ text: 'cancel creation', callback_data: COMMANDS.cancelCreation }]],
    },
  };
};

export const createCategory = (request) => {
  const categoryName = request.message.text.split(`\n`)[0].trim();
  let categoryDescription = '';
  if (request.message.text.indexOf('\n') !== -1) {
    categoryDescription = request.message.text.slice(request.message.text.indexOf('\n')).trim();
  }
  const userData = load(request.message.chat.id);
  if (!userData.categories) userData.categories = [];
  if (userData.categories.find((c) => c.name == categoryName)) {
    return (request.answer = {
      method: 'sendMessage',
      chat_id: request.message.chat.id,
      text: 'Category with this name already exists. Please provide different name',
      reply_markup: {
        inline_keyboard: [[{ text: 'cancel creation', callback_data: COMMANDS.cancelCreation }]],
      },
    });
  } else {
    userData.categories.push({ name: categoryName, description: categoryDescription, cards: [] });
    save(request.message.chat.id, userData);
    return (request.answer = {
      method: 'sendMessage',
      chat_id: request.message.chat.id,
      text: `Category ${categoryName} created`,
    });
  }
};

export const cancelCreation = (request) => {
  const chatId = request.callbackQuery.message.chat.id;
  save(chatId, Object.assign(load(chatId) || {}, { state: null }));
};
