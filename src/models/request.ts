import { DocumentReference, Firestore } from '@google-cloud/firestore';
import { STATE } from '../tools/states';
import { botRequest } from '../services/bot.service';
import { Message } from './message';
import { CallbackQuery } from './callback-query';
import { Category } from './category';
import { LANGUAGE } from '../tools/language';

const collection = new Firestore({
  projectId: 'f-cards-bot',
}).collection('f-cards-bot');

export class Request {
  message: Message;
  callbackQuery: CallbackQuery;
  user: {
    docRef: DocumentReference<any>;
    data: {
      language: LANGUAGE;
      tutorialCompleted: boolean;
      currentCardId?: number | null;
      state: STATE;
      categories: Category[];
      hangingMessages: Array<{ id: number; type: string }>;
    };
    update: (data: any) => Promise<any>;
  };
  botRequest: (method: string, params: any) => Promise<any>;

  get chatId(): number {
    return this.message?.chat.id || this.callbackQuery.message.chat.id;
  }

  constructor(webhookRequest) {
    this.message = webhookRequest.message;
    this.callbackQuery = webhookRequest.callbackQuery;
    this.botRequest = botRequest;
  }

  async init() {
    const key = 'chat_' + this.chatId;
    let user = await this.loadUserData(key);
    if (user.data.state === STATE.notInitialized) {
      await collection.doc(key).set({
        language: LANGUAGE.en,
        tutorialCompleted: false,
        state: STATE.ready,
        categories: [],
        hangingMessages: [],
      });
      user = await this.loadUserData(key);
    }
    this.user = user;
  }

  private async loadUserData(key) {
    const docRef = await collection.doc(key);
    const data = Object.assign(
      {
        language: LANGUAGE.en,
        tutorialCompleted: false,
        state: STATE.notInitialized,
        categories: [],
        hangingMessages: [],
      },
      (await docRef.get()).data(),
    );
    return {
      docRef,
      data,
      update: async function (data) {
        await this.docRef.update(data);
        for (const key in data) {
          this.data[key] = data[key];
        }
      },
    };
  }
}
