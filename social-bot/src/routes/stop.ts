import { Router } from 'express';
const stop: Router = Router();

export default stop;

stop.get('/', (req, res) => {
  process.exit(1);
});
