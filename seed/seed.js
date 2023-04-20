import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import {
  usersDataFn as usersData,
  birdsDataFn as birdsData,
} from "../data/index.js";
import fs from "fs/promises";
import crypto from "crypto";
import path from "path";
import { geocoderConfig } from "../config/settings.js";
import GeoCoder from "node-geocoder";

const displayUserIds = process.argv.includes("-uid");
const displayBirdIds = process.argv.includes("-bid");
const displayAllUsers = process.argv.includes("-all");
const VERBOSE = process.argv.includes("-v");

// const geocoder = GeoCoder(geocoderConfig);

// ------------------ initialize database ------------------
const _db = await dbConnection();
await _db.dropDatabase();

// -------- get some birds data & geocode data -------------
const national2Birds_raw = await fs.readFile(
  path.resolve("static/wiki_national_birds.json"),
  "utf-8"
);
const nation_geocodes_raw = await fs.readFile(
  path.resolve("static/nation_geocodes.json"),
  "utf-8"
);
const national2Birds = JSON.parse(national2Birds_raw);
const nation_geocodes = JSON.parse(nation_geocodes_raw);

const birds = [];
for (const [nation, nation_birds] of Object.entries(national2Birds)) {
  for (const nation_bird of nation_birds) {
    const aBird = {};
    aBird.url = nation_bird.pic;
    aBird.names = [nation_bird.name, nation_bird.name_sci];
    aBird.geocode = nation_geocodes[nation];
    aBird.difficulty = Math.floor(Math.random() * 5) + 1;
    birds.push(aBird);
  }
}

// ------------------ create users -------------------------
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

const userIds = [];
for (const user of users) {
  const newUser = await usersData.createUser(user);
  userIds.push(newUser._id);
}
console.log(VERBOSE || displayUserIds ? userIds : "");
console.log("Seed Users Done!");

// ------------------- create birds ---------------------------
const birdIds = [];
for (const bird of birds) {
  const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
  const newBird = await birdsData.createBird({ userId: randomUserId, ...bird });
  birdIds.push(newBird._id);
}

console.log(VERBOSE || displayBirdIds ? birdIds : "");
console.log("Seed Birds Done!");

// ----------- add some last_questions and scores --------------
for (const birdId of birdIds) {
  const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];

  await usersData.updatePlayerInfoById(randomUserId, {
    $pushLastQuestions: { birdId },
  });
}
console.log();
console.log("Seed Last Questions Done!");

for (const userId of userIds) {
  const randomHighScore = Math.floor(Math.random() * 100) + 1;
  const randomLifetimeScore = Math.floor(Math.random() * 1000);

  await usersData.updatePlayerInfoById(userId, {
    $incScores: { high_score: randomHighScore },
  });
  await usersData.updatePlayerInfoById(userId, {
    $incScores: { lifetime_score: randomLifetimeScore },
  });
}
console.log();
console.log("Seed Scores Done!");

// ---------------- report --------------------
const allUsers = await usersData.getAllUsers();

await closeConnection();
console.log(VERBOSE || displayAllUsers ? allUsers : "");
console.log("Seed Done!");
