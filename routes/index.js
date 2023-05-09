import leaderboardRoutes from "./leaderboard.js";
import userRoutes from "./users.js";
import gameRoutes from "./game.js";
import path from "path";
import { getUserByUserName, getUserById } from "../data/users.js";

const constructorMethod = (app) => {
  app.use("/user", userRoutes);
  app.use("/game", gameRoutes);
  app.use("/leaderboard", leaderboardRoutes);
  app.use("/", async (req, res) => {
    if (req.session.user) {
      const user = await getUserById(req.session.user._id)
      const icon = user.icon
      res.render("homepage", {
        title: "Homepage",
        user: req.session.user,
        icon: icon,
      });
    } else {
      res.render("homepage", { title: "Homepage", user: req.session.user });
    }
  });
};

export default constructorMethod;
