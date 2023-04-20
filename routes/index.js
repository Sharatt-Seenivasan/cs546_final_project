import birdRoutes from './birds.js';
import userRoutes from './users.js';
import path from 'path';

const constructorMethod = (app) => {
    app.use('/users', userRoutes);
}

export default constructorMethod;