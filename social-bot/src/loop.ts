import { Picture } from './model/picture';
import {
  postAlbum,
  postMultiPhoto,
  postPicture,
  validFacebookMimeTypes,
} from './routes/facebook';
import { album, facebookPageAccessToken, updateStatus } from './state';

export default function start() {
  setInterval(() => {
    var mediaItemsNotPosted: Picture[] = [];
    album
      .getPictures()
      .then(() => {
        album.refreshUnpostedUrls();
        mediaItemsNotPosted = album.mediaItems.filter(
          (p) =>
            !p?.postedToFB &&
            validFacebookMimeTypes.filter((m) => p?.mimeType.includes(m))
              .length > 0,
        );
        if (mediaItemsNotPosted.length > 0) {
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
                var d = new Date();
                d.setMinutes(d.getMinutes() + 60);
                d.setMinutes(0, 0, 0);
                postAlbum(e, (datesByDay as any)[e], false, d)
                  .then((i: any) => {
                    if (i?.id) res(i.id);
                    else rej(i);
                  })
                  .catch((e) => updateStatus(e));
              }),
            );
          });
          (async (p: Promise<object>[]) => {
            for (let pr of p) updateStatus(`Posted album to FB: ${await pr}`);
          })(promises)
            .then(() => {
              album.mediaItems.forEach((el) =>
                mediaItemsNotPosted.forEach((ele) =>
                  el?.id === ele?.id ? (el.postedToFB = true) : null,
                ),
              );
            })
            .catch((e) => updateStatus(e));
        }
      })
      .then(() => album.writeFile())
      .catch((e) => updateStatus(e));
  }, parseInt(process.env.INTERVAL as string) * 1000 * 60);
}
