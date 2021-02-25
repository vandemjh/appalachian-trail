import oauth2Client, { token } from '../auth';
import { googlePhotosRequest } from '../request';
import { Picture } from './picture';

export class Album {
  id: string;
  mediaItems: Array<Picture>;
  nextPageToken?: string;
  constructor(id: string) {
    this.id = id;
    this.mediaItems = [];
  }

  public refreshUnpostedUrls() {
    var r: string[] = ['mediaItemIds='];
    this.mediaItems
      .filter((p) => !p?.postedToFB && p?.id)
      .forEach((c) => r.push(c.id, '&mediaItemIds='));
    r.pop();
    const postBatch = (batch: string[]) => {
      var batchGet = batch.join('');
      if (batchGet !== '')
        googlePhotosRequest(token, 'mediaItems:batchGet?' + batchGet)
          .then((a) => {
            if ((a as any).error) throw new Error((a as any).message);
            if (!(a as any).mediaItemResults)
              throw new Error('No mediaItemResults returned!');
            (a as any).mediaItemResults.forEach((p: any) => {
              this.mediaItems.forEach((i) => {
                if (p?.mediaItem?.id === i?.id) i = new Picture(p.mediaItem);
              });
            });
          })
          .catch((e) => console.log(e));
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
  }
  addPictures(pics: Picture[]) {
    pics.forEach((p) => this.mediaItems.push(new Picture(p)));
  }
}
