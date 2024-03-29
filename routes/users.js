import { Router } from "express";
import bcrypt, { compareSync } from "bcrypt";
import {
  topNthGlobalUsersByHighScore,
  topNthLocalUsersByHighScore,
  updatePlayerInfoById,
  getUserByUserName,
  getUserById,
  updatePersonalInfoById,
} from "../data/users.js";
import {
  checkUserName,
  checkPassword,
  checkCountryCode,
  checkCity,
  checkZipCode,
  checkImgUrl,
  checkDifficulty,
  checkGeoCode,
  checkStr,
  checkStrArr,
  extractKV_objArr,
} from "../helpers.js";
import { geocoderConfig } from "../config/settings.js";
import { getQuestions4Guest, getQuestions4User } from "../data/questions.js";
import NodeGeocoder from "node-geocoder";
import xss from "xss";
import { createUser } from "../data/users.js";
import { createBird, hasBirdWithImageUrl } from "../data/birds.js";
const saltRounds = 16;
const router = Router();
const geocoder = NodeGeocoder(geocoderConfig);

router
  .route("/user")
  .get(async (req, res) => {
    const userId = req.session.user && req.session.user._id;
    if (!userId) return res.redirect("/login");

    let user;
    try {
      user = await getUserById(userId);
    } catch (error) {
      return res.status(500).render("error", {
        title: "Error",
        error: `Internal Server Error: ${error}`,
      });
    }

    return res.render("user", {
      title: "User",
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
    });
  })
  .post(async (req, res) => {
    // reserved for AJAX
  });

router
  .route("/signup")
  .get(async (req, res) => {
    const userId = req.session.user && req.session.user._id;
    if (userId) return res.redirect("/user/profile");
    return res.render("signup", { title: "Sign Up" });
  })
  .post(async (req, res) => {
    const userId = req.session.user && req.session.user._id;
    if (userId) return res.redirect("/user/profile");

    let { username, password, confirmPassword } = req.body;
    try {
      username = checkUserName(username);
      password = checkPassword(password);
      if (password !== confirmPassword)
        throw "Password and confirm password do not match!";
    } catch (error) {
      return res
        .status(400)
        .render("signup", { title: "Sign Up", error: error });
    }
    try {
      password = await bcrypt.hash(password, saltRounds);
    } catch (error) {
      return res.status(500).render("error", {
        title: "Error",
        error: `Internal Server Error: ${error}`,
      });
    }

    let user;
    //user = await getUserByUserName(username);
    try {
      user = await getUserByUserName(username);
      if (Object.keys(user).length !== 0) {
        return res.status(400).render("signup", {
          title: "Sign Up",
          error: "Username already exists!",
        });
      }
    } catch (error) {
      // if(!error.includes("not found")) {
      //   return res.status(500).render('error',{error: `Internal Server Error: ${error}`})
      // }
      return res.status(500).render("error", {
        title: "Error",
        error: `Internal Server Error: ${error}`,
      });
    }

    try {
      const newUser = await createUser(username, password);
      req.session.user = { _id: newUser._id, username: newUser.username };
      return res.redirect("/login");
    } catch (error) {
      return res.status(500).render("error", {
        title: "Error",
        error: `Internal Server Error: ${error}`,
      });
    }
  });

router
  .route("/login")
  .get(async (req, res) => {
    const userId = req.session.user && req.session.user._id;
    if (userId) return res.redirect("/user/profile");
    return res.render("login", { title: "Login" });
  })
  .post(async (req, res) => {
    const userId = req.session.user && req.session.user._id;
    if (userId) return res.redirect("/user/profile");

    let { username, password } = req.body;
    try {
      username = checkUserName(username);
      password = checkPassword(password);
    } catch (error) {
      return res.status(400).json({ title: "Login", error: error });
    }

    let user;
    try {
      user = await getUserByUserName(username);
      // if(Object.keys(user).length===0) {
      //   return res.status(404).render("login", {
      //     title: "Login",
      //     error: "Could not find the username",
      //   })
      // }
    } catch (error) {
      return res.status(500).render("error", {
        title: "Error",
        error: `Internal Server Error: ${error}`,
      });
    }

    if (Object.keys(user).length === 0) {
      return res.status(400).json({
        title: "Login",
        error: "Either username or password is incorrect!",
      });
    }
    const match = await bcrypt.compare(password, user.hashed_password);
    if (!match) {
      return res.status(400).json({
        title: "Login",
        error: "Either username or password is incorrect!",
      });
    }

    req.session.user = {
      _id: user._id,
      username: user.username,
      icon: user.icon,
      geocode: user.geocode,
    };
    return res.redirect("/user/profile");
  });
