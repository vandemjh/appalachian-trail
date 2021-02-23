import { Router } from 'express';
const start: Router = Router();
import { googleSigninUrl } from '../auth';

export default start;

start.get('/', (_req, res) => {
  res.redirect(
    `https://www.facebook.com/v9.0/dialog/oauth?` +
      `client_id=${process.env.FACEBOOK_CLIENT_ID}` +
      `&redirect_uri=${process.env.FACEBOOK_CALLBACK_URL}` +
      (process.env.FACEBOOK_STATE
        ? `&state=${process.env.FACEBOOK_STATE}`
        : ''),
  );
  // res.redirect(googleSigninUrl);
});
