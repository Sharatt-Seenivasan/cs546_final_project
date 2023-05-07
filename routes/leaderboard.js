import { Router } from "express";
import {
  topNthGlobalUsersByHighScore,
  topNthLocalUsersByHighScore,
  getUserByUserName,
  getUserById
} from "../data/users.js";
const router = Router();

router
  .route("/local")
  .get(async (req, res) => {
    const userId = req.session.user && req.session.user._id;


    let leaderboard;
    let countryCode;
    let city;
    try {
      if (userId) {
        const userInQuestion = await getUserById(userId)

        const hasUserCountryCode =
          req.session.user &&
          userInQuestion.geocode &&
          userInQuestion.geocode.countryCode;
        const hasUserCity =
          req.session.user &&
          userInQuestion.geocode &&
          userInQuestion.geocode.city;

        if(hasUserCountryCode && hasUserCity) {
          countryCode = userInQuestion.geocode.countryCode
          city = userInQuestion.geocode.city
          leaderboard = await topNthLocalUsersByHighScore(
            100,
            userInQuestion.geocode.countryCode,
            userInQuestion.geocode.city
          );   
        }

      }
      else {
        countryCode = "US"
        city = "Hoboken"
        leaderboard = await topNthLocalUsersByHighScore(100, 'US', 'Hoboken');
      }
    } catch (error) {
      return res.status(500).render('error',{error: `Internal Server Error: ${error}`})
      //return res.status(500).send("Internal Server Error:", error);
    }

    return res.render("leaderboard", {
      title: "Local Leaderboard",
      type: "local",
      countryCode,
      city,
      leaderboard,
    });
  })
  .post(async (req, res) => {
    // reserved for AJAX
    var countryInput = req.body.countryInput;
    var citySearchTerm = req.body.citySearchBar;

    try {
      const leaderboard = await topNthLocalUsersByHighScore(
        100,
        countryInput,
        citySearchTerm
      );
      return res.send(leaderboard)
    }
    catch(error){
      return res.render('leaderboard',{title: "Local Leaderboard",type: "local",error:error})
    }
  });

router.route("/global").get(async (req, res) => {
  const userId = req.session.user && req.session.user._id;

  let leaderboard;
  try {
    leaderboard = await topNthGlobalUsersByHighScore(100);
  } catch (error) {
    return res.status(500).render('error',{error: `Internal Server Error: ${error}`})
    //return res.status(500).send("Internal Server Error:", error);
  }

  return res.render("leaderboard", {
    title: "Global Leaderboard",
    leaderboard,
  });
});


export default router;