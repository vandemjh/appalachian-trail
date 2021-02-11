import express from 'express';
import useRouter from './src/router';
require('dotenv').config();

const app = express();
const port = process.env.PORT ?? 80;

useRouter(app);

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}
  Sign in at http://localhost:${port}/start`);
});
