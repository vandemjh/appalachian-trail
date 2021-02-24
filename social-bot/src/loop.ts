import { Picture } from './model/picture';
import { album } from './state';

export default function start() {
  setInterval(() => {
    album.mediaItems
      .filter((p) => !p.postedToFB)
      .forEach((p) => {
        console.log(p);
      });
  }, parseInt(process.env.INTERVAL as string) * 1000);
}
