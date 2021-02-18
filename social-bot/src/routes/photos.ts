import { Router } from 'express';
import { album, signedIn } from '../state';
const photos: Router = Router();

export default photos;

photos.get('/', (_req, res) =>
  signedIn ? res.send(album) : res.redirect('/start'),
);
