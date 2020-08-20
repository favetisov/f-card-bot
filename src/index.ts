import { pingMiddleware } from './middleware/ping.middleware';
import { WebhookRequest } from './models/webhook-request';
import { Middleware } from './models/middleware';
import { categoryMiddleware } from './middleware/category.middleware';
import { DocumentReference, Firestore } from '@google-cloud/firestore';

const middlewareChain: Middleware[] = [pingMiddleware, categoryMiddleware];

const collection = new Firestore({
  projectId: 'f-cards-bot',
}).collection('f-cards-bot');

export const onmessage = async (req, res) => {
  const request = new WebhookRequest();
  request.message = req.body.message;
  request.callbackQuery = req.body.callback_query;
  await setUserData(request);

  for (let run of middlewareChain) {
    await run(request);
  }

  /** remove this after deployment is completed */
  if (!request.answer) {
    console.log('body', JSON.stringify(req.body));
    console.log('from', JSON.stringify(req.body.from));
    console.log('message', JSON.stringify(req.body.message));
    request.answer = {
      method: 'sendMessage',
      text: JSON.stringify(req.body),
      chat_id: req.body?.from?.chat?.id,
    };
  }

  if (!request.answer) {
    throw new Error('No answer was assigned to request');
  }

  res.send(request.answer);
};

const setUserData = async (request: WebhookRequest): Promise<DocumentReference> => {
  const key = 'chat_' + (request.message?.chat.id || request.callbackQuery?.message.chat.id);
  request.userData = await collection.doc(key);
  if (request.userData) {
    return request.userData;
  } else {
    await collection.doc(key).set({ state: '', categories: [] });
    return collection.doc(key);
  }
};
