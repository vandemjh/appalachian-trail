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
    album
      .getPictures()
      .then(() => {
        album.refreshUnpostedUrls();
        var mediaItemsNotPosted: Picture[] = album.mediaItems.filter(
          (p) =>
            !p?.postedToFB &&
            validFacebookMimeTypes.filter((m) => p?.mimeType.includes(m))
              .length > 0,
        );
        const post = async () =>
          new Promise((res, rej) =>
            mediaItemsNotPosted.forEach((pic) => {
              postPicture(pic.fullSizeUrl, facebookPageAccessToken, false)
                .then((id) => {
                  pic.fbId = id;
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
        post().then(() => {
          if (ids.length > 0) {
            var dates = mediaItemsNotPosted
              .map((p) => p.mediaMetadata.creationTime)
              .sort((a, b) => b?.getTime() - a?.getTime());
            var datesByDay: object = {};
            dates.forEach(
              (d: Date) =>
                ((datesByDay as any)[d.toLocaleDateString('en-US')] = []),
            );
            mediaItemsNotPosted.forEach((m) =>
              (datesByDay as any)[
                m.mediaMetadata.creationTime.toLocaleDateString('en-US')
              ].push(m),
            );
            var promises: Promise<object>[] = [];
            Object.keys(datesByDay).forEach((e) => {
              promises.push(
                new Promise((res, rej) => {
                  postMultiPhoto(
                    e,
                    (datesByDay as any)[e].map((m: Picture) => m.fbId),
                  )
                    .then((i: any) => {
                      if (i?.id) res(i.id);
                      else rej(i);
                    })
                    .catch((e) => console.log(e));
                }),
              );
            });
            (async (p: Promise<object>[]) => {
              for (let pr of p)
                updateStatus(`Posted multiphoto post to FB: ${await pr}`);
            })(promises).then(() => {
              album.mediaItems.forEach((el) =>
                mediaItemsNotPosted.forEach((ele) =>
                  el?.id === ele?.id ? (el.postedToFB = true) : null,
                ),
              );
            });
          }
        });
      })
      .then(() => album.writeFile())
      .catch((e) => console.log(e));
  }, parseInt(process.env.INTERVAL as string) * 1000);
}
