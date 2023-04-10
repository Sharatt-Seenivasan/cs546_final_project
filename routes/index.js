import userRoutes from './userRoutes.js';
import birdRoutes from './birdRoutes.js';

const constructorMethod = (app) => {
  app.use('/users', userRoutes);
  app.use('/birds', birdRoutes);
  app.use('*', (req, res) => {
    res.sendStatus(404);
  });
}

export default constructorMethod;