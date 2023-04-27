import express from "express";
import exphbs from "express-handlebars";
import session from "express-session";

import configRoutes from "./routes/index.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const hbs = exphbs.create({
  defaultLayout: "main",
  helpers: {
    asJSON: (obj, spacing) => {
      if (typeof spacing === "number")
        return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));
      return new Handlebars.SafeString(JSON.stringify(obj));
    },
    inc: (value, options) =>{
      return parseInt(value) + 1;
    },
  },
  partialsDir: ["views/partials/"], // by default
});

app.use(session({
  name: 'AuthCookie',
  secret:'some secret string!',
  resave: false,
  saveUninitialized: true
}))

app.use("/public", express.static(__dirname + "/public"));
app.use("/static", express.static(__dirname + "/static"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", hbs.engine);
app.set("views", __dirname + "/views"); // by default
app.set("view engine", "handlebars");

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
