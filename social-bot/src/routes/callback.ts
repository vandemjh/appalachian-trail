import { Router } from 'express';
import { getToken } from '../auth';
import { signIn } from '../state';
import getPhotos from '../request';
import { album } from '../state';

const callback: Router = Router();
const albumName: string = process.env.ALBUM_NAME || 'Appalachian Trail';

callback.get('/', async (req, res) => {
  const code: string = req.query.code as string;
  const token = await getToken(code);
  const data: any = await getPhotos(token, 'albums');
  try {
    if (!data['albums']) throw new Error('No albums returned!');
    var albumId: any = data.albums.filter((v: any) => v.title === albumName);
    if (!albumId?.[0]?.id) throw new Error('Invalid or unsupplied album ID');
    else albumId = albumId?.[0]?.id;
    console.log(albumId);
    album.push(
      await getPhotos(token, 'mediaItems:search', undefined, {
        albumId: albumId,
      }),
    );
    console.log(album);
    if (album.length > 0) signIn();
  } catch (e) {
    res.send(e);
  }
  res.send(album);
});

export default callback;
