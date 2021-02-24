import { Router } from 'express';
import start from '../loop';
import { request } from '../request';
import { setFacebookPageAccessToken, updateStatus } from '../state';
const facebook: Router = Router();

export default facebook;

facebook.get('/', async (req, res) => {
  try {
    const state: string = req.query.state as string;
    const code: string = req.query.code as string;
    if (state !== process.env.FACEBOOK_STATE)
      throw new Error('Invalid state supplied');
    if (!code) throw new Error('No code supplied!');
    updateStatus('Facebook signed in');
    var token = await request(
      'GET',
      'graph.facebook.com',
      `/v9.0/oauth/access_token?` +
        `client_id=${process.env.FACEBOOK_CLIENT_ID}` +
        `&redirect_uri=${process.env.FACEBOOK_CALLBACK_URL}` +
        `&client_secret=${process.env.FACEBOOK_SECRET}` +
        `&code=${code}`,
    );
    if (!(token as any)?.access_token) throw new Error('No token supplied!');
    token = (token as any).access_token;
    let fb =
      `/v9.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${process.env.FACEBOOK_CLIENT_ID}&` +
      `client_secret=${process.env.FACEBOOK_SECRET}&` +
      `fb_exchange_token=${token}`;
    var longLivedToken = await request('GET', 'graph.facebook.com', fb);
    if (!(longLivedToken as any)?.access_token)
      throw new Error('No long lived token supplied!');
    longLivedToken = (longLivedToken as any).access_token;
    var pageToken = await request(
      'GET',
      'graph.facebook.com',
      `/v9.0/${process.env.FACEBOOK_PAGE_ID}?fields=access_token&access_token=${longLivedToken}`,
    );
    if (!(pageToken as any)?.access_token)
      throw new Error('No page token supplied!');
    var pageAccessToken: string = (pageToken as any).access_token;
    setFacebookPageAccessToken(pageAccessToken);
    updateStatus('Facebook page token retreived');
    start();
    res.redirect('/');
  } catch (e) {
    console.log(e);
    res.send(e.message);
  }
});

export async function postPicture(
  accessToken: string,
  url: string,
  published?: boolean,
): Promise<string> {
  return new Promise((res, rej) =>
    request('POST', 'graph.facebook.com', '/me/photos', undefined, undefined, {
      url: url,
      published: published,
      access_token: accessToken,
    })
      .catch((e) => rej(e))
      .then((r) => res((r as any).id)),
  );
}
