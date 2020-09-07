export enum STATE {
  notInitialized = 'not_initialized',
  ready = 'ready',
  waitingForWelcomeMessage = 'waiting_for_welcome_message',
  waitingForCategoryName = 'waiting_for_category_name',
  waitingForCardQuestion = 'waiting_for_card_question',
  waitingForCardAnswer = 'waiting_for_card_answer',
  waitingForNewCategoryName = 'waiting_for_new_category_name',
}
