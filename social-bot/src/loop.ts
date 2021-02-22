import { Picture } from './model/picture';
import { album } from './state';

export default async function start() {
  setInterval(() => {
    album.mediaItems.forEach((p: Picture) => {
      console.log(p.fullSizeUrl);
    });
  }, (process.env.TIMEOUT as any) * 1000);
}
