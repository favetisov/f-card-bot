import { COMMANDS } from './tools/commands';
import { Request } from './models/request';
import { PingController } from './controllers/ping.controller';
import { StartController } from './controllers/start.controller';
import { LanguageController } from './controllers/language.controller';
import { CategoryController } from './controllers/category.controller';
import { STATE } from './tools/states';
import { CardController } from './controllers/card.controller';
import { LearnController } from './controllers/learn.controller';

export const route = async (request: Request): Promise<any> => {
  const text = request.message?.text;
  const command = request.callbackQuery?.data;
  // if (request.user.data.state === STATE.ready) {
  if (command) {
    if (command === COMMANDS.createCategory) {
      return CategoryController.onCreateCategory(request);
    } else if (command === COMMANDS.cancelCategoryCreation) {
      return CategoryController.cancelCategoryCreation(request);
    } else if (command.indexOf(COMMANDS.selectCategory) === 0) {
      return CategoryController.selectCategory(request);
    } else if (command.indexOf(COMMANDS.selectLanguage) === 0) {
      return LanguageController.selectLanguage(request);
    } else if (command === COMMANDS.skipCard) {
      return LearnController.showCard(request);
    } else if (command === COMMANDS.showAnswer) {
      return LearnController.showAnswer(request);
    } else if (command.indexOf(COMMANDS.markAnswer) === 0) {
      return LearnController.markAnswer(request);
    } else if (command === COMMANDS.startLearning) {
      return LearnController.showCard(request);
    } else if (command === COMMANDS.changeCategory) {
      return CategoryController.listCategories(request);
    } else if (command === COMMANDS.addCard) {
      return CardController.onAddCard(request);
    }
  } else if (text) {
    if (text === '/ping') {
      return PingController.ping(request);
    } else if (text === '/start') {
      return StartController.onStartMessage(request);
    } else if (text === '/lang') {
      return LanguageController.sendLanguageMessage(request);
    } else if (text === '/list') {
      return CategoryController.listCategories(request);
    } else if (text === '/info') {
      return CategoryController.getCurrentState(request);
    } else if (text === '/go') {
      return LearnController.showCard(request);
    } else if (text === '/add') {
      return CardController.onAddCard(request);
    } else {
      if (request.user.data.state === STATE.waitingForCategoryName) {
        return CategoryController.createCategory(request);
      } else if (request.user.data.state === STATE.waitingForCardQuestion) {
        return CardController.addCardQuestion(request);
      } else if (request.user.data.state === STATE.waitingForCardAnswer) {
        return CardController.addCardAnswer(request);
      }
      // chatting in incorrect state
    }
  }
  // } else if (request.user.data.state === STATE.waitingForWelcomeMessage) {
  //   send welcome message
  // }
};
