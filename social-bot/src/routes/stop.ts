import { Router } from 'express';
const stop: Router = Router();

export default stop;

stop.get('/', (req, res) => {
  const password: string = req.query.password as string;
  if (!password || password !== 'jack') res.send('Enter password');
  else process.exit(0);
});
