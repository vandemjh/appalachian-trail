import { Router } from 'express';
import { getToken } from '../auth';
import https from 'https';
require('dotenv').config();

import oauth2Client from '../auth';
const callback: Router = Router();

callback.get('/', async (req, res) => {
  const code: string = req.query.code as string;
  const token = await getToken(code);
  console.log('token aquired: ' + token);
  const options = {
    method: 'GET',
    host: `photoslibrary.googleapis.com`,
    path: `/v1/albums?key=${process.env.API_KEY}`,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  };

  let data: string | JSON = '';
  https
    .request(options, (googleResp) => {
      googleResp.on('data', (data) => {
        data += data;
        process.stdout.write(data);
      });
      googleResp.on('end', () => {
        data = data as string;
      });
    })
    .end();
  res.send(data);
});

export default callback;
