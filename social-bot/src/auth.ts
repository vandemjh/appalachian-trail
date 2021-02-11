import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.CALLBACK_URL,
);

const scopes = ['https://www.googleapis.com/auth/photos'];

const googleSigninUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
});

export { googleSigninUrl };
