import { Context } from '@src/context';
import { LearnMessages as msg } from './learn.messages';
import { send } from '@src/bot';
import { STATE } from '@src/enums/state';

export const LearnController = {
  /**
   * Showing next card in learning chain
   * @param context
   */
  onShowNextCard: async (context: Context) => {
    const card = defineCardToDisplay(context);
    if (card) {
      await Promise.all([
        context.session.update(context.sessionKey, { currentCardId: card.id, state: STATE.ready }),
        send(context, msg.question(context, card)),
      ]);
    }
  },

  /**
   * 'show answer' button clicked
   * @param context
   */
  onShowAnswer: async (context: Context) => {
    const cardId = context.update.callbackData?.parameters['cardId'];
    const card = context.session.data.categories.find((c) => c.selected)?.cards.find((c) => c.id == cardId);
    if (card && card.answer) {
      await send(context, msg.answer(context, card));
    }
  },

  /**
   * one of 'mark answer' buttons clicked
   * @param context
   */
  onMarkAnswer: async (context: Context) => {
    const cardId = context.update.callbackData?.parameters['cardId'];
    const card = context.session.data.categories.find((c) => c.selected)?.cards.find((c) => c.id == cardId);
    const mark = parseInt(context.update.callbackData?.parameters['mark']);
    if (card) {
      card.attempts.push({ timestamp: new Date().getTime(), mark });
      await context.session.update(context.sessionKey, { categories: context.session.data.categories });
      await LearnController.onShowNextCard(context);
    }
  },
};

const defineCardToDisplay = (context: Context) => {
  const category = context.session.data.categories.find((c) => c.selected);
  const cards = category?.cards || [];
  const card = cards[Math.round(Math.random() * (cards.length - 1))];
  return card;
};
