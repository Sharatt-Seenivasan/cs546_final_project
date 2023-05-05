import { Router } from "express";
import {
  updatePlayerInfoById,
} from "../data/users.js";

import { geocoderConfig } from "../config/settings.js";
import { getQuestions4Guest,getQuestions4User } from "../data/questions.js";

const router = Router();


router.
  route('/gamestart')
  .get(async (req,res)=>{
      res.render('game_start',{title: 'Quiz'});
      })
  .post(async(req,res)=>{
      if(req.session.user){
          req.session.questions = await getQuestions4User({
            numberOfOptions : 4,
            numberOfQuestions : 50,
            countryCode : req.session.user['geocode.countryCode'],
            city : req.session.user['geocode.city'],
          });
      }else{
          req.session.questions =await getQuestions4Guest({
            numberOfOptions : 4,
            numberOfQuestions : 50,
          } );
      }
      req.session.index = 0;
      req.session.score = 0;
      req.session.timer = 60
      res.redirect('/game/gameplay');
});
  
router.
  route('/gameplay')
  .get(async (req, res) => {
      if(!req.session.questions || !req.session.timer){
        res.redirect('/game/gamestart');
      }else{
        let questions = req.session.questions;
        let index = req.session.index;
        let time = req.session.timer;
        if(!req.session.score){
            req.session.score=0;
        }
        if(questions.length<=index){
            if(req.session.timer>0){
                req.session.score = (req.session.score)*(60/(60-req.session.timer));
            }
            res.redirect('/game/gameresult');
        }
        let score = req.session.score;
        return res.render('game_question', {title: 'Quiz',question : questions[index],index : index+1,score : score,time});
      }
      })
  .post(async(req,res)=>{
      let questions = req.session.questions;
      let index = req.session.index;
      const {options,timer} = req.body;
      if(timer<=0){
          if(options){
              let correct = questions[index]['answer'];
              if(questions[index]['options'][options] == correct){
                  req.session.score = req.session.score + questions[index]['difficulty'];
              }
              req.session.timer = timer;
          }
          res.redirect('/game/gameresult');
      }else{
          let correct = questions[index]['answer'];
          if(questions[index]['options'][options] == correct){
              req.session.score = req.session.score + questions[index]['difficulty'];
          }
          req.session.index = index + 1;
          req.session.timer = timer;
          res.redirect('/game/gameplay')
      }
});

router.
  route('/gameresult')
  .get(async (req, res) => {
      if(req.session.user){
          let questions = req.session.questions;
          let score = req.session.score;
          let user =req.session.user;
          for(let i=0;i<index;i++){
              if(i<questions.length){
                  let birdid = questions[i]['birdid'];
                  await updatePlayerInfoById(user['_id'],{
                    $pushLastQuestions: { birdid},
                  });
              }
          }
          delete req.session['questions'];
          delete req.session['index'];
          delete req.session['score'];
          delete req.session['timer'];
          res.render('game_end',{score});
      }
      else{
          let score = req.session.score;
          delete req.session['questions'];
          delete req.session['index'];
          delete req.session['score'];
          delete req.session['timer'];
          res.render('game_end',{score});
      }
});
export default router;