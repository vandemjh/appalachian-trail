import { Album } from './model/album';
import { Picture } from './model/picture';

var signedIn: boolean = false;
var date: Date = new Date(0);
var album: Album;
var status: string = '';
var facebookPageAccessToken: string;

function signIn() {
  signedIn = true;
}

function setAlbum(id: string) {
  album = new Album(id);
}

function updateStatus(s: string) {
  status += '\n' + s;
}
function setFacebookPageAccessToken(t: string) {
  facebookPageAccessToken = t;
}

export {
  signedIn,
  signIn,
  date,
  album,
  status,
  updateStatus,
  setAlbum,
  setFacebookPageAccessToken,
  facebookPageAccessToken,
};
