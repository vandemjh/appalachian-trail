import { Router } from 'express';
import { getToken } from '../auth';
import { setAlbum, signIn } from '../state';
import getPhotos from '../request';
import { album, setStatus } from '../state';

const callback: Router = Router();
const albumName: string = process.env.ALBUM_NAME || 'Appalachian Trail';

callback.get('/', async (req, res) => {
  const code: string = req.query.code as string;
  const token = await getToken(code);
  const data: any = await getPhotos(token, 'albums');
  try {
    if (!data['albums']) throw new Error('No albums returned!');
    var albumId: any = data.albums.filter((v: any) => v.title === albumName);
    if (!albumId?.[0]) throw new Error(`No album with name "${albumName}"!`);
    if (!albumId?.[0]?.id) throw new Error('Invalid or unsupplied album ID');
    else albumId = albumId?.[0]?.id;
    setAlbum(
      (await getPhotos(token, 'mediaItems:search', undefined, {
        albumId: albumId,
      })) as Album,
    );
    if (album) signIn();
  } catch (e) {
    res.send(e.message);
  }
  setStatus('album retreived');
  res.redirect('/');
});

export default callback;
