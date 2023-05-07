import { Router } from "express";
import {
  updatePlayerInfoById,
  getUserById
} from "../data/users.js";


import { getQuestions4Guest,getQuestions4User } from "../data/questions.js";
import { use } from "bcrypt/promises.js";

const router = Router();


router.
  route('/gamestart')
  .get(async (req,res)=>{
      let flag=false;
      if(req.session.user){
        flag=true;
      }
      res.render('game_start',{title: 'Quiz',flag});
      })
  .post(async(req,res)=>{
    const {quizType} = req.body;
    try{
        if(req.session.user){
            if(quizType=='local'){
                let user=getUserById(req.session.user['_id']);
                req.session.questions = await getQuestions4User(req.session.user['_id'],{
                    numberOfOptions : 4,
                    numberOfQuestions : 50,
                });
                req.session.point_inc = 0;
                req.session.point_dec = 1.5;
            }else if(quizType=='country'){
                let user=getUserById(req.session.user['_id']);
                req.session.questions = await getQuestions4User(req.session.user['_id'],{
                    numberOfOptions : 4,
                    numberOfQuestions : 50,
                    city : "all",
                    countryCode : user.geocode.countryCode,
                });
                req.session.point_inc = 0.5;
                req.session.point_dec = 1;
            }
            else{
                req.session.questions = await getQuestions4User(req.session.user['_id'],{
                    numberOfOptions : 4,
                    numberOfQuestions : 50,
                    ifGlobal : true,
                });
                req.session.point_inc = 1;
                req.session.point_dec = 0.5;
        
            }
        }else{
            req.session.questions =await getQuestions4Guest({
                numberOfOptions : 4,
                numberOfQuestions : 50,
            } );
            req.session.point_inc = 1;
            req.session.point_dec = 0.5;
        }
    }catch(error){
        let flag =false;
        if(req.session.user){
            flag=true;
        }
        return res
        .status(400)
        .render("game_start", { title: "Quiz", error: error,flag});
    }

    req.session.index = 0;
    req.session.score = 0;
    req.session.timer = 60;
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
                req.session.score = req.session.score + questions[index]['difficulty']+req.session.point_inc;
              }
              else{
                req.session.score = req.session.score - req.session.point_dec;
              }
              req.session.timer = timer;
          }
          res.redirect('/game/gameresult');
      }else{
          let correct = questions[index]['answer'];
          if(questions[index]['options'][options] == correct){
            req.session.score = req.session.score + questions[index]['difficulty']+req.session.point_inc;
          }
          else{
            req.session.score = req.session.score - req.session.point_dec;
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
          let user =await getUserById(req.session.user['_id']);
          let index = req.session.index;
          for(let i=0;i<index;i++){
              if(i<questions.length){
                  let birdid = questions[i]['birdid'];
                  await updatePlayerInfoById(user['_id'],{
                    $pushLastQuestions:  { birdId:birdid},
                  });
              }
          }
          let n_score=Number(score);
          let l_score=Number(user['lifetime_score'])+n_score;
          if(n_score>user['high_score']){
            await updatePlayerInfoById(user['_id'],{
                $incScores : {high_score:n_score,lifetime_score:l_score},
            });
          }else{
            await updatePlayerInfoById(user['_id'],{
                $incScores : {lifetime_score:l_score}
            });
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