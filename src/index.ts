import { Request } from './models/request';
import { route } from './router';

export const onmessage = async (req, res) => {
  const request = new Request(req.body);
  await request.init();
  await route(request);
  res.send('ok');
};
