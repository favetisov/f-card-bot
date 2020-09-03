import { existsSync, readFileSync } from 'fs';
import { Request } from '../models/request';
import { STATE } from '../tools/states';
import { LANGUAGE } from '../tools/language';
const fetch = require('node-fetch');

/**
 * mock class that emulates request object that is passed through the system
 * TO ENABLE TESTING USING ACTUAL TELEGRAM CALLS:
 *      1. write something to @f_cards_test_bot, then check bot's updates to retrieve chat_id of your conversation:
 *      https://api.telegram.org/bot1382487883:AAHw1-Bj3R9I6oDp2bV1g1ANTike5LzNoyE/getUpdates
 *      ^^^ open this link in browser,
 *      find your message, then copy id from `chat` object.
 *
 *      2. create file "environment.json" in this directory (/src/test-utils/), then put
 *        {
 *        "BOT_TOKEN": 1382487883:AAHw1-Bj3R9I6oDp2bV1g1ANTike5LzNoyE,
 *        "CHAT_ID": YOUR_CHAT_ID
 *        } *
 *        with your token and chat id values
 *
 *     3. [optional] to avoid possible collisions and to feel exclusive,
 *     you can register your own test bot by BotFather and repeat steps 1-2 with your token
 *
 *
 *  TO ENABLE TESTING USING ACTUAL FIRESTORE CALLS:
 *    1. not implemented yet :(
 */
export class RequestMock extends Request {
  env: { BOT_TOKEN?: string; CHAT_ID: number } = this.getEnv();

  user: any = {
    update: function (data) {
      for (const key in data) {
        this.data[key] = data[key];
      }
    },
    data: {
      language: LANGUAGE.ru,
      state: STATE.ready,
      tutorialCompleted: true,
      categories: [],
      hangingMessages: [],
    },
  };

  /** registering all bot calls */
  requestLog: Array<{ method; params; result }> = [];
  logCursor;

  /** clearing message and callback data to prepare new request. Also sets a cursor to log so countCalls
   * will count only calls from last run
   */
  refresh() {
    delete this.message;
    delete this.callbackQuery;
    this.logCursor = this.requestLog[this.requestLog.length - 1];
  }

  /** send request to bot. mocks request if BOT_TOKEN is not set in environment file */
  botRequest = async (method: string, params: Object): Promise<Object> => {
    let result: any = { ok: true };
    if (this.env.BOT_TOKEN) {
      const response = await fetch(`https://api.telegram.org/bot${this.env.BOT_TOKEN}/${method}`, {
        method: 'POST',
        body: JSON.stringify(params),
        headers: { 'Content-Type': 'application/json' },
      });
      result = await response.json();
      if (!result.ok) {
        console.error(
          'Bot call failed: ' +
            JSON.stringify(result) +
            `\n request method: \n` +
            method +
            `\n request params: \n` +
            JSON.stringify(params),
        );
      }
    } else {
      if (method == 'sendMessage') result.message_id = 1;
    }
    this.requestLog.push({ method, params, result });
    return result;
  };

  /** counting bot requests since last refresh call */
  countCalls(method) {
    const log = this.logCursor
      ? this.requestLog.slice(this.requestLog.findIndex((l) => l == this.logCursor) + 1)
      : this.requestLog;
    return log.filter((c) => c.method === method).length;
  }

  async cleanAll() {
    if (this.env.BOT_TOKEN) {
      for (const call of this.requestLog) {
        if (call.method == 'sendMessage') {
          await fetch(`https://api.telegram.org/bot${this.env.BOT_TOKEN}/deleteMessage`, {
            method: 'POST',
            body: JSON.stringify({ chat_id: this.env.CHAT_ID, message_id: call.result.result.message_id }),
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    }
  }

  private getEnv() {
    const envFilePath = __dirname + '/environment.json';
    if (existsSync(envFilePath)) {
      return JSON.parse(readFileSync(envFilePath).toString());
    } else {
      return { CHAT_ID: 1 };
    }
  }
}
