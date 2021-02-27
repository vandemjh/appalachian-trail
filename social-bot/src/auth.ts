import { google } from 'googleapis';
import { updateStatus } from './state';
require('dotenv').config();

const facebookSigninUrl =
  `https://www.facebook.com/v9.0/dialog/oauth?` +
  `client_id=${process.env.FACEBOOK_CLIENT_ID}` +
  `&redirect_uri=${process.env.FACEBOOK_CALLBACK_URL}` +
  (process.env.FACEBOOK_STATE ? `&state=${process.env.FACEBOOK_STATE}` : '');

export var token = '';

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.CALLBACK_URL,
);

const scopes = ['https://www.googleapis.com/auth/photoslibrary.readonly'];

const googleSigninUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'select_account',
});

export { googleSigninUrl, facebookSigninUrl };

export async function getTokenFromCode(code: string): Promise<string> {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  oauth2Client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
      updateStatus('New refresh token');
    }
    updateStatus('New access token');
    setToken(tokens.access_token as string);
  });
  setToken(tokens.access_token as string);
  return tokens.access_token as string;
}

export function setToken(t: string) {
  token = t;
}

export default oauth2Client;
