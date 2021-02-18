import { Router } from 'express';
const index: Router = Router();
import { signedIn } from '../state';

export default index;

index.get('/', (_req, res) => {
  signedIn ? res.send('Already signed in!') : res.redirect('/start');
});
