import { Router } from 'express';
const index: Router = Router();
import { signedIn, status } from '../state';

export default index;

index.get('/', (_req, res) => {
  signedIn ? res.send(status) : res.redirect('/start');
});
