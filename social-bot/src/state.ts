var signedIn: boolean = false;
var date: Date = new Date(0);
var album: Array<object> = [];

function signIn() {
  signedIn = true;
}

export { signedIn, signIn, date, album };
