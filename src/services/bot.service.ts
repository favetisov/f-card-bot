import { environment } from '../environments/environment';
const fetch = require('node-fetch');

export const botRequest = async (method, params) => {
  const response = await fetch(`https://api.telegram.org/bot${environment.botToken}/${method}`, {
    method: 'POST',
    body: JSON.stringify(params),
    headers: { 'Content-Type': 'application/json' },
  });
  console.log(`https://api.telegram.org/bot${environment.botToken}/${method}`, params);
  const resp = response.json();
  console.log(resp);
  return resp;
};
