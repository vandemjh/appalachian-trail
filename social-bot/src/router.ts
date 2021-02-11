import { Express } from 'express';
import { stop } from './routes/stop';
import { start } from './routes/start';

export default function useRouter(app: Express): void {
  app.use('/stop', stop);
  app.use('/start', start);
}
