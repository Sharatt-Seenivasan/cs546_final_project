import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import {
  usersDataFn as usersData,
  birdsDataFn as birdsData,
} from "../data/index.js";
import fs from "fs/promises";
import path from "path";
import bcrypt from "bcrypt";
import { geocoderConfig } from "../config/settings.js";
import GeoCoder from "node-geocoder";
import { brotliCompressSync } from "zlib";
const saltRounds = 16;
const birds_data_path = path.resolve("static/birds.json");
const users_data_path = path.resolve("static/users.json");

const displayUserIds = process.argv.includes("-uid");
const displayBirdIds = process.argv.includes("-bid");
const displayAllUsers = process.argv.includes("-all");
const VERBOSE = process.argv.includes("-v");

// const geocoder = GeoCoder(geocoderConfig);

// ------------------ initialize database ------------------
const _db = await dbConnection();
await _db.dropDatabase();

// -------- get birds data & users data-------------
const birds_raw = await fs.readFile(birds_data_path, "utf-8");
const users_raw = await fs.readFile(users_data_path, "utf-8");
const birds = JSON.parse(birds_raw);
const users = JSON.parse(users_raw);

// ------------------ create users -------------------------
const userIds = [];
for (const user of users) {
  const newUser = await usersData.createUser(
    user.username,
    user.hashed_password
  );
  await usersData.updatePersonalInfoById(newUser._id, {
    geocode: user.geocode,
    icon: user.icon,
  });
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
