import { Picture } from './model/picture';
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
        album.refreshUnpostedUrls().then(() => {
          var mediaItemsNotPosted: Picture[] = album.mediaItems.filter(
            (p) =>
              !p?.postedToFB &&
              validFacebookMimeTypes.filter((m) => p?.mimeType.includes(m))
                .length > 0,
          );
          console.log(mediaItemsNotPosted);
          var promises = ((pictures: Picture[]): Promise<string>[] => {
            var toReturn: Promise<string>[] = [];
            pictures.forEach((pic) => {
              toReturn.push(
                new Promise((res, rej) =>
                  postPicture(pic, facebookPageAccessToken, true)
                    .then((id) => {
                      pic.fbId = id;
                      ids.push(id);
                      if (ids.length == pictures.length) res(id);
                    })
                    .catch((e) => {
                      updateStatus(e);
                      rej(e);
                    }),
                ),
              );
            });
            return toReturn;
          })(mediaItemsNotPosted);
          (async (p: Promise<string>[]) => {
            for (let promise of p)
              updateStatus(`Posted photo to FB: ${await promise}`);
          })(promises).then(() => {
            album.mediaItems.forEach((el) =>
              mediaItemsNotPosted.forEach((ele) =>
                el?.id === ele?.id ? (el.postedToFB = true) : null,
              ),
            );
          });
          // updateStatus('Posted to FB: ' + id);

          // post()
          //   .then(() => {
          //     if (ids.length > 0) {
          //       var dates = mediaItemsNotPosted
          //         .map((p) => p.mediaMetadata.creationTime)
          //         .sort((a, b) => b?.getTime() - a?.getTime());
          //       var datesByDay: object = {};
          //       dates.forEach(
          //         (d: Date) =>
          //           ((datesByDay as any)[d.toLocaleDateString('en-US')] = []),
          //       );
          //       mediaItemsNotPosted.forEach((m) =>
          //         (datesByDay as any)[
          //           m.mediaMetadata.creationTime.toLocaleDateString('en-US')
          //         ].push(m),
          //       );
          //       var promises: Promise<object>[] = [];
          //       Object.keys(datesByDay).forEach((e) => {
          //         promises.push(
          //           new Promise((res, rej) => {
          //             postMultiPhoto(
          //               e,
          //               (datesByDay as any)[e].map((m: Picture) => m.fbId),
          //               true,
          //             )
          //               .then((i: any) => {
          //                 if (i?.id) res(i.id);
          //                 else rej(i);
          //               })
          //               .catch((e) => updateStatus(e));
          //           }),
          //         );
          //       });
          //       (async (p: Promise<object>[]) => {
          //         for (let pr of p)
          //           updateStatus(`Posted multiphoto post to FB: ${await pr}`);
          //       })(promises)
          //         .then(() => {
          //           album.mediaItems.forEach((el) =>
          //             mediaItemsNotPosted.forEach((ele) =>
          //               el?.id === ele?.id ? (el.postedToFB = true) : null,
          //             ),
          //           );
          //         })
          //         .catch((e) => updateStatus(e));
          //     }
          //   })
        });
      })
      .then(() => album.writeFile())
      .catch((e) => updateStatus(e));
  }, parseInt(process.env.INTERVAL as string) * 1000 * 60);
}
