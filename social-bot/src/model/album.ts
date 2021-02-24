import oauth2Client from '../auth';
import { Picture } from './picture';

export class Album {
  id: string;
  mediaItems: Array<Picture>;
  nextPageToken?: string;
  constructor(id: string) {
    this.id = id;
    this.mediaItems = [];
  }
  refreshUrls() {
    this.mediaItems.forEach((p) => {});
  }
  addPictures(pics: Picture[]) {
    pics.forEach((p) => this.mediaItems.push(new Picture(p)));
  }
}