// if(!req.session.questions){
//   res.redirect('/user/gamestart')
// }else{
//     if(req.session.user){
//         let questions = req.session.questions;
//         let score = req.session.score;
//         let user =req.session.user;
//         for(let i=0;i<index;i++){
//             if(i<questions.length){
//                 let birdid = questions[i]['birdid'];
//                 await updatePlayerInfoById(user['_id'],{
//                   $pushLastQuestions: { birdid},
//                 });
//             }
//         }
//         delete req.session['questions'];
//         delete req.session['index'];
//         delete req.session['score'];
//         delete req.session['timer'];
//         res.render('game_end',{score});
//     }
//     else{
//         let score = req.session.score;
//         delete req.session['questions'];
//         delete req.session['index'];
//         delete req.session['score'];
//         delete req.session['timer'];
//         res.render('game_end',{score});
//     }
//   }
// });
// router
// .route("/login")
// .get(async (req, res) => {
//   const userId = req.session.user && req.session.user._id;
//   if (userId) return res.redirect("/user/profile");
//   return res.render("login", { title: "Login" });
// })
// .post(async (req, res) => {
//   const userId = req.session.user && req.session.user._id;
//   if (userId) return res.redirect("/user/profile");

//   let { username, password } = req.body;
//   try {
//     username = checkUserName(username);
//     password = checkPassword(password);
//   } catch (error) {
//     return res
//       .status(400)
//       .render("login", { title: "Login", errors: [error] });
//   }

//   let user;
//   try {
//     user = await getUserByUserName(username);
//   } catch (error) {
//     return res.status(500).render('error',{error: `Internal Server Error: ${error}`})
//     //return res.status(500).send("Internal Server Error:", error);
//   }

//   if (!user)
//     return res.status(400).render("login", {
//       title: "Login",
//       errors: ["Either username or password is incorrect!"],
//     });
//   if (!(await bcrypt.compare(password, user.hashed_password))) {
//     return res.status(400).render("login", {
//       title: "Login",
//       errors: ["Either username or password is incorrect!"],
//     });
//   }

//   req.session.user = { _id: user._id, username: user.username };
//   return res.redirect("/user/profile")
// });

