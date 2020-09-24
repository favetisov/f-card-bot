import { CALLBACK_COMMAND } from '@src/enums/callback-command';
import { CommandRoute, MessageRoute } from '@src/tools/router';
import { PingController } from '@src/controllers/ping/ping.controller';
import { CategoryController } from '@src/controllers/category/category.controller';
import { STATE } from '@src/enums/state';
import { CardController } from '@src/controllers/card/card.controller';
import { LearnController } from '@src/controllers/learn/learn.controller';

export const routes: Array<MessageRoute | CommandRoute> = [
  { onMessage: '/ping', handler: PingController.ping },

  /** categories */
  { onMessage: new RegExp('/sel .+'), handler: CategoryController.inlineSwitchCategory },
  { onMessage: '/list', handler: CategoryController.list },
  { onCommand: CALLBACK_COMMAND.listCategories, handler: CategoryController.list },
  { onCommand: CALLBACK_COMMAND.createCategory, handler: CategoryController.onCreateCategory },
  { onCommand: CALLBACK_COMMAND.createCategoryCancel, handler: CategoryController.onCreateCategoryCancel },
  { onMessage: new RegExp('.+'), state: STATE.waitingForCategoryName, handler: CategoryController.createCategory },
  { onCommand: CALLBACK_COMMAND.selectCategory, handler: CategoryController.onSelectCategory },
  { onCommand: CALLBACK_COMMAND.editCategory, handler: CategoryController.onEditCategory },
  { onCommand: CALLBACK_COMMAND.editCategoryCancel, handler: CategoryController.onEditCategoryCancel },
  { onMessage: new RegExp('.+'), state: STATE.waitingForNewCategoryName, handler: CategoryController.editCategory },
  { onCommand: CALLBACK_COMMAND.deleteCategory, handler: CategoryController.onDeleteCategory },
  { onCommand: CALLBACK_COMMAND.deleteCategoryCancel, handler: CategoryController.onDeleteCategoryCancel },
  { onCommand: CALLBACK_COMMAND.deleteCategoryConfirm, handler: CategoryController.onDeleteCategoryConfirm },
  { onCommand: CALLBACK_COMMAND.showState, handler: CategoryController.onShowState },

  /** cards */
  { onCommand: CALLBACK_COMMAND.addCard, handler: CardController.onAddCard },
  { onCommand: CALLBACK_COMMAND.addCardCancel, handler: CardController.onAddCardCancel },
  { onMessage: new RegExp('/add .+'), handler: CardController.inlineAddQuestion },
  { onMessage: new RegExp('.+'), state: STATE.waitingForCardQuestion, handler: CardController.addCardQuestion },
  { onCommand: CALLBACK_COMMAND.addCardEmptyAnswer, handler: CardController.onLeaveEmptyAnswer },
  { onMessage: new RegExp('.+'), state: STATE.waitingForCardAnswer, handler: CardController.addCardAnswer },
  { onCommand: CALLBACK_COMMAND.editCardQuestion, handler: CardController.onCardQuestionEdit },
  { onCommand: CALLBACK_COMMAND.editCardQuestionCancel, handler: CardController.onCardQuestionEditCancel },
  { onMessage: new RegExp('.+'), state: STATE.waitingForNewCardQuestion, handler: CardController.setNewCardQuestion },
  { onCommand: CALLBACK_COMMAND.editCardAnswer, handler: CardController.onCardAnswerEdit },
  { onMessage: new RegExp('.+'), state: STATE.waitingForNewCardAnswer, handler: CardController.setNewCardAnswer },
  { onCommand: CALLBACK_COMMAND.deleteCard, handler: CardController.onCardDelete },
  { onCommand: CALLBACK_COMMAND.deleteCardCancel, handler: CardController.onCardDeleteCancel },
  { onCommand: CALLBACK_COMMAND.deleteCardConfirm, handler: CardController.onCardDeleteConfirm },

  /** learn */
  { onMessage: '/go', handler: LearnController.onShowNextCard },
  { onCommand: CALLBACK_COMMAND.showNextCard, handler: LearnController.onShowNextCard },
  { onCommand: CALLBACK_COMMAND.skipCard, handler: LearnController.onSkipCard },
  { onCommand: CALLBACK_COMMAND.showAnswer, handler: LearnController.onShowAnswer },
  { onCommand: CALLBACK_COMMAND.markAnswer, handler: LearnController.onMarkAnswer },
];
