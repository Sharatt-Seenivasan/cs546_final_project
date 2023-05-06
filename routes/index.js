import leaderboardRoutes from './leaderboard.js';
import userRoutes from './users.js';
import gameRoutes from './game.js';
import path from 'path';
import {getUserByUserName} from '../data/users.js'

const constructorMethod = (app) => {
    app.use('/users', userRoutes);
    app.use('/game',gameRoutes);
    app.use('/leaderboard',leaderboardRoutes);
    app.use('/', async (req, res) => {
        if(req.session.user){
            //console.log(await getUserByUserName(req.session.user.username))
            const user = await getUserByUserName(req.session.user.username)
            const icon = user.icon
            //console.log(icon)
            res.render('homepage',{title:"Homepage",user: req.session.user, icon: icon})
        }
        else {
            res.render('homepage',{title: "Homepage", user: req.session.user})
        }
    });
}

export default constructorMethod;