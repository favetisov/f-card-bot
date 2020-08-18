import { WebhookRequest } from './webhook-request';

export type Middleware = (req: WebhookRequest) => void;
