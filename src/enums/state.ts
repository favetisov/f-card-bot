export enum STATE {
  notInitialized = 'not_initialized',
  ready = 'ready',
  waitingForWelcomeMessage = 'waiting_for_welcome_message',
  waitingForCategoryName = 'waiting_for_category_name',
  waitingForNewCategoryName = 'waiting_for_new_category_name',
  waitingForCardQuestion = 'waiting_for_card_question',
  waitingForCardAnswer = 'waiting_for_card_answer',
  waitingForNewCardQuestion = 'waiting_for_new_card_question',
  waitingForNewCardAnswer = 'waiting_for_new_card_answer',
}
