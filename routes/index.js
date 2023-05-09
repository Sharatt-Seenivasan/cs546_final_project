import leaderboardRoutes from "./leaderboard.js";
import userRoutes from "./users.js";
import gameRoutes from "./game.js";
import path from "path";
import { getUserByUserName } from "../data/users.js";

const constructorMethod = (app) => {
  app.use("/user", userRoutes);
  app.use("/game", gameRoutes);
  app.use("/leaderboard", leaderboardRoutes);
  app.use("/", async (req, res) => {
    if (req.session.user) {
      res.render("homepage", {
        title: "Homepage",
        user: req.session.user,
        icon: req.session.user.icon,
      });
    } else {
      res.render("homepage", { title: "Homepage", user: req.session.user });
    }
  });
};

export default constructorMethod;
