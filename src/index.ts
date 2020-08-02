import { ping } from './middleware/ping';

export const onmessage = (req, res) => {
  const result = ping(req.body);
  res.send(result);
};
