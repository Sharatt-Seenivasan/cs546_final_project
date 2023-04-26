import { Router } from "express";
import bcrypt from "bcrypt";
import {
  topNthGlobalUsersByHighScore,
  topNthLocalUsersByHighScore,
} from "../data/users.js";
import {
  checkUserName,
  checkPassword,
  checkCountryCode,
  checkCity,
  checkZipCode,
  checkImgUrl,
  checkGeoCode,
  checkStr,
} from "../helpers.js";
import { getUserByUserName, updatePersonalInfoById } from "../data/users.js";
import { geocoderConfig } from "../config/settings.js";
import nodeGeocode from "node-geocoder";
const saltRounds = 16;
const router = Router();
const geocoder = nodeGeocode(geocoderConfig);

router.route("/leaderboard/local").get(async (req, res) => {
  //code here for GET
  try {
    const user = req.session.user;
    const leaderboard = await topNthLocalUsersByHighScore(
      100,
      user.geocode.countryCode,
      user.geocode.geocode.city
    );
    res.render("leaderboard", { title: "Local Leaderboard", leaderboard });
  } catch (error) {
    console.log(
      "An error has occured when trying to access the local leaderboard!"
    );
    console.log(error);
    return res.status(400).json(error);
  }
});

router.route("/leaderboard/global").get(async (req, res) => {
  //code here for GET
  try {
    const leaderboard = await topNthGlobalUsersByHighScore(100);
    res.render("leaderboard", { title: "Global Leaderboard", leaderboard });
  } catch (error) {
    console.log(
      "An error has occured when trying to access the global leaderboard!"
    );
    console.log(error);
    return res.status(400).json(error);
  }
});

router.route("/user").get(async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }
    user = await getUserByUserName(req.session.user.username);
    if (!user) {
      return res.redirect("/login");
    }
    const userInfo = {
      current_score: user.lifetime_score,
      highestest_score: user.high_score,
      answered_quizzes: user.submission,
    };
    return res.render("user", { title: "User", user: userInfo });
  } catch (e) {
    return res.status(400).json(e);
  }
});

router
  .route("/signup")
  .get(async (req, res) => {
    if (req.session.user) {
      return res.redirect("/user/user_profile");
    }
    return res.render("signup", { title: "Sign Up" });
  })

  .post(async (req, res) => {
    try {
      const { username, password, icon, geocodeName } = req.body;
      if (!username || !password || !icon || !geocodeName) {
        return res.status(400).json({ error: "All fields are required!" });
      }
      if (!checkUserName(username)) {
        return res.status(400).json({ error: "Username is not valid!" });
      }
      if (!checkPassword(password)) {
        return res.status(400).json({ error: "Password is not valid!" });
      }
      if (!checkImgUrl(icon, "Icon")) {
        return res.status(400).json({ error: "Icon is not valid!" });
      }
      if (
        typeof geocodeName !== "string" ||
        geocodeName.length === 0 ||
        geocodeName.trim().length === 0 ||
        geocodeName.trim().match(/\s/g) ||
        geocodeName.match(/[!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?]/g)
      ) {
        return res.status(400).json({ error: "GeocodeName is not valid!" });
      }
      if (!(await getUserByUserName(username))) {
        return res.status(400).json({ error: "Username already exists!" });
      }

      const geocode = await geocoder.geocode(geocodeName);
      if (!checkGeoCode(geocode, geocodeName)) {
        return res.status(400).json({ error: "Geocode is not valid!" });
      }

      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = await createUser(username, hashedPassword, icon, geocode);
      req.session.user = newUser;
      return res.redirect("/users/user_profile");
    } catch (e) {
      return res.status(400).json(e);
    }
  });

router
  .route("/login")
  .get(async (req, res) => {
    if (req.session.user) {
      return res.redirect("/user/user_profile");
    }
    return res.render("login", { title: "Login" });
  })

  .post(async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!checkUserName(username)) {
        return res.status(400).json({ error: "Username is not valid!" });
      }
      if (!checkPassword(password)) {
        return res.status(400).json({ error: "Password is not valid!" });
      }
      const user = await getUserByUserName(username);
      if (!user) {
        return res.status(400).json({ error: "Username does not exist!" });
      }
      if (await bcrypt.compare(password, user.hashed_password)) {
        req.session.user = user;
        return res.redirect("/users/user_profile");
      } else {
        return res.status(400).json({ error: "Incorrect password!" });
      }
    } catch (e) {
      return res.status(400).json(e);
    }
  });

