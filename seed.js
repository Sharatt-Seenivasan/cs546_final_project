import { dbConnection, closeConnection } from "./config/mongoConnection.js";
import {
  usersDataFn as usersData,
  birdsDataFn as birdsData,
} from "./data/index.js";
import { geocoderConfig } from "./config/settings.js";
import GeoCoder from "node-geocoder";
import fs from "fs/promises";
import crypto from "crypto";

const geocoder = GeoCoder(geocoderConfig);

// ------------------ Initialize Database ------------------
const _db = await dbConnection();
await _db.dropDatabase();

// -------- Get Some Birds Data & GeoCode Data -------------
const national2Birds_raw = await fs.readFile(
  "./wiki_national_birds.json",
  "utf-8"
);
const nation_geocodes_raw = await fs.readFile(
  "./nation_geocodes.json",
  "utf-8"
);
const national2Birds = JSON.parse(national2Birds_raw);
const nation_geocodes = JSON.parse(nation_geocodes_raw);


for (const [nation, birds] of Object.entries(national2Birds)) {
  console.log(nation,birds);
}

// const birds = [];
// for (const [nation, birds] of Object.entries(national2Birds)) {
//   for (const bird of birds) {
//     console.log(bird);
//     const aBird = {};
//     aBird.url = bird.pic;
//     aBird.names = [bird.name, bird.name_sci];
//     aBird.geocode = nation_geocodes[nation];
//     aBird.difficulty = Math.floor(Math.random() * 5) + 1;
//     birds.push(aBird);
//     // console.log(aBird);
//   }
// }

console.log('here line46');

// ------------------ Create Users -------------------------
const users = [];
const usernames = [
  "Alice",
  "Bob",
  "Charlie",
  "David",
  "Eve",
  "Frank",
  "Grace",
  "Hannah",
  "Ivan",
  "Judy",
  "Karl",
  "Linda",
];
const user_icons = [
  "https://developer.mozilla.org/static/media/theme-os-default.b14255eadab403fa2e8a.svg",
  "https://developer.mozilla.org/static/media/chrome.4c57086589fd964c05f5.svg",
  "https://developer.mozilla.org/static/media/edge.40018f6a959bc3e5c537.svg",
  "https://developer.mozilla.org/static/media/simple-firefox.9b9181d8c30c3de88edf.svg",
  "https://developer.mozilla.org/static/media/opera.a0ab0c5004c00e618a00.svg",
  "https://developer.mozilla.org/static/media/safari.3679eb31121b46323304.svg",
  "https://developer.mozilla.org/static/media/samsunginternet.55e41ddfc05627ecc331.svg",
  "https://developer.mozilla.org/static/media/webview.7d9bf32041e0c57240b5.svg",
  "https://developer.mozilla.org/static/media/deno.a791d0899729b3089500.svg",
  "https://developer.mozilla.org/static/media/nodejs.bb93afa7923c2473034b.svg",
  "https://developer.mozilla.org/static/media/twitter.cc5b37feab537ddbf701.svg",
  "https://developer.mozilla.org/static/media/github-mark-small.348586b8904b950b8ea8.svg",
];

for (let idx = 0; idx < usernames.length; idx++) {
  const user = {};
  const username = usernames[idx];
  user["username"] = username;
  user["hashed_password"] = crypto
    .createHash("sha256")
    .update(username)
    .digest("hex");
  user["icon"] = user_icons[idx];
  user["geocode"] = Object.values(nation_geocodes)[idx];
  users.push(user);
}

console.log(users);

const userIds = [];
for (const user of users) {
  const newUser = await usersData.createUser(user);
  userIds.push(newUser._id);
}

// -------------------create birds---------------------------
const birdIds=[];
for (const bird of birds) {
  const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
  bird['userId'] = randomUserId;
  const newBird = await birdsData.createBird(bird);
  birdIds.push(newBird._id);
}

console.log(birdIds);

await closeConnection();
console.log("Seed Done!");
