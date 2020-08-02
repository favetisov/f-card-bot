import { ping } from './middleware/ping';

export const onmessage = (req, res) => {
  const result = ping(req.body.message);
  res.send(result);
};
