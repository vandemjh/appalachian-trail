import { token } from '../auth';
import { googlePhotosRequest } from '../request';
import { Picture } from './picture';
import { writeFile, readFile, access, constants } from 'fs';
import { filePath, updateStatus } from '../state';

export class Album {
  id: string;
  mediaItems: Array<Picture>;
  nextPageToken?: string;
  constructor(id: string) {
    access(filePath, constants.F_OK, (err) => {
      if (!err)
        readFile(filePath, 'utf8', (err: any, data: any) => {
          if (!err) {
            if (data !== '') {
              this.addPictures(JSON.parse(data));
              updateStatus(
                `Imported ${this.mediaItems.length} ids from file: `,
              );
            }
          } else {
            updateStatus(err);
          }
        });
    });
    this.id = id;
    this.mediaItems = [];
  }

  public async refreshUnpostedUrls(): Promise<void> {
    return new Promise((res, rej) => {
      var r: string[] = ['mediaItemIds='];
      this.mediaItems
        .filter((p) => !p?.postedToFB && p?.id)
        .forEach((c) => r.push(c.id, '&mediaItemIds='));
      r.pop();
      const postBatch = (batch: string[]) => {
        var batchGet = batch.join('');
        if (batchGet !== '')
          googlePhotosRequest(token, 'mediaItems:batchGet', batchGet)
            .then((a) => {
              if ((a as any).error) rej((a as any).message);
              if (!(a as any).mediaItemResults)
                rej('No mediaItemResults returned!');
              (a as any).mediaItemResults.forEach((p: any) => {
                this.mediaItems.forEach((i) => {
                  if ((p as any)?.status) console.warn(p);
                  try {
                    if (p?.mediaItem?.id === i.id) {
                      this.mediaItems[this.mediaItems.indexOf(i)].baseUrl =
                        p.mediaItem.baseUrl;
                      this.mediaItems[this.mediaItems.indexOf(i)].setUrls();
                    }
                  } catch (e) {
                    updateStatus(e);
                  }
                });
              });
              res();
            })
            .catch((e) => updateStatus(e));
      };
      if (r.length > 80) {
        var i: number,
          j: number,
          chunk = 10;
        for (i = 0, j = r.length; i < j; i += chunk)
          postBatch(r.slice(i, i + chunk));
      } else {
        postBatch(r);
      }
    });
  }
  addPictures(pics: Picture[]) {
    pics.forEach((p) => {
      p?.id && !this.mediaItems.some((s) => p?.id === s?.id)
        ? this.mediaItems.push(new Picture(p))
        : null;
    });
  }
  public writeFile() {
    writeFile(filePath, JSON.stringify(this.mediaItems), (err) => {
      if (err) updateStatus(err.toString());
    });
  }
  public async getPictures() {
    var picsToAdd: Picture[] = [];
    var tempAlbum = (await googlePhotosRequest(
      token,
      'mediaItems:search',
      undefined,
      {
        albumId: this.id,
      },
    )) as Album;

    picsToAdd.push(...tempAlbum.mediaItems);
    while (tempAlbum.nextPageToken) {
      tempAlbum = (await googlePhotosRequest(
        token,
        'mediaItems:search',
        undefined,
        {
          albumId: this.id,
          pageToken: tempAlbum.nextPageToken,
        },
      )) as Album;
      picsToAdd.push(...tempAlbum.mediaItems);
    }
    this.addPictures(picsToAdd);
  }
}
