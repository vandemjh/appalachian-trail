import { Express } from 'express';
import { Stop } from './routes/stop';
import { Start } from './routes/start';

export default function useRouter(app: Express): void {
  app.use('/stop', Stop);
  app.use('/start', Start);
}
