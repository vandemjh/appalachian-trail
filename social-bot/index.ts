import express from 'express';
import useRouter from './src/router';
const app = express();
const port = 80; // default port to listen

useRouter(app);

app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