router
  .route("/user/profile")
  .get(async (req, res) => {
    const username = req.session.user && req.session.user.username;
    if (!username) return res.redirect("/login");

    let user;
    try {
      user = await getUserByUserName(username);
    } catch (error) {
      return res.status(500).send("Internal Server Error");
    }

    user = {
      username: user.username,
      icon: user.icon,
      country: user.geocode.country,
      countryCode: user.geocode.countryCode,
      city: user.geocode.city,
      zipCode: user.geocode.zipCode,
      lifetime_score: user.lifetime_score,
      high_score: user.high_score,
      submission: user.submission,
      last_questions: user.last_questions,
    };
    return res.render("user_profile", { title: "User Profile", user });
  })
  .put(async (req, res) => {
    const username = req.session.user && req.session.user.username;
    if (!username) return res.redirect("/login");

    let user;
    try {
      user = await getUserByUserName(username);
    } catch (error) {
      return res.status(500).send("Internal Server Error");
    }

    let {
      newUserName,
      newPassword,
      newConfirmPassword,
      newIcon,
      newCountryCode,
      newCity,
      newZipCode,
    } = req.body;

    let fields2Update = [
      newUserName,
      newPassword,
      newConfirmPassword,
      newIcon,
      newCountryCode,
      newCity,
      newZipCode,
    ];
    if (fields2Update.every((field) => field === undefined))
      throw "No field to update!";

    fields2Update = {};
    const errors = [];
    if (newUserName) {
      try {
        newUserName = checkUserName(newUserName);
        if (newUserName === user.username)
          throw "Username is the same as before!";
      } catch (error) {
        errors.push(error);
      }
    }
    if (newPassword) {
      try {
        newPassword = checkPassword(newPassword);
        if (newPassword !== newConfirmPassword)
          throw "Password and Confirm Password are not the same!";
        newPassword = await bcrypt.hash(newPassword, saltRounds);
        if (newPassword === user.hashed_password)
          throw "Password is the same as before!";
      } catch (error) {
        errors.push(error);
      }
    }
    if (newIcon) {
      try {
        newIcon = checkImgUrl(newIcon, "Icon");
        if ((newIcon = user.icon)) throw "Icon is the same as before!";
      } catch (error) {
        errors.push(error);
      }
    }
    if (newCountryCode || newCity || newZipCode) {
      try {
        newCountryCode = checkCountryCode(newCountryCode, `new country code`);
        newCity = checkCity(newCity, `new city`);
        newZipCode = checkZipCode(newZipCode, `new zip code`);
        if (
          newCountryCode === user.geocode.countryCode &&
          newCity === user.geocode.city &&
          newZipCode === user.geocode.zipCode
        )
          throw "country code, city and zip code are the same as before!";
      } catch (error) {
        errors.push(error);
      }
    }

    if (errors.length > 0) {
      return res.status(400).render("user_profile", {
        title: "User Profile",
        errors,
      });
    }
  })
  .patch(async (req, res) => {
    const username = req.session.user && req.session.user.username;
    if (!username) return res.redirect("/login");

    try {
      const info = req.body;
      if (!info || Object.keys(info).length === 0) {
        return res
          .status(400)
          .json({ error: "At least one field is required!" });
      }

      if (req.session.user) {
        const user = req.session.user;
      } else {
        return res.redirect("/login");
      }

      if (info.username && !checkUserName(info.username)) {
        return res.status(400).json({ error: "Username is not valid!" });
      }

      if (info.password && !checkPassword(info.password)) {
        return res.status(400).json({ error: "Password is not valid!" });
      }

      if (info.icon && !checkImgUrl(info.icon, "Icon")) {
        return res.status(400).json({ error: "Icon is not valid!" });
      }

      if (
        info.geocodeName &&
        (typeof info.geocodeName !== "string" ||
          info.geocodeName.length === 0 ||
          info.geocodeName.trim().length === 0 ||
          info.geocodeName.trim().match(/\s/g) ||
          info.geocodeName.match(/[!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?]/g))
      ) {
        return res.status(400).json({ error: "GeocodeName is not valid!" });
      }

      const geocode = await geocoder.geocode(info.geocodeName);
      if (info.geocodeName && !checkGeoCode(geocode, info.geocodeName)) {
        return res.status(400).json({ error: "Geocode is not valid!" });
      }

      Object.assign(user, info);
      const updateUser = await updatePersonalInfoById(
        user._id,
        user.username,
        user.password,
        user.icon,
        user.geocode
      );
      if (!updateUser) {
        return res.status(400).json({ error: "Update failed!" });
      }
      req.session.user = updateUser;
      return res.render("user_profile", {
        title: "User Profile",
        user: req.session.user,
      });
    } catch (e) {
      return res.status(400).json(e);
    }
  });

router
  .route("/user/post")
  .get(async (req, res) => {
    const username = req.session.user && req.session.user.username;
    if (!username) return res.redirect("/login");

    let theUser;
    try {
      theUser = await getUserByUserName(username);
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }

    return res.render("image_submission_form", {
      title: "Bird Image Submission Form",
      user: theUser,
    });
  })
  .post(async (req, res) => {
    const username = req.session.user && req.session.user.username;
    if (!username) return res.redirect("/login");

    const {
      bird_name,
      bird_img,
      bird_countryCode,
      bird_city,
      bird_difficulty,
    } = req.body;

    try {
      bird_name = checkStr(bird_name, "Bird Name");
      bird_img = checkImgUrl(bird_img, "Bird Image");
      bird_countryCode = checkCountryCode(
        bird_countryCode,
        "Bird Country Code"
      );
      bird_city = checkCity(bird_city, "Bird City");
      bird_difficulty = checkDifficulty(parseFloat(bird_difficulty), "Bird Difficulty");
    } catch (error) {
      return res.status(400).render("image_submission_form", {error});
    }

    
  });

export default router;
