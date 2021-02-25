import { Picture } from './model/picture';
import request from './request';
import {
  postMultiPhoto,
  postPicture,
  validFacebookMimeTypes,
} from './routes/facebook';
import { album, facebookPageAccessToken, updateStatus } from './state';

export default function start() {
  setInterval(() => {
    var ids: Array<string> = [];
    album.refreshUnpostedUrls();
    var mediaItemsNotPosted = album.mediaItems.filter(
      (p) =>
        !p?.postedToFB &&
        validFacebookMimeTypes.filter((m) => p?.mimeType.includes(m)).length >
          0,
    );
    const post = async () =>
      new Promise((res, rej) =>
        mediaItemsNotPosted.forEach((pic) => {
          postPicture(pic.fullSizeUrl, facebookPageAccessToken, false)
            .then((id) => {
              updateStatus('Posted to FB: ' + id);
              ids.push(id);
              if (ids.length == mediaItemsNotPosted.length) res(ids);
            })
            .catch((e) => {
              console.log(e);
              rej(e);
            });
        }),
      );
    post()
      .then(() => {
        if (ids.length > 0) {
          postMultiPhoto(
            new Date(
              mediaItemsNotPosted[0].mediaMetadata.creationTime,
            ).toLocaleString(),
            ids,
          )
            .then((i: any) => {
              if (i?.id) updateStatus('Posted multiphoto post to FB: ' + i.id);
              else console.log(i);
            })
            .catch((e) => console.log(e));
          album.mediaItems = (album.mediaItems.map((e) =>
            mediaItemsNotPosted.forEach((i) =>
              e?.id === i?.id ? (e.postedToFB = true) : undefined,
            ),
          ) as unknown) as Picture[];
        }
      })
      .catch((e) => console.log(e));
  }, parseInt(process.env.INTERVAL as string) * 1000);
}
