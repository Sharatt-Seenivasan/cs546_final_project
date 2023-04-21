import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import {
  usersDataFn as usersData,
  birdsDataFn as birdsData,
  questionsFn as questionData,
} from "../data/index.js";
import { ObjectId } from "mongodb";

const generalUser = {
  username: "Zoe",
  hashed_password: "1234",
  icon: "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
  geocode: {
    latitude: -19.015438,
    longitude: 29.154857,
    country: "Zimbabwe",
    countryCode: "ZW",
    city: "somewhere in Zimbabwe",
  },
};
const generalBird = {
  url: "https://about.twitter.com/content/dam/about-twitter/en/brand-toolkit/brand-download-img-1.jpg.twimg.1920.jpg",
  names: ["twitter", "doge"],
  geocode: {
    latitude: -13.133897,
    longitude: 27.849332,
    country: "Zambia",
    countryCode: "ZM",
    city: "somewhere in Zambia",
  },
  difficulty: 2.5,
};
const allUsers = await usersData.getAllUsers();
const allBirds = await birdsData.getAllBirds();
const allUserIds = allUsers.map((user) => user._id);
const allBirdIds = allBirds.map((bird) => bird._id);

const badUserName = "";
const badUserPassword = "";
const badUserIcon = "";
const badUserGeoCode = "";

const badBirdUrl = "";
const badBirdNames = "";
const badBirdGeoCode = "";
const badBirdDifficulty = "";
// ------------------ problematic input -------------------------
// ------------------ users --------------------
console.log("------------------ createUser ------------------");
try {
  const duplicateUserName = await usersData.createUser({
    username: "Alice",
    hashed_password: "1234",
    icon: generalUser.icon,
    geocode: generalUser.geocode,
  });
  console.log("Unexpected", duplicateUserName);
} catch (error) {
  console.log("Expected", error);
}

console.log("------------------ getUserById ------------------");
try {
  const getByInvalidId = await usersData.getUserById("xxx");
  console.log("Unexpected", getByInvalidId);
} catch (error) {
  console.log("Expected", error);
}

console.log("------------------ removeUserById ------------------");
try {
  const removeByNonExistentId = await usersData.removeUserById(
    new ObjectId().toString()
  );
  console.log("Unexpected", removeByNonExistentId);
} catch (error) {
  console.log("Expected", error);
}

console.log("------------------ updatePlayerInfoById ------------------");
try {
  const negativeHighScoreIncrement = await usersData.updatePlayerInfoById(
    allUserIds[0],
    { $incScores: { high_score: -1 } }
  );
  console.log("Unexpected", negativeHighScoreIncrement);
} catch (error) {
  console.log("Expected", error);
}

try {
  const negativeLifetimeScroeResult = await usersData.updatePlayerInfoById(
    allUserIds[0],
    { $incScores: { lifetime_score: -1000 } }
  );
  console.log("Unexpected", negativeLifetimeScroeResult);
} catch (error) {
  console.log("Expected", error);
}

try {
  const pullByNonExistentBirdId = await usersData.updatePlayerInfoById(
    allUserIds[0],
    { $pullSubmission: { birds: new ObjectId().toString() } }
  );
  console.log("Unexpected", pullByNonExistentBirdId);
} catch (error) {
  console.log("Expected", error);
}

console.log("------------------ updatePersonalInfoById ------------------");
try {
  const noChangePersonalInfoUpdate = await usersData.updatePersonalInfoById(
    allUserIds[0],
    { username: "Alice" }
  );
  console.log("Unexpected", noChangePersonalInfoUpdate);
} catch (error) {
  console.log("Expected", error);
}

try {
  const existedUserNameUpdate = await usersData.updatePersonalInfoById(
    allUserIds[1],
    { username: "Alice" }
  );
  console.log("Unexpected", existedUserNameUpdate);
} catch (error) {
  console.log("Expected", error);
}

console.log("------------------ topNthLocalUsers ------------------");
try {
  const topNthLocalUsersByFictitiousCountry = await usersData.topNthLocalUsers(
    10,
    "ABC",
    "all"
  );
  console.log("Unexpected", topNthLocalUsersByFictitiousCountry);
} catch (error) {
  console.log("Expected", error);
}

// ------------------ birds --------------------
console.log("------------------ getBirdById ------------------");
try {
  const getByNonExistentId = await birdsData.getBirdById(
    new ObjectId().toString()
  );
  console.log("Unexpected", getByNonExistentId);
} catch (error) {
  console.log("Expected", error);
}

console.log("------------------ getLocalBirds ------------------");
try {
  const getLocalBirdsByFictitiousCountry = await birdsData.getLocalBirds(
    "ABC",
    "all"
  );
  console.log("Unexpected", getLocalBirdsByFictitiousCountry);
} catch (error) {
  console.log("Expected", error);
}

console.log("------------------ removeBirdById ------------------");
try {
  const removeByNonExistentId = await birdsData.removeBirdById(
    new ObjectId().toString()
  );
  console.log("Unexpected", removeByNonExistentId);
} catch (error) {
  console.log("Expected", error);
}

console.log("------------------ updateBirdById ------------------");
try {
  const bird0 = await birdsData.getBirdById(allBirdIds[0]);
  const { url, names, geocode, difficulty } = bird0;
  const noChangeBirdUpdate = await birdsData.updateBirdById(
    { url, names, geocode, difficulty },
    allBirdIds[0]
  );
  console.log("Unexpected", noChangeBirdUpdate);
} catch (error) {
  console.log("Expected", error);
}
console.log("-------------------questions retrival ---------------");
try{
  console.log("expected :") 
  console.log(await questionData.getQuestions(allUsers[0]['_id']));
}catch(error){
  console.log("Unexpected : "+error);
}

// ------------------ done ---------------------
console.log("------------------------ DONE ---------------------------");
await closeConnection();
