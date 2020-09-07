import { Request } from './models/request';
import { route } from './router';

export const onmessage = async (req, res) => {
  console.log(req, 'REQUEST 111');
  const request = new Request(req);
  await request.init();
  await route(request);
  res.send('ok');
};
