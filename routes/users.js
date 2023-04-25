import {Router} from 'express';
import {topNthGlobalUsersByHighScore, topNthLocalUsersByHighScore} from '../data/users.js';
import {checkUsername, checkPassword, checkImgUrl, checkGeoCode} from '../helpers.js';
import {getUserByUserName,updatePersonalInfoById} from "../data/users.js"; 
import bcrypt from 'bcrypt';
import { geocoderConfig } from '../config/settings.js';
const saltRounds = 16;
const router = Router();
const nodeGeocode=require('node-geocoder');
const geocoder=nodeGeocode(geocoderConfig);


router.route('/leaderboard/local').get(async (req, res) => {
  //code here for GET
  try {
    const user = req.session.user
    const leaderboard = await topNthLocalUsersByHighScore(100,user.geocode.countryCode,geocode.city)
    res.render('leaderboard', {title: 'Global Leaderboard', leaderboard}); 
  } catch (error) {
    console.log("An error has occured when trying to access the local leaderboard!")
    console.log(error)
    return res.status(400).json(error);
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
    route('/user')
    .get(async (req, res) => {
        try {
            if(!req.session.user){
                return res.redirect('/login');
            }
            user = await getUserByUserName(req.session.user.username);
            if(!user){
                return res.redirect('/login');
            }
            const userInfo = {current_score:user.lifetime_score, highestest_score:user.high_score,answered_quizzes:user.submission}
            return res.render('user', {title: 'User', user: userInfo});
        }catch(e){
            return res.status(400).json(e);
            }
        });

router.
    route('/signup')
    .get(async (req, res) => {
        if(req.session.user){
            return res.redirect('/user/user_profile');
        }
        return res.render('signup', {title: 'Sign Up'});
        })

    .post(async(req,res)=>{
        try{
            const {username, password,icon,geocodeName} = req.body;
            if(!username||!password||!icon||!geocodeName){
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
            if(typeof(geocodeName)!=='string'||geocodeName.length===0||geocodeName.trim().length===0||geocodeName.trim().match(/\s/g)||geocodeName.match(/[!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?]/g)){
                return res.status(400).json({error: 'GeocodeName is not valid!'});
            }
            if(!await getUserByUserName(username)){
                return res.status(400).json({error: 'Username already exists!'});
            }

            const geocode = await geocoder.geocode(geocodeName);
            if(!checkGeoCode(geocode, geocodeName)){
                return res.status(400).json({error: 'Geocode is not valid!'});
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
        if(req.session.user){
            return res.redirect('/user/user_profile');
        }
        return res.render('login', {title: 'Login'});
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

router.
    route('/user/user_profile')
    .get(async (req, res) => {
        if(!req.sesstion.user){
            return res.redirect('/login');
        }
        user = await getUserByUserName(req.session.user.username);
        if(!user){
            return res.redirect('/login');
        }

        const geocode=await geocoder.geocode('user.geo')
        const info={username:user.username, usericon:user.icon, usercountry:geocode[0].country,usercity:geocode[0].city}

        return res.render('user_profile', {title: 'User Profile', user: info});
        
    })

    .put(async (req,res)=>{
        try{
            const {username, password,icon,geocodeName} = req.body; 
            if(!username||!password||!icon||!geocodeName){
                return res.status(400).json({error: "All fields are required!"});
            }
            if(!checkUsername(info.username)||info.username===user.username){
                return res.status(400).json({error: 'Username is not valid!'});
            }
            if(!checkPassword(info.password)||info.password===user.password){
                return res.status(400).json({error: 'Password is not valid!'});
            }
            if(!checkImgUrl(info.icon,"Icon")||info.icon===user.icon){
                return res.status(400).json({error: 'Icon is not valid!'});
            }
            if(typeof(info.geocodeName)!=='string'||info.geocodeName.length===0||info.geocodeName.trim().length===0||info.geocodeName.trim().match(/\s/g)||info.geocodeName.match(/[!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?]/g)||info.geocodeName===user.geocodeName){
                return res.status(400).json({error: 'GeocodeName is not valid!'});
            }
            const geocode = await geocoder.geocode(geocodeName);
            if(!checkGeoCode(geocode, geocodeName)){
                return res.status(400).json({error: 'Geocode is not valid!'});
            }
            
            const user = await getUserByUserName(username);
            if(!user){
                return res.status(400).json({error: 'Username does not exist!'});
            }

            const updateUser= await updatePersonalInfoById(user._id,username,password,icon,geocode);
            if(!updateUser){
                return res.status(400).json({error: 'Update failed!'});
            }
            req.session.user = updateUser;
            return res.render('user_profile', {title: 'User Profile', user: req.session.user});
        }catch(e){
            return res.status(400).json(e);
        }
    })
    
    .patch(async (req,res)=>{
        try{
            const info = req.body; 
            if(!info||Object.keys(info).length===0){
                return res.status(400).json({error: "At least one field is required!"});
            }

            if(req.session.user){
                const user = req.session.user;
            }else{
                return res.redirect('/login');
            }
            
            if(info.username&&(!checkUsername(info.username))){
                return res.status(400).json({error: 'Username is not valid!'});
            }

            if(info.password&&(!checkPassword(info.password))){
                return res.status(400).json({error: 'Password is not valid!'});
            }

            if(info.icon&&(!checkImgUrl(info.icon,"Icon"))){
                return res.status(400).json({error: 'Icon is not valid!'});
            }

            if(info.geocodeName&&(typeof(info.geocodeName)!=='string'||info.geocodeName.length===0||info.geocodeName.trim().length===0||info.geocodeName.trim().match(/\s/g)||info.geocodeName.match(/[!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?]/g))){
                return res.status(400).json({error: 'GeocodeName is not valid!'});
            }

            const geocode = await geocoder.geocode(info.geocodeName);
            if(info.geocodeName&&!checkGeoCode(geocode, info.geocodeName)){
                return res.status(400).json({error: 'Geocode is not valid!'});
            }

            Object.assign(user, info);
            const updateUser = await updatePersonalInfoById(user._id,user.username,user.password,user.icon,user.geocode);
            if(!updateUser){
                return res.status(400).json({error: 'Update failed!'});
            }
            req.session.user = updateUser;
            return res.render('user_profile', {title: 'User Profile', user: req.session.user});

        }catch(e){
            return res.status(400).json(e);
        }
    });

    router.
        route('/user/submit')
        .get((async (req, res) => {
            if(!req.sesstion.user){
                return res.redirect('/login');
            }
            user = await getUserByUserName(req.session.user.username);
            if(!user){
                return res.redirect('/login');
            }
            
            return res.render('image_submission_form',{title: 'Bird Image Submission Form', user: req.session.user})
        
        
    }))


export default router;