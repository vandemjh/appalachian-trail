import express from 'express';
import useRouter from './src/router';
import fs from 'fs';
import https from 'https';
require('dotenv').config();

const app = express();
const port: number = process.env.PORT ? parseInt(process.env.PORT) : 80;

useRouter(app);

port == 443
  ? https.createServer({
    key: fs.readFileSync(process.env.KEY_PATH ?? "privkey.pem"),
    cert: fs.readFileSync(process.env.CERT_PATH ?? "cert.pem"),
  }, app).listen(port)
  : app.listen(port, () => {
      console.log(`Server started at http://localhost:${port}`);
    });
