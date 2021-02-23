import { Router } from 'express';
import { request } from '../request';
const facebook: Router = Router();

export default facebook;

facebook.get('/', async (req, res) => {
  try {
    const state: string = req.query.state as string;
    const code: string = req.query.code as string;
    if (state !== process.env.FACEBOOK_STATE)
      throw new Error('Invalid state supplied');
    if (!code) throw new Error('No code supplied!');
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
    // await (async (ms: number) =>
    // new Promise((res) => setTimeout(() => res(true), ms)))(10000);
    var longLivedToken = await request('GET', 'graph.facebook.com', fb);
    if (!(longLivedToken as any)?.access_token)
      throw new Error('No long lived token supplied!');
    longLivedToken = (longLivedToken as any).access_token;
    var userId = await request(
      'GET',
      'graph.facebook.com',
      `/me?fields=id,name&access_token=${longLivedToken}`,
    );
    console.log(userId);
    longLivedToken = (longLivedToken as any).access_token;
    var pageToken = await request(
      'GET',
      'graph.facebook.com',
      `/v9.0/${process.env.FACEBOOK_PAGE_ID}/accounts?access_token=${longLivedToken}`,
    );
    res.send(pageToken);
  } catch (e) {
    console.log(e);
    res.send(e.message);
  }
});
