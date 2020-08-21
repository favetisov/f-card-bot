import { pingMiddleware } from './middleware/ping.middleware';
import { WebhookRequest } from './models/webhook-request';
import { Middleware } from './models/middleware';
import { categoryMiddleware } from './middleware/category.middleware';
import { DocumentReference, Firestore } from '@google-cloud/firestore';
import { environment } from './environments/environment';
import { noResponseMiddleware } from './middleware/no-response.middleware';
const fetch = require('node-fetch');

const middlewareChain: Middleware[] = [pingMiddleware, categoryMiddleware, noResponseMiddleware];

const collection = new Firestore({
  projectId: 'f-cards-bot',
}).collection('f-cards-bot');

export const onmessage = async (req, res) => {
  const request = new WebhookRequest();
  request.message = req.body.message;
  request.callbackQuery = req.body.callback_query;
  setBotRequest(request);
  await setUserData(request);

  /** debug */
  const response = await request.botRequest('sendMessage', {
    chat_id: request.message?.chat.id,
    text:
      `i'm updated function5\n\n` +
      JSON.stringify((await request.userData.get()).data().state) +
      `\n\n` +
      JSON.stringify(request.message) +
      `\n\n` +
      JSON.stringify(request.callbackQuery),
  });

  for (let run of middlewareChain) {
    await run(request);
  }

  // /** remove this after deployment is completed */
  // if (!request.answer) {
  //   console.log('body', JSON.stringify(req.body));
  //   console.log('from', JSON.stringify(req.body.from));
  //   console.log('message', JSON.stringify(req.body.message));
  //   request.answer = {
  //     method: 'sendMessage',
  //     text: JSON.stringify(req.body),
  //     chat_id: req.body?.from?.chat?.id,
  //   };
  // }

  if (!request.answer) {
    throw new Error('No answer was assigned to request');
  }

  res.send(request.answer);
};

const setUserData = async (request: WebhookRequest) => {
  const key = 'chat_' + (request.message?.chat.id || request.callbackQuery?.message.chat.id);
  request.userData = await collection.doc(key);
  if ((await request.userData.get()).data().state === undefined) {
    await collection.doc(key).set({ state: '', categories: [], hangingMessages: [] });
    request.userData = await collection.doc(key);
  }
};

const setBotRequest = (request: WebhookRequest) => {
  request.botRequest = async (method, params) => {
    const response = await fetch(`https://api.telegram.org/bot${environment.botToken}/${method}`, {
      method: 'POST',
      body: JSON.stringify(params),
      headers: { 'Content-Type': 'application/json' },
    });
    console.log(`https://api.telegram.org/bot${environment.botToken}/${method}`, params);
    return response.json();
  };
};
