var signedIn: boolean = false;
var date: Date = new Date(0);
var album: Album;
var status: string;

function signIn() {
  signedIn = true;
}
function setAlbum(a: Album) {
  album = a;
}
function setStatus(s: string) {
  status = s;
}

export { signedIn, signIn, date, album, setAlbum, status, setStatus };
