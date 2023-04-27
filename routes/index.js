import birdRoutes from './birds.js';
import userRoutes from './users.js';
import path from 'path';

const constructorMethod = (app) => {
    app.use('/users', userRoutes);
    app.use('/', (req, res) => {
        res.render('homepage',{title: "Homepage"})
    });
}

export default constructorMethod;