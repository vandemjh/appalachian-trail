import { Express } from 'express';
import stop from './routes/stop';
import start from './routes/start';
import callback from './routes/callback';

export default function useRouter(app: Express): void {
  app.use('/stop', stop);
  app.use('/start', start);
  app.use('/callback', callback);
}