router
  .route("/profile")
  .get(async (req, res) => {
    const hasUserId = req.session.user && req.session.user._id;
    if (!hasUserId) return res.redirect("/user/login");

    let user;
    try {
      user = await getUserById(req.session.user._id);
    } catch (error) {
      //return res.status(500).render("user_profile",{title: "User Profile", errors: error})
      //return res.status(500).send("Internal Server Error:", error);
      return res.status(500).render("error", {
        title: "Error",
        error: `Internal Server Error: ${error}`,
      });
    }

    return res.render("user_profile", {
      title: "User Profile",
      username: user.username,
      icon: user.icon,
      country: user.geocode.country,
      countryCode: user.geocode.countryCode,
      city: user.geocode.city,
      zipCode: user.geocode.zipcode,
      lifetime_score: user.lifetime_score,
      high_score: user.high_score,
      num_submissions: user.submission.length,
      submission: user.submission,
      last_questions: user.last_questions,
    });
  })
  .patch(async (req, res) => {
    // const hasUserId = req.session.user && req.session.user._id;
    // if (!hasUserId) return res.redirect("/login");
    // let user;
    // try {
    //   user = await getUserByUserName(req.session.user._id);
    // } catch (error) {
    //   return res.status(500).render("user_profile",{title: "User Profile", errors: [error]})
    //   //return res.status(500).send("Internal Server Error:", error);
    // }
    // let {
    //   newUserName,
    //   newPassword,
    //   newConfirmPassword,
    //   newIcon,
    //   newCountryCode,
    //   newCity,
    //   newZipCode,
    // } = req.body;
    // const fields2Update = {};
    // const errors = [];
    // if (newUserName) {
    //   try {
    //     newUserName = checkUserName(newUserName);
    //     if (newUserName === user.username)
    //       throw "Username is the same as before!";
    //     fields2Update["username"] = newUserName;
    //   } catch (error) {
    //     errors.push(error);
    //   }
    // }
    // if (newPassword) {
    //   try {
    //     newPassword = checkPassword(newPassword);
    //     if (newPassword !== newConfirmPassword)
    //       throw "Password and Confirm Password are not the same!";
    //     newPassword = await bcrypt.hash(newPassword, saltRounds);
    //     if (newPassword === user.hashed_password)
    //       throw "Password is the same as before!";
    //     fields2Update["hashed_password"] = newPassword;
    //   } catch (error) {
    //     errors.push(error);
    //   }
    // }
    // if (newIcon) {
    //   try {
    //     newIcon = checkImgUrl(newIcon, "Icon");
    //     if ((newIcon = user.icon)) throw "Icon is the same as before!";
    //     fields2Update["icon"] = newIcon;
    //   } catch (error) {
    //     errors.push(error);
    //   }
    // }
    // if (newCountryCode || newCity || newZipCode) {
    //   try {
    //     newCountryCode = checkCountryCode(newCountryCode, `new country code`);
    //     newCity = checkCity(newCity, `new city`);
    //     newZipCode = checkZipCode(newZipCode, `new zip code`);
    //     if (
    //       newCountryCode === user.geocode.countryCode &&
    //       newCity === user.geocode.city &&
    //       newZipCode === user.geocode.zipCode
    //     )
    //       throw "country code, city and zip code are the same as before!";
    //   } catch (error) {
    //     errors.push(error);
    //   }
    // }
    // if (fields2Update.length === 0)
    //   return res.render("user_profile", { title: "User Profile", errors });
    // if (errors.length > 0) {
    //   return res.status(400).render("user_profile", {
    //     title: "User Profile",
    //     errors,
    //   });
    // }
    // let geocodes;
    // try {
    //   geocodes = await geocoder.geocode({
    //     countryCode: newCountryCode,
    //     city: newCity,
    //     zipcode: newZipCode,
    //   });
    // } catch (error) {
    //   return res.status(500).render("user_profile",{title: "User Profile", error: error})
    //   //return res.status(500).send("Internal Server Error:", error);
    // }
    // if (!geocodes) {
    //   return res.status(400).render("user_profile", {
    //     errors: ["no such location found based on the input!"],
    //   });
    // }
    // if (geocodes.length > 1) {
    //   return res.status(400).render("user_profile", {
    //     errors: ["more than one location found based on the input!"],
    //   });
    // }
    // fields2Update["geocode"] = geocodes[0];
    // const updatedUser = await updatePersonalInfoById(userId, fields2Update);
  })
  .post(async (req, res) => {
    // reserved for AJAX
    const hasUserId = req.session.user && req.session.user._id;
    if (!hasUserId) return res.redirect("/user/login");

    let user;
    try {
      user = await getUserById(req.session.user._id);
    } catch (error) {
      //return res.status(500).render("user_profile",{title: "User Profile", errors: [error]})
      //return res.status(500).send("Internal Server Error:", error);
      return res.status(500).render("error", {
        title: "Error",
        error: `Internal Server Error: ${error}`,
      });
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

    const fields2Update = {};
    const errors = [];
    if (newUserName) {
      try {
        newUserName = checkUserName(newUserName);
        if (newUserName === user.username)
          throw "Username is the same as before!";
        fields2Update["username"] = newUserName;
      } catch (error) {
        return res.status(400).render("user_profile", {
          title: "User Profile",
          username: user.username,
          icon: user.icon,
          country: user.geocode.country,
          countryCode: user.geocode.countryCode,
          city: user.geocode.city,
          zipCode: user.geocode.zipcode,
          lifetime_score: user.lifetime_score,
          high_score: user.high_score,
          num_submissions: user.submission.length,
          submission: user.submission,
          last_questions: user.last_questions,
          errors: error,
        });
        //errors.push(error);
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
        fields2Update["hashed_password"] = newPassword;
      } catch (error) {
        return res.status(400).render("user_profile", {
          title: "User Profile",
          username: user.username,
          icon: user.icon,
          country: user.geocode.country,
          countryCode: user.geocode.countryCode,
          city: user.geocode.city,
          zipCode: user.geocode.zipcode,
          lifetime_score: user.lifetime_score,
          high_score: user.high_score,
          num_submissions: user.submission.length,
          submission: user.submission,
          last_questions: user.last_questions,
          errors: error,
        });
        //errors.push(error);
      }
    }
    if (newIcon) {
      try {
        newIcon = checkImgUrl(newIcon, "Icon");
        if (newIcon === user.icon) throw "Icon is the same as before!";

        fields2Update["icon"] = newIcon;
      } catch (error) {
        return res.status(400).render("user_profile", {
          title: "User Profile",
          username: user.username,
          icon: user.icon,
          country: user.geocode.country,
          countryCode: user.geocode.countryCode,
          city: user.geocode.city,
          zipCode: user.geocode.zipcode,
          lifetime_score: user.lifetime_score,
          high_score: user.high_score,
          num_submissions: user.submission.length,
          submission: user.submission,
          last_questions: user.last_questions,
          errors: error,
        });
        //errors.push(error);
      }
    }

    if (newCountryCode !== "invalid" || newCity || newZipCode) {
      try {
        newCountryCode = checkCountryCode(newCountryCode, `new country code`);
        newCity = checkCity(newCity, `new city`);
        newZipCode = checkZipCode(newZipCode, `new zip code`);

        if (
          newCountryCode === user.geocode.countryCode &&
          newCity === user.geocode.city &&
          newZipCode === user.geocode.zipcode
        ) {
          throw "Country code, city and zip code are the same as before!";
        }
      } catch (error) {
        return res.status(400).render("user_profile", {
          title: "User Profile",
          username: user.username,
          icon: user.icon,
          country: user.geocode.country,
          countryCode: user.geocode.countryCode,
          city: user.geocode.city,
          zipCode: user.geocode.zipcode,
          lifetime_score: user.lifetime_score,
          high_score: user.high_score,
          num_submissions: user.submission.length,
          submission: user.submission,
          last_questions: user.last_questions,
          errors: error,
        });
        //errors.push(error);
      }
    }

    let geocodes;
    try {
      //console.log(await geocoder.geocode("Hoboken, US, 07030"))
      // geocodes = await geocoder.geocode({
      //   countryCode: newCountryCode,
      //   city: newCity,
      //   zipcode: newZipCode,
      // });
      if (newCity && newCountryCode && newZipCode) {
        geocodes = await geocoder.geocode(
          `${newCity}, ${newCountryCode}, ${newZipCode}`
        );

        if (!geocodes || geocodes.length === 0) {
          return res.status(400).render("user_profile", {
            title: "User Profile",
            username: user.username,
            icon: user.icon,
            country: user.geocode.country,
            countryCode: user.geocode.countryCode,
            city: user.geocode.city,
            zipCode: user.geocode.zipcode,
            lifetime_score: user.lifetime_score,
            high_score: user.high_score,
            num_submissions: user.submission.length,
            submission: user.submission,
            last_questions: user.last_questions,
            errors: ["No such location found based on the input!"],
          });
        }
        if (geocodes.length > 1) {
          return res.status(400).render("user_profile", {
            title: "User Profile",
            username: user.username,
            icon: user.icon,
            country: user.geocode.country,
            countryCode: user.geocode.countryCode,
            city: user.geocode.city,
            zipCode: user.geocode.zipcode,
            lifetime_score: user.lifetime_score,
            high_score: user.high_score,
            num_submissions: user.submission.length,
            submission: user.submission,
            last_questions: user.last_questions,
            errors: ["More than one location found based on the input!"],
          });
        }

        fields2Update["geocode"] = geocodes[0];
      }
    } catch (error) {
      //return res.status(500).render("user_profile",{title: "User Profile", errors: [error]})
      //return res.status(500).send("Internal Server Error:", error);
      return res
        .status(500)
        .render("error", { error: `Internal Server Error: ${error}` });
    }

    if (Object.keys(fields2Update).length === 0) {
      return res.render("user_profile", {
        title: "User Profile",
        username: user.username,
        icon: user.icon,
        country: user.geocode.country,
        countryCode: user.geocode.countryCode,
        city: user.geocode.city,
        zipCode: user.geocode.zipcode,
        lifetime_score: user.lifetime_score,
        high_score: user.high_score,
        num_submissions: user.submission.length,
        submission: user.submission,
        last_questions: user.last_questions,
        errors: ["No fields to update!"],
      });
    }
    if (errors.length > 0) {
      return res.status(400).render("user_profile", {
        title: "User Profile",
        username: user.username,
        icon: user.icon,
        country: user.geocode.country,
        countryCode: user.geocode.countryCode,
        city: user.geocode.city,
        zipCode: user.geocode.zipcode,
        lifetime_score: user.lifetime_score,
        high_score: user.high_score,
        num_submissions: user.submission.length,
        submission: user.submission,
        last_questions: user.last_questions,
        errors,
      });
    }

    try {
      const updatedUser = await updatePersonalInfoById(
        req.session.user._id,
        fields2Update
      );
      if(fields2Update["username"]){
        req.session.user.username = fields2Update["username"]
      }
    } catch (error) {
      return res.status(500).render("error", {
        title: "Error",
        error: `Internal Server Error: ${error}`,
      });
    }

    return res.redirect("/user/profile");
  });

router
  .route("/post")
  .get(async (req, res) => {
    const userId = req.session.user && req.session.user._id;
    if (!userId) return res.redirect("/user/login");

    let user;
    try {
      user = await getUserById(userId);
    } catch (error) {
      //return res.status(500).render("bird_submission",{title: "Bird Image Submission Form", errors: [error]})
      return res.status(500).render("error", {
        title: "Error",
        error: `Internal Server Error: ${error}`,
      });
      //res.status(500).send("Internal Server Error");
    }

    return res.render("bird_submission", {
      title: "Bird Image Submission Form",
      user: user,
    });
  })
  .post(async (req, res) => {
    const userId = req.session.user && req.session.user._id;
    if (!userId) return res.redirect("/login");

    let {
      bird_names,
      bird_img,
      bird_countryCode,
      bird_city,
      bird_zipCode,
      bird_difficulty,
    } = req.body;

    try {
      bird_names = checkStr(bird_names, "Bird Names");
      bird_names = bird_names.split(",");
      bird_names = checkStrArr(bird_names, "Bird Names");
      bird_img = checkImgUrl(bird_img, "Bird Image");

      if (await hasBirdWithImageUrl(bird_img)) {
        throw "A bird with this image url already exists in the database!";
      }

      if (bird_countryCode === "invalid") {
        throw "You must select a country for the bird image.";
      }
      bird_countryCode = checkCountryCode(
        bird_countryCode,
        "Bird Country Code"
      );
      bird_city = checkCity(bird_city, "Bird City");
      if (bird_zipCode && bird_zipCode !== "")
        bird_zipCode = checkZipCode(bird_zipCode, "Bird Zip Code");
      bird_difficulty = checkDifficulty(
        parseInt(bird_difficulty),
        "Bird Difficulty"
      );
    } catch (error) {
      return res.status(400).render("bird_submission", {
        title: "Bird Image Submission Form",
        errors: [error],
      });
    }

    let geocodes;
    try {
      // geocodes = await geocoder.geocode({
      //   countryCode: bird_countryCode,
      //   address: bird_city,
      //   zipcode: bird_zipCode,
      // });
      if (bird_zipCode && bird_zipCode !== "") {
        geocodes = await geocoder.geocode(
          `${bird_city}, ${bird_countryCode}, ${bird_zipCode}`
        );
      } else {
        geocodes = await geocoder.geocode(`${bird_city}, ${bird_countryCode}`);
      }

      let geocode = geocodes[0];
      geocode = checkGeoCode(geocode, "Bird Geocode");
      geocode = extractKV_objArr(
        geocode,
        ["latitude", "longitude", "country", "countryCode", "city"],
        { ifFilterUndefined: false }
      );
    } catch (error) {
      //return res.status(500).render('error',{error: `Internal Server Error: ${error}`})
      //return res.status(500).render("bird_submission",{title: "Bird Image Submission Form", errors: [error]})
      //return res.status(500).send("Internal Server Error:", error);
      return res.status(400).render("bird_submission", {
        title: "Bird Image Submission Form",
        errors: ["Location data is invalid!"],
      });
    }

    if (!geocodes) {
      return res.status(400).render("bird_submission", {
        title: "Bird Image Submission Form",
        errors: ["No location found based on given country and city"],
      });
    }
    if (geocodes.length > 1) {
      return res.status(400).render("bird_submission", {
        title: "Bird Image Submission Form",
        errors: [
          "Multiple locations found based on given country and city, please provide a zipcode to help us locate more accurately",
        ],
      });
    }

    let newBird;
    try {
      newBird = await createBird({
        userId: userId,
        url: bird_img,
        names: bird_names,
        geocode: geocodes[0],
        difficulty: bird_difficulty,
      });
    } catch (error) {
      return res.status(500).render("error", {
        title: "Error",
        error: `Internal Server Error: ${error}`,
      });
      //return res.status(500).render("bird_submission",{title: "Bird Image Submission Form", errors: [error]})
      //return res.status(500).send("Internal Server Error:", error);
    }

    // let updatedPersonalInfo;
    // try {
    //   updatedPersonalInfo = await updatePlayerInfoById(userId, {
    //     $pushSubmission: { birdId: newBird._id},
    //   });
    // } catch (error) {
    //   return res.status(500).render('error',{error: `Internal Server Error: ${error}`})
    //   //return res.status(500).render("bird_submission",{title: "Bird Image Submission Form", errors: [error]})
    //   //return res.status(500).send("Internal Server Error:", error);
    // }

    return res.redirect("/user/profile");

    // try {
    //   geocodes = checkGeoCode(geocode, "Bird Geocode");
    //   geocodes = extractKV_objArr(
    //     geocode,
    //     ["latitude", "longitude", "country", "countryCode", "city"],
    //     { ifFilterUndefined: false }
    //   );
    // } catch (error) {
    //   return res.status(500).render('error',{error: `Internal Server Error: ${error}`})
    //   //return res.status(500).render("bird_submission",{title: "Bird Image Submission Form", errors: [error]})
    //   //return res.status(500).send("Internal Server Error:", error);
    // }

    // if (!geocodes) {
    //   return res.status(400).render("bird_submission", {
    //     errors: ["no location found based on given country and city"],
    //   });
    // }
    // if (geocodes.length > 1) {
    //   return res.status(400).render("bird_submission", {
    //     errors: [
    //       "multiple locations found based on given country and city, please provide a zipcode to help us locate more accurately",
    //     ],
    //   });
    // }
  });

router.route("/logout").get((req, res) => {
  const userId = req.session.user && req.session.user._id;
  const username = req.session.user && req.session.user.username;
  req.session.destroy();
  res.render("logout", {title:"Logout", username });
});

export default router;
