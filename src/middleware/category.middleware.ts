import { WebhookRequest } from '../models/webhook-request';

const COMMANDS = {
  create: 'cmd_create_category',
  cancelCreation: 'cmd_create_category_cancel',
};

const STATES = {
  waitingForCategoryName: 'waiting_for_category_name',
};

const MSG_TYPES = {
  provideCategory: 'provide_category',
  nameExists: 'name_exists',
};

export const categoryMiddleware = async (request: WebhookRequest) => {
  if (request.answer) return;

  if (request.message?.text?.indexOf('/list') === 0) {
    return listCategories(request);
  } else if (request.callbackQuery?.data == COMMANDS.create) {
    return onCreateCallback(request);
  } else if (request.message?.text && STATES.waitingForCategoryName === (await request.userData.get('state'))) {
    return createCategory(request);
  } else if (request.callbackQuery?.data == COMMANDS.cancelCreation) {
    return cancelCreation(request);
  }
};

const listCategories = async (request) => {
  const categories = await request.userData.get('categories');

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

export const onCreateCallback = async (request) => {
  await request.botRequest('deleteMessage', {
    chat_id: request.callbackQuery.message.chat.id,
    message_id: request.callbackQuery.message.id,
  });

  const { result } = await request.botRequest('sendMessage', {
    chat_id: request.callbackQuery.message.chat.id,
    text: 'Please provide category name. You can add optional description on a new line.',
    reply_markup: {
      inline_keyboard: [[{ text: 'cancel creation', callback_data: COMMANDS.cancelCreation }]],
    },
  });

  return request.userData.update({
    state: STATES.waitingForCategoryName,
    hangingMessages: [
      ...((await request.userData.get('hangingMessages')) || []),
      { id: result.message_id, type: MSG_TYPES.provideCategory },
    ],
  });
};

export const createCategory = async (request) => {
  const categoryName = request.message.text.split(`\n`)[0].trim();
  let categoryDescription = '';
  if (request.message.text.indexOf('\n') !== -1) {
    categoryDescription = request.message.text.slice(request.message.text.indexOf('\n')).trim();
  }
  const categories = await request.userData.get('categories');
  if (categories.find((c) => c.name == categoryName)) {
    const { result } = await request.botRequest('sendMessage', {
      chat_id: request.message.chat.id,
      text: 'Category with this name already exists. Please provide different name',
      reply_markup: {
        inline_keyboard: [[{ text: 'cancel creation', callback_data: COMMANDS.cancelCreation }]],
      },
    });
    return request.userData.update({
      hangingMessages: [
        ...(await request.userData.get('hangingMessages')),
        { id: result.message_id, type: MSG_TYPES.nameExists },
      ],
    });
  } else {
    categories.push({ name: categoryName, description: categoryDescription, cards: [], selected: true });
    const hangingMessages = await request.userData.get('hangingMessages');
    for (const msg of hangingMessages.filter((t) =>
      [MSG_TYPES.nameExists, MSG_TYPES.provideCategory].includes(t.type),
    )) {
      await request.botRequest('deleteMessage', {
        chat_id: request.message.chat.id,
        message_id: msg.id,
      });
    }

    await request.userData.update({
      categories,
      state: '',
      hangingMessages: hangingMessages.filter(
        (t) => ![MSG_TYPES.nameExists, MSG_TYPES.provideCategory].includes(t.type),
      ),
    });
    return sendCategorySelectedMessage(request, request.message.chat.id);
  }
};

export const cancelCreation = async (request) => {
  const hangingMessages = await request.userData.get('hangingMessages');
  for (const msg of hangingMessages.filter((t) => [MSG_TYPES.nameExists, MSG_TYPES.provideCategory].includes(t.type))) {
    await request.botRequest('deleteMessage', {
      chat_id: request.callbackQuery.message.chat.id,
      message_id: msg.id,
    });
  }

  await request.userData.update({
    state: '',
    hangingMessages: ((await request.userData.get('hangingMessages')) || []).filter(
      (t) => ![MSG_TYPES.nameExists, MSG_TYPES.provideCategory].includes(t.type),
    ),
  });
};

export const sendCategorySelectedMessage = async (request, chatId) => {
  const categories = await request.userData.get('categories');
  const { result } = await request.botRequest('sendMessage', {
    chat_id: chatId,
    text: `Current category is *${
      categories.find((c) => c.selected).name
    }*. Send \`/list\ to get full list and select/add category, use buttons below for further actions`,
    parse_mode: 'MarkdownV2',
  });
  return request.botRequest('pinChatMessage', {
    chat_id: chatId,
    message_id: result.message_id,
    disable_notification: true,
  });
};
