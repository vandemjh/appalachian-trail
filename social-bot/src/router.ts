import { Express } from 'express';
import stop from './routes/stop';
import start from './routes/start';
import callback from './routes/callback';
import index from './routes/index';
import photos from './routes/photos';

export default function useRouter(app: Express): void {
  app.use('/stop', stop);
  app.use('/start', start);
  app.use('/callback', callback);
  app.use('/photos', photos);
  app.use('/', index);
}
