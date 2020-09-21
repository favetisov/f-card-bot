import { Context } from '@src/context';
import { STATE } from '@src/enums/state';
import { send } from '@src/bot';
import { CardMessages as msg } from '@src/controllers/card/card.messages';
import { CategoryMessages } from '@src/controllers/category/category.messages';
import { LearnMessages } from '@src/controllers/learn/learn.messages';

export const CardController = {
  /**
   * 'add card' button clicked
   * @param context
   */
  onAddCard: async (context: Context) => {
    await Promise.all([
      context.session.update(context.sessionKey, { state: STATE.waitingForCardQuestion }),
      send(context, msg.provideQuestion(context)),
    ]);
  },

  /**
   * card creation canceled
   * @param context
   */
  onAddCardCancel: async (context: Context) => {
    await Promise.all([
      context.session.update(context.sessionKey, { state: STATE.waitingForCardQuestion }),
      send(context, CategoryMessages.state(context)),
    ]);
  },

  /**
   * typed '/add ${question}'
   * @param context
   */
  inlineAddQuestion: async (context: Context) => {
    if (context.update.message?.text) {
      context.update.message.text = context.update.message.text.replace(/\s\s+/g, ' ').split('/add ')[1];

      // provided category key
      if (context.update.message.text.startsWith('-c')) {
        const [_, categoryName, question] = context.update.message.text.split(' ');
        context.update.message.text = question;
        const categories = context.session.data.categories;
        const category = categories.find((c) => c.name.toLowerCase().includes(categoryName.toLowerCase()));
        if (category) {
          const categories = context.session.data.categories.map((c) =>
            Object.assign(c, { selected: c.name === category.name }),
          );
          await context.session.update(context.sessionKey, { categories });
        } else {
          // todo send 'cat not found message'
        }
      }
      await CardController.addCardQuestion(context);
    }
  },

  /**
   * received message with card question
   * @param context
   */
  addCardQuestion: async (context: Context) => {
    const text = context.update.message?.text?.trim();
    if (!text) {
      await send(context, msg.incorrectQuestionFormat(context));
    } else {
      const question = { text };
      const category = context.session.data.categories.find((c) => c.selected);
      const cardId = Math.max(...category.cards.map((c) => c.id), 0) + 1;
      category.cards.push({
        id: cardId,
        question: question,
        editing: true,
        answer: null,
        attempts: [],
      });
      await Promise.all([
        context.session.update(context.sessionKey, {
          categories: context.session.data.categories,
          state: STATE.waitingForCardAnswer,
        }),
        send(context, msg.provideAnswer(context, cardId)),
      ]);
    }
  },

  /**
   * 'leave answer empty' button clicked
   * @param context
   */
  onLeaveEmptyAnswer: async (context: Context) => {
    const cardId = context.update.callbackData?.parameters['cardId'];
    const card = context.session.data.categories.find((c) => c.selected)?.cards.find((c) => c.id == cardId);
    if (card) {
      card.editing = false;
      delete card.answer;
      await Promise.all([
        context.session.update(context.sessionKey, { categories: context.session.data.categories, state: STATE.ready }),
        send(context, CategoryMessages.state(context)),
      ]);
    }
  },

  /**
   * received card answer message
   * @param context
   */
  addCardAnswer: async (context: Context) => {
    const text = context.update.message?.text?.trim();
    const card = context.session.data.categories.find((c) => c.selected)?.cards.find((c) => c.editing === true);
    if (!text || !card) {
      await send(context, msg.incorrectAnswerFormat(context));
    } else {
      card.editing = false;
      card.answer = { text };
      await Promise.all([
        context.session.update(context.sessionKey, { categories: context.session.data.categories, state: STATE.ready }),
        send(context, CategoryMessages.state(context)),
      ]);
    }
  },

  /**
   * 'edit card question' button clicked
   * @param context
   */
  onCardQuestionEdit: async (context: Context) => {
    const cardId = context.update.callbackData?.parameters['cardId'];
    const card = context.session.data.categories.find((c) => c.selected)?.cards.find((c) => c.id == cardId);
    card.editing = true;
    await Promise.all([
      context.session.update(context.sessionKey, {
        categories: context.session.data.categories,
        state: STATE.waitingForNewCardQuestion,
      }),
      send(context, msg.provideNewQuestion(context, card)),
    ]);
  },

  /**
   * received new card question message
   * @param context
   */
  setNewCardQuestion: async (context: Context) => {
    const card = context.session.data.categories.find((c) => c.selected)?.cards.find((c) => c.editing === true);
    if (card) {
      const text = context.update.message?.text?.trim();
      const entities = context.update.message?.entities;
      if (!text) {
        await send(context, msg.incorrectNewQuestionFormat(context));
      } else {
        card.question = { text, entities };
        card.editing = false;
        await Promise.all([
          context.session.update(context.sessionKey, {
            categories: context.session.data.categories,
            state: STATE.waitingForNewCardAnswer,
          }),
          send(context, LearnMessages.question(context, card)),
        ]);
      }
    }
  },

  /**
   * cancelling editing when waiting for new question
   * @param context
   */
  onCardQuestionEditCancel: async (context: Context) => {
    const cardId = context.update.callbackData?.parameters['cardId'];
    const card = context.session.data.categories.find((c) => c.selected)?.cards.find((c) => c.id == cardId);
    if (card) {
      card.editing = false;
      await Promise.all([
        context.session.update(context.sessionKey, { categories: context.session.data.categories, state: STATE.ready }),
        send(context, CategoryMessages.state(context)),
      ]);
    }
  },

  /**
   * 'edit card question' button clicked
   * @param context
   */
  onCardAnswerEdit: async (context: Context) => {
    const cardId = context.update.callbackData?.parameters['cardId'];
    const card = context.session.data.categories.find((c) => c.selected)?.cards.find((c) => c.id == cardId);
    card.editing = true;
    await Promise.all([
      context.session.update(context.sessionKey, {
        state: STATE.waitingForNewCardAnswer,
        categories: context.session.data.categories,
      }),
      send(context, msg.provideNewAnswer(context)),
    ]);
  },

  /**
   * received new card answer message
   * @param context
   */
  setNewCardAnswer: async (context: Context) => {
    const text = context.update.message?.text?.trim();
    const card = context.session.data.categories.find((c) => c.selected)?.cards.find((c) => c.editing === true);
    if (!text || !card) {
      await send(context, msg.incorrectNewAnswerFormat(context));
    } else {
      card.editing = false;
      card.answer = { text };
      await Promise.all([
        context.session.update(context.sessionKey, { categories: context.session.data.categories, state: STATE.ready }),
        send(context, CategoryMessages.state(context)),
      ]);
    }
  },

  /**
   * 'delete card' button clicked
   * @param context
   */
  onCardDelete: async (context: Context) => {
    await send(context, msg.confirmCardRemoval(context));
  },

  /**
   * 'cancel card removal' button clicked
   * @param context
   */
  onCardDeleteCancel: async (context: Context) => {
    await send(context, CategoryMessages.state(context));
  },

  /**
   * 'confirm card removal' button clicked
   * @param context
   */
  onCardDeleteConfirm: async (context: Context) => {
    const category = context.session.data.categories.find((c) => c.selected);
    const cardId = context.update.callbackData?.parameters['cardId'];
    category.cards = category.cards.find((c) => c.id != cardId);

    if (category) {
      await Promise.all([
        context.session.update(context.sessionKey, {
          categories: context.session.data.categories,
        }),
        send(context, CategoryMessages.state(context)),
      ]);
    }
  },
};
