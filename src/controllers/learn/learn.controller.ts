import { Context } from '@src/context';
import { LearnMessages as msg } from './learn.messages';
import { send } from '@src/bot';
import { STATE } from '@src/enums/state';
import { Card } from '@src/models/card';
import { last, sortBy } from 'lodash';

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

  /**
   * on 'skip card' button click
   * @param context
   */
  onSkipCard: async (context: Context) => {
    const cardId = context.update.callbackData?.parameters['cardId'];
    const card = context.session.data.categories.find((c) => c.selected)?.cards.find((c) => c.id == cardId);
    const mark = null;
    if (card) {
      card.attempts.push({ timestamp: new Date().getTime(), mark });
      await context.session.update(context.sessionKey, { categories: context.session.data.categories });
      await LearnController.onShowNextCard(context);
    }
  },
};

const defineCardToDisplay = (context: Context) => {
  const category = context.session.data.categories.find((c) => c.selected);
  const cards: Card[] = category?.cards || [];
  const getScore = (card) => {
    const NO_ANSWER_WEIGHT = -1000;
    const SKIP_WEIGHT = 2000;
    let score: number;
    if (!card.attempts?.length) {
      score = NO_ANSWER_WEIGHT + Math.random();
    } else {
      const attemptsSum = (card.attempts || []).reduce((sum, att) => sum + att.mark ?? 0, 1);
      const lastAttemptMark = last(card.attempts).mark;
      const diff = new Date().getTime() - Math.max(...card.attempts.map((a) => a.timestamp));
      const diffDays = diff / (1000 * 60 * 60 * 24);
      const reduceScore = (2 - lastAttemptMark) * diffDays;
      score = (attemptsSum - reduceScore) * Math.random();
    }
    if (last(card.attempts || [])?.mark === null) score += SKIP_WEIGHT;
    return score;
  };

  const sortedCards = sortBy(cards, getScore);

  return sortedCards[0];
};
