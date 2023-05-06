import leaderboardRoutes from './leaderboard.js';
import userRoutes from './users.js';
import gameRoutes from './game.js';
import path from 'path';

const constructorMethod = (app) => {
    app.use('/users', userRoutes);
    app.use('/game',gameRoutes);
    app.use('/leaderboard',leaderboardRoutes);
    app.use('/', (req, res) => {
        res.render('homepage',{title: "Homepage", user: req.session.user})
    });
}

export default constructorMethod;