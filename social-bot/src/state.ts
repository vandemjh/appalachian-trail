var signedIn: boolean = false;
var date: Date = new Date(0);
var album: Album;

function signIn() {
  signedIn = true;
}
function setAlbum(a: Album) {
  album = a;
}

export { signedIn, signIn, date, album, setAlbum };
