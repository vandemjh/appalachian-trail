import express from 'express';
import useRouter from './src/router';
import fs from 'fs';
import https from 'https';
import http from 'http';
require('dotenv').config();

const options = {
  key: fs.readFileSync(
    `/etc/letsencrypt/live/${process.env.DOMAIN}/privkey.pem`,
  ),
  cert: fs.readFileSync(`/etc/letsencrypt/live/${process.env.DOMAIN}/cert.pem`),
};

const app = express();
const port: number = process.env.PORT ? parseInt(process.env.PORT) : 80;

useRouter(app);

port == 443
  ? https.createServer(options, app).listen(port)
  : app.listen(port, () => {
      console.log(`Server started at http://localhost:${port}`);
    });
