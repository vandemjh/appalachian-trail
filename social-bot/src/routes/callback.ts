import { Router } from 'express';
import { facebookSigninUrl, getTokenFromCode } from '../auth';
import { setAlbum, signIn, updateStatus } from '../state';
import { googlePhotosRequest } from '../request';
import { album } from '../state';
import { Album } from '../model/album';

const callback: Router = Router();
const albumName: string = process.env.ALBUM_NAME || 'Appalachian Trail';

callback.get('/', async (req, res) => {
  const code: string = req.query.code as string;
  const token = await getTokenFromCode(code);
  const data: any = await googlePhotosRequest(token, 'albums');
  try {
    if (data.error) throw new Error(data.error.message);
    if (!data['albums']) throw new Error('No albums returned!');
    var albumId: any = data.albums.filter((v: any) => v.title === albumName);
    if (!albumId?.[0]) throw new Error(`No album with name "${albumName}"!`);
    if (!albumId?.[0]?.id) throw new Error('Invalid or unsupplied album ID');
    else albumId = albumId?.[0]?.id;
    setAlbum(albumId);
    updateStatus('Signed into Google');
    var tempAlbum = (await googlePhotosRequest(
      token,
      'mediaItems:search',
      undefined,
      {
        albumId: albumId,
      },
    )) as Album;

    album.addPictures(tempAlbum.mediaItems);
    while (tempAlbum.nextPageToken) {
      tempAlbum = (await googlePhotosRequest(
        token,
        'mediaItems:search',
        undefined,
        {
          albumId: albumId,
          pageToken: tempAlbum.nextPageToken,
        },
      )) as Album;
      album.addPictures(tempAlbum.mediaItems);
    }
    if (album) signIn();
    updateStatus('Album retreived');
    res.redirect(facebookSigninUrl);
  } catch (e) {
    console.log(e);
    res.send(e.message);
  }
});

export default callback;
