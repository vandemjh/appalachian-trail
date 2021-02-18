import { Router } from 'express';
import { getToken } from '../auth';
import { signIn } from '../state';
import getPhotos from '../request';

const callback: Router = Router();

callback.get('/', async (req, res) => {
  const code: string = req.query.code as string;
  const token = await getToken(code);
  const data = await getPhotos(token, 'albums');
  signIn();
  res.send(data);
});

export default callback;
