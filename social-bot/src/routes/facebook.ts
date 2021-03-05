import { Router } from 'express';
import start from '../loop';
import { Picture } from '../model/picture';
import request from '../request';
import {
  facebookPageAccessToken,
  setFacebookPageAccessToken,
  updateStatus,
} from '../state';
const facebook: Router = Router();

export default facebook;

export const validFacebookMimeTypes = ['jpeg', 'bmp', 'png', 'gif', 'tiff'];

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
    var verified: any = await request(
      'GET',
      'graph.facebook.com',
      `/v9.0/me?fields=id&access_token=${longLivedToken}`,
    );
    if (!verified?.error) updateStatus('Verified validity of FB token');
    else throw new Error(verified.error.message);
    start();
    res.redirect('/');
  } catch (e) {
    updateStatus(e);
    res.send(e.message);
  }
});

export async function postPicture(
  picture: Picture,
  accessToken: string,
  published?: boolean,
): Promise<string> {
  return new Promise((res, rej) =>
    request(
      'POST',
      'graph.facebook.com',
      `/me/photos?` +
        `url=${picture.fullSizeUrl}` +
        (picture.description
          ? `&caption=${picture.mediaMetadata.creationTime.toLocaleDateString(
              'en-US',
            )} - day ${
              (new Date(2021, 6, 3).getTime() -
                picture.mediaMetadata.creationTime.getTime()) /
              (1000 * 60 * 60 * 24)
            }${picture.description}`
          : '') +
        `&published=${published}` +
        `&access_token=${accessToken}`,
    )
      .then((r: any) => {
        if (r?.error) rej(r);
        res((r as any).id);
      })
      .catch((e: any) => rej(e)),
  );
}

export async function postMultiPhoto(
  message: string,
  ids: Array<string>,
  published?: boolean,
  scheduledPublishTime?: Date,
) {
  return new Promise((res, rej) =>
    request(
      'POST',
      'graph.facebook.com',
      `/me/feed?message=${message}&attached_media=${JSON.stringify(
        ids.map((i) => ({ media_fbid: i })),
      )}` +
        (!published && scheduledPublishTime
          ? `&published=${published}&scheduled_publish_time=${
              scheduledPublishTime?.getTime() / 1000
            }&unpublished_content_type=SCHEDULED`
          : '') +
        `&access_token=${facebookPageAccessToken}`,
    )
      .then((ret: any) => {
        if (ret?.error) rej(ret);
        res(ret);
      })
      .catch((e) => rej(e)),
  );
}

export async function postAlbum(
  albumName: string,
  pictures: Array<Picture>,
  published?: boolean,
  scheduledPublishTime?: Date,
) {
  return new Promise(async (res, rej) => {
    var albumId = await request(
      'POST',
      'graph.facebook.com',
      `/me/albums?name=${albumName}&access_token=${facebookPageAccessToken}`,
    );
    if ((albumId as any)?.error) rej(albumId);
    albumId = (albumId as any).id;
    pictures.forEach((pic) =>
      request(
        'POST',
        'graph.facebook.com',
        `/${albumId}/photos?caption=${albumName}&url=${pic.fullSizeUrl}` +
          (!published && scheduledPublishTime
            ? `&published=${published}&scheduled_publish_time=${scheduledPublishTime?.getTime()}`
            : '') +
          `&access_token=${facebookPageAccessToken}`,
      )
        .then((ret: any) => {
          if (ret?.error) rej(ret);
          res(ret);
        })
        .catch((e) => rej(e)),
    );
  });
}
