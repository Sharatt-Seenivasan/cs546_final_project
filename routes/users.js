import {Router} from 'express';
import {topNthGlobalUsersByHighScore} from '../data/users.js';
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

export default router;