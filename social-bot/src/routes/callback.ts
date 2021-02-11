import { Router } from 'express';
const callback: Router = Router();

callback.get('/:code/:scope', (req, res) => {
  const code = req.params.code;
  const scope = req.params.scope;
  console.log('code is: ' + code);
  console.log('scope is: ' + scope);
});

export default callback;
