import {Router} from 'express';
import {topNthGlobalUsersByHighScore} from '../data/users.js';
import {checkUsername, checkPassword, checkImgUrl, checkGeoCode} from '../helpers.js';
import {getUserByUserName} from "../data/users.js"; 
import bcrypt from 'bcrypt';
const saltRounds = 16;
const router = Router();


router.route('/leaderboard/local').get(async (req, res) => {
  //code here for GET
  try {
     
  } catch (error) {
    
  }
});

router.route('/leaderboard/global').get(async (req, res) => {
  //code here for GET
  try {
    const leaderboard = await topNthGlobalUsersByHighScore(100)
    res.render('leaderboard', {title: 'Global Leaderboard', leaderboard});
  } catch (error) {
    console.log("An error has occured when trying to access the global leaderboard!")
    console.log(error)
    return res.status(400).json(error);
  }
});

router.
    route('/register')
    .get(async (req, res) => {
        res.render('register', {title: 'Register'});
        })

    .post(async(req,res)=>{
        try{
            const {username, password,icon,geocode} = req.body;
            if(!username||!password||!icon||!geocode){
                return res.status(400).json({error: "All fields are required!"});
            }
            if(!checkUsername(username)){
                return res.status(400).json({error: 'Username is not valid!'});
            }
            if(!checkPassword(password)){
                return res.status(400).json({error: 'Password is not valid!'});
            }
            if(!checkImgUrl(icon,"Icon")){
                return res.status(400).json({error: 'Icon is not valid!'});
            }
            if(!checkGeoCode(geocode, "GeoCode")){
                return res.status(400).json({error: 'Geocode is not valid!'});
            }
            if(!await getUserByUserName(username)){
                return res.status(400).json({error: 'Username already exists!'});
            }

            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const newUser = await createUser(username, hashedPassword, icon, geocode);
            req.session.user = newUser;
            return res.redirect('/users/user_profile');
        }catch(e){
            return res.status(400).json(e);
        }
});

router.
    route('/login')
    .get(async (req, res) => {
        res.render('login', {title: 'Login'});
        })

    .post(async(req,res)=>{
        try{
            const {username,password} =req.body;
            if(!checkUsername(username)){
                return res.status(400).json({error: 'Username is not valid!'});
            }
            if(!checkPassword(password)){
                return res.status(400).json({error: 'Password is not valid!'});
            }
            const user = await getUserByUserName(username);
            if(!user){
                return res.status(400).json({error: 'Username does not exist!'});
            }
            if(await bcrypt.compare(password, user.hashed_password)){
                req.session.user = user;
                return res.redirect('/users/user_profile');
            }else{
                return res.status(400).json({error: 'Incorrect password!'});
            }
        }catch(e){
            return res.status(400).json(e);
        }
    });

export default router;