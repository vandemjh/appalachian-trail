import { Album } from './model/album';
import { Picture } from './model/picture';

var signedIn: boolean = false;
var date: Date = new Date(0);
var album: Album;
var status: string;
var facebookPageAccessToken: string;

function signIn() {
  signedIn = true;
  setStatus('signed in');
}
function addPictures(a: Picture[]) {
  if (!album?.mediaItems) album = { mediaItems: [] };
  a.forEach((p) => album.mediaItems.push(new Picture(p)));
}
function setStatus(s: string) {
  status = s;
}
function setFacebookPageAccessToken(t: string) {
  facebookPageAccessToken = t;
}

export {
  signedIn,
  signIn,
  date,
  album,
  addPictures,
  status,
  setStatus,
  setFacebookPageAccessToken,
  facebookPageAccessToken,
};
