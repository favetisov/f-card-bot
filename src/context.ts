import { Message, Update } from 'telegram-typings';
import { Session } from './session/session';
import { LANGUAGE } from './enums/language';
import { extractButtonData } from './tools/button';

export class Context {
  update: Update & {
    chatId: number;
    callbackData?: { message: Message; command: string; parameters: string; clickReport: string };
  };

  constructor(public session: Session<any>) {}

  async setUpdate(update: Update) {
    this.parseUpdate(update);
    await this.initSession();
    await this.defineLanguage();
  }

  get sessionKey() {
    return 'chat_' + this.update.chatId;
  }

  private parseUpdate(update: Update) {
    this.update = Object.assign(update, {
      chatId: update.message?.chat.id || update.callback_query?.message?.chat.id || 0,
    });
    if (update.callback_query?.data && update.callback_query.message) {
      this.update.callbackData = Object.assign(
        { message: update.callback_query.message },
        extractButtonData(this.update.callback_query?.data),
      );
    }
  }

  private async initSession() {
    await this.session.load('chat_' + this.update.chatId);
  }

  private async defineLanguage() {
    if (!this.session.data) {
      throw new Error('Cannot define language - you should initialize session first');
    }
    if (!this.session.data.language || this.session.data.language === LANGUAGE.unknown) {
      const updateLanguage =
        this.update.message?.from?.language_code ||
        this.update.callback_query?.message?.from?.language_code ||
        LANGUAGE.unknown;
      await this.session.update('chat_' + this.update.chatId, { language: updateLanguage });
    }
  }
}
