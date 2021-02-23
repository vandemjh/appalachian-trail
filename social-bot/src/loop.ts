import { Picture } from './model/picture';
import { album } from './state';

export default function start() {
  setInterval(() => {
    album.mediaItems.forEach((p: Picture) => {
      console.log(p.fullSizeUrl);
    });
  }, parseInt(process.env.INTERVAL as string) * 1000);
}
