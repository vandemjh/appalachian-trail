import { Router } from 'express';
const start: Router = Router();
import auth from '../auth';

export default start;

start.get('/', (_req, res) => {
  res.redirect(auth);
});
