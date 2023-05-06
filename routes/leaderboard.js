import { Router } from "express";
import {
  topNthGlobalUsersByHighScore,
  topNthLocalUsersByHighScore,
} from "../data/users.js";
const router = Router();

router
  .route("/local")
  .get(async (req, res) => {
    const userId = req.session.user && req.session.user._id;
    const hasUserCountryCode =
      req.session.user &&
      req.session.user.geocode &&
      req.session.user.geocode.countryCode;
    const hasUserCity =
      req.session.user &&
      req.session.user.geocode &&
      req.session.user.geocode.city;

    let leaderboard;
    try {
      if (userId && hasUserCountryCode && hasUserCity)
        leaderboard = await topNthLocalUsersByHighScore(
          100,
          req.session.user.geocode.countryCode,
          req.session.user.geocode.city
        );
      else
        leaderboard = await topNthLocalUsersByHighScore(100, "US", "Hoboken");
    } catch (error) {
      return res.status(500).render('error',{error: `Internal Server Error: ${error}`})
      //return res.status(500).send("Internal Server Error:", error);
    }

    return res.render("leaderboard", {
      title: "Local Leaderboard",
      type: "local",
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