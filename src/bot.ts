const fetch = require('node-fetch');
import { environment } from './environments/environment';
import { Message } from 'telegram-typings';
import { Context } from './context';

export const send = async (context: Context, message): Promise<{ ok: boolean; result: Message }> => {
  const response = await botCall('sendMessage', message);
  if (!response.result) {
    console.error(response);
    throw new Error('failed to send message');
  }
  await context.session.update('chat_' + context.update.chatId, { lastMessage: response.result });
  return response;
};

export const edit = async (message): Promise<{ ok: boolean; result: Message }> => {
  const response = await botCall('editMessageText', message);
  if (!response.result) {
    console.error(response);
    throw new Error('failed to edit message');
  }
  return response;
};

/**
 * Native bot call
 * @param method
 * @param params
 */
export const botCall = async (method: string, params: Record<string, any>) => {
  const response = await fetch(`https://api.telegram.org/bot${environment.botToken}/${method}`, {
    method: 'POST',
    body: JSON.stringify(params),
    headers: { 'Content-Type': 'application/json' },
  });
  const resp = await response.json();
  return resp;
};
