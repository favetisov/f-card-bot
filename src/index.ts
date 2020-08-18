import { pingMiddleware } from './middleware/ping.middleware';
import { WebhookRequest } from './models/webhook-request';
import { Middleware } from './models/middleware';
import { noResponseMiddleware } from './middleware/no-response.middleware';
import { useCategoryMiddleware } from './middleware/use-category.middleware';

const middlewareChain: Middleware[] = [pingMiddleware, useCategoryMiddleware, noResponseMiddleware];

export const onmessage = async (req, res) => {
  const request = new WebhookRequest(req.body.message);
  for (let run of middlewareChain) {
    await run(request);
  }

  if (!request.answer) {
    throw new Error('No answer was assigned to request');
  }

  res.send(request.answer);
};
