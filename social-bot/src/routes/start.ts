import { Router } from 'express';
const start: Router = Router();
import { googleSigninUrl } from '../auth';

export default start;

start.get('/', (_req, res) => {
  res.redirect(googleSigninUrl);
});
