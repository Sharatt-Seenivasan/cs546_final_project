import { usersCollection as users } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import {
  checkUserName,
  checkStr,
  checkId,
  checkImgUrl,
  checkGeoCode,
  checkCountryCode,
  checkNumber,
  objectId2str_doc,
  objectId2str_docs_arr,
  objsEqual,
} from "../helpers.js";
//import async from "hbs/lib/async.js";

const createUser = async (username, hashed_password) => {
  const __name = createUser.name;
  username = checkUserName(username, `username at ${__name}`);
  hashed_password = checkStr(hashed_password, `hashed_password at ${__name}`);

  const userCollection = await users();
  const userFields = {
    username,
    hashed_password,
    icon: "",
    geocode:{},
    lifetime_score: 0,
    high_score: 0,
    submission: [],
    last_questions: [],
  };

  const ifExistedInfo = await userCollection.findOne({ username: username});
  if (ifExistedInfo) throw `User ${username} already existed`;

  const insertInfo = await userCollection.insertOne(userFields);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
    throw `Could not add user ${username}`;

  const userId = insertInfo.insertedId.toString();

  return await getUserById(userId);
};

const getUserById = async (userId) => {
  const __name = getUserById.name;
  userId = checkId(userId, `user id at ${__name}`);

  const userCollection = await users();
  const user = await userCollection.findOne({ _id: new ObjectId(userId) });
  if (!user) throw `User with id ${userId} not found`;

  return objectId2str_doc(user);
};

const getUserByUserName = async (username) => {
  const __name = getUserByUserName.name;
  username = checkUserName(username, `username at ${__name}`);
  const userCollection = await users();

  // const patern=new RegExp(`^${username}$`);
  const theUser = await userCollection.findOne({ username: { $regex: `${username}`, $options: "i" } });
  if (!theUser) return {};
  return objectId2str_doc(theUser);
};

const getAllUsers = async () => {
  const userCollection = await users();
  const allUsers = await userCollection.find({}).toArray();
  if (!allUsers) throw "Could not get all users";

  return objectId2str_docs_arr(allUsers);
};

const removeUserById = async (userId) => {
  const __name = removeUserById.name;
  userId = checkId(userId, `user id at ${__name}`);

  const userCollection = await users();
  const deletionInfo = await userCollection.findOneAndDelete({
    _id: new ObjectId(userId),
  });
  if (deletionInfo.lastErrorObject.n === 0)
    throw `Could not delete user with id ${userId}`;

  return objectId2str_doc(deletionInfo.value);
};

const updatePersonalInfoById = async (
  userId,
  { username, hashed_password, icon, geocode } = {}
) => {
  const __name = updatePersonalInfoById.name;
  const theUser = await getUserById(userId);
  const fields2Update = {
    username,
    hashed_password,
    icon,
    geocode,
  };

  for (const [k, v] of Object.entries(fields2Update)) {
    if (v === undefined) {
      delete fields2Update[k];
      continue;
    }

    switch (k) {
      case "username":
        fields2Update[k] = checkStr(v, `username at ${__name}`);
        if (fields2Update[k] === theUser.username)
          throw `Username is already ${v}, please provide a new one to update`;
        break;
      case "hashed_password":
        fields2Update[k] = checkStr(v, `hashed_password at ${__name}`);
        if (fields2Update[k] === theUser.hashed_password)
          throw `Password is already ${v}, please provide a new one to update`;
        break;
      case "icon":
        fields2Update[k] = checkImgUrl(v, `icon at ${__name}`);
        if (fields2Update[k] === theUser.icon)
          throw `Icon is already ${v}, please provide a new one to update`;
        break;
      case "geocode":
        fields2Update[k] = checkGeoCode(v, `geocode at ${__name}`);
        if (objsEqual(fields2Update[k], theUser.geocode))
          throw `Geocode is already ${v}, please provide a new one to update`;
        break;
      default:
        break;
    }
  }
  if (Object.keys(fields2Update).length === 0)
    throw "No field provided to update personal info";

  const userCollection = await users();

  if (username) {
    username = checkUserName(username, `username at ${__name}`);
    const ifUserNameExisted = await userCollection.findOne({ username });
    if (ifUserNameExisted) throw `User ${username} already existed`;
  }

  const updateInfo = await userCollection.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $set: fields2Update },
    { returnDocument: "after" }
  );
  if (updateInfo.lastErrorObject.n === 0)
    throw `Could not update user with id ${userId}`;

  return objectId2str_doc(updateInfo.value);
};

const updatePlayerInfoById = async (userId, operation) => {
  if (typeof operation !== "object" || Array.isArray(operation))
    throw `Provided ${operation}. Operation should be an object`;
  if (Object.keys(operation).length !== 1)
    throw "Exactly one operation should be provided to update player info";
  let updateInfo;
  const {
    $incScores,
    $pushSubmission,
    $pushLastQuestions,
    $pullSubmission,
    $pullLastQuestions,
    $resetLastSeenQuestions,
  } = operation;
  if ($incScores) updateInfo = await incrementScoresById(userId, $incScores);
  if ($pushSubmission)
    updateInfo = await pushSubmissionByIds(userId, $pushSubmission);
  if ($pushLastQuestions)
    updateInfo = await pushLastQuestionsByIds(userId, $pushLastQuestions);
  if ($pullSubmission)
    updateInfo = await pullSubmissionByBirdId($pullSubmission);
  if ($pullLastQuestions)
    updateInfo = await pullLastQuestionsByIds($pullLastQuestions);
  if($resetLastSeenQuestions)
    updateInfo = await resetLastQuestionsById(userId,$resetLastSeenQuestions);
  return updateInfo;
};
const resetLastQuestionsById = async(userId,{last_questions}={})=>{
  
  const __name = resetLastQuestionsById.name;
  userId = checkId(userId, `user id at ${__name}`);

  const userCollection = await users();
  let ifExists = await userCollection.findOne({ _id: new ObjectId(userId) });
  if (!ifExists) throw `No such user with id ${userId}`;

  const updateInfo = await userCollection.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $set: { last_questions: [] } },
    { returnDocument: "after" }
  );

  if (updateInfo.lastErrorObject.n === 0)
    throw "Could not reset";

  return objectId2str_doc(updateInfo.value);
}
const incrementScoresById = async (id, { high_score, lifetime_score } = {}) => {
  const __name = incrementScoresById.name;
  id = checkId(id, `user id at ${__name}`);

  const userCollection = await users();
  const ifExists = await userCollection.findOne({ _id: new ObjectId(id) });
  if (!ifExists) throw `No such user with id ${id}`;
  if (!high_score && !lifetime_score) throw "No score provided to increment";
  let high_score_inc = 0,
    lifetime_score_inc = 0;
  if (high_score)
    high_score_inc = checkNumber(
      high_score,
      `high score increment at ${__name}`
    );
  if (lifetime_score)
    lifetime_score_inc = checkNumber(
      lifetime_score,
      `lifetime score increment at ${__name}`
    );

  const updateInfo = await userCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $inc: { high_score: high_score_inc, lifetime_score: lifetime_score_inc },
    },
    { returnDocument: "after" }
  );

  return objectId2str_doc(updateInfo.value);
};

const pullSubmissionByBirdId = async ({ birdId } = {}) => {
  const __name = pullSubmissionByBirdId.name;
  birdId = checkId(birdId, `bird id at ${__name}`);

  const userCollection = await users();
  const ifExists = await userCollection.findOne({
    submission: { $elemMatch: { $eq: new ObjectId(birdId) } },
  });
  if (!ifExists) throw `No such bird with id ${birdId}`;
  const updateInfo = await userCollection.findOneAndUpdate(
    {
      submission: { $elemMatch: { $eq: new ObjectId(birdId) } },
    },
    { $pull: { submission: new ObjectId(birdId) } },
    { returnDocument: "after" }
  );

  if (updateInfo.lastErrorObject.n === 0)
    throw `Could not pull bird with bird id ${birdId} from the user submission`;

  return objectId2str_doc(updateInfo.value);
};

const pushSubmissionByIds = async (userId, { birdId } = {}) => {
  const __name = pushSubmissionByIds.name;
  userId = checkId(userId, `user id at ${__name}`);
  birdId = checkId(birdId, `bird id at ${__name}`);

  const userCollection = await users();
  let ifExists = await userCollection.findOne({ _id: new ObjectId(userId) });
  if (!ifExists) throw `No such user with id ${userId}`;

  ifExists = objectId2str_doc(ifExists);
  if (ifExists.submission.includes(birdId))
    throw `Bird with id ${birdId} already existed in the user submission list`;

  const updateInfo = await userCollection.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $push: { submission: new ObjectId(birdId) } },
    { returnDocument: "after" }
  );

  if (updateInfo.lastErrorObject.n === 0)
    throw "Could not push bird to the user submission";

  return objectId2str_doc(updateInfo.value);
};

const pushLastQuestionsByIds = async (userId, { birdId } = {}) => {
  const __name = pushLastQuestionsByIds.name;
  userId = checkId(userId, `user id at ${__name}`);
  birdId = checkId(birdId, `bird id at ${__name}`);

  const userCollection = await users();
  let ifExists = await userCollection.findOne({ _id: new ObjectId(userId) });
  if (!ifExists) throw `No such user with id ${userId}`;

  ifExists = objectId2str_doc(ifExists);
  if (ifExists.last_questions.includes(birdId))
    throw `Bird with id ${birdId} already existed in the user last questions list`;

  const updateInfo = await userCollection.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $push: { last_questions: new ObjectId(birdId) } },
    { returnDocument: "after" }
  );

  if (updateInfo.lastErrorObject.n === 0)
    throw "Could not push bird to the user last questions";

  return objectId2str_doc(updateInfo.value);
};

const topNthLocalUsers = async (n, countryCode, city) => {
  const __name = topNthLocalUsers.name;
  n = checkNumber(n, `n at ${__name}`, { inclusiveMin: 1 });
  countryCode = checkCountryCode(countryCode, `country code at ${__name}`);
  city = checkStr(city, `city at ${__name}`);

  const userCollection = await users();
  let topUsers;
  if (city === "all") {
    topUsers = await userCollection
      .find({ "geocode.countryCode": countryCode })
      .sort({ lifetime_score: -1 })
      .limit(n)
      .toArray();
    if (topUsers.length === 0) throw `No users in ${countryCode}`;
  } else {
    topUsers = await userCollection
      .find({ "geocode.countryCode": countryCode, "geocode.city": city })
      .sort({ lifetime_score: -1 })
      .limit(n)
      .toArray();
    if (topUsers.length === 0) throw `No users in ${city}, ${countryCode}`;
  }
  if (!topUsers)
    throw `Could not get top ${n} users in ${city}, ${countryCode}`;

  return objectId2str_docs_arr(topUsers);
};

const topNthGlobalUsers = async (n) => {
  const __name = topNthGlobalUsers.name;
  n = checkNumber(n, `n at ${__name}`, { inclusiveMin: 1 });

  const userCollection = await users();
  const topUsers = await userCollection
    .find({})
    .sort({ lifetime_score: -1 })
    .limit(n)
    .toArray();
  if (!topUsers) throw `Could not get top ${n} users`;

  return objectId2str_docs_arr(topUsers);
};

const topNthGlobalUsersByHighScore = async (n) => {
  const __name = topNthGlobalUsersByHighScore.name;
  n = checkNumber(n, `n at ${topNthGlobalUsersByHighScore}`, {
    inclusiveMin: 1,
  });

  const userCollection = await users();
  const topUsers = await userCollection
    .find({})
    .sort({ high_score: -1 })
    .limit(n)
    .toArray();
  if (!topUsers) throw `Could not get top ${n} users`;

  return objectId2str_docs_arr(topUsers);
};

const topNthLocalUsersByHighScore = async (n, countryCode, city) => {
  const __name = topNthLocalUsersByHighScore.name;
  n = checkNumber(n, `n at ${topNthLocalUsersByHighScore}`, {
    inclusiveMin: 1,
  });
  countryCode = checkCountryCode(countryCode, `country code at ${__name}`);
  city = checkStr(city, `city at ${__name}`);

  const userCollection = await users();
  let topUsers;
  if (city === "all") {
    topUsers = await userCollection
      .find({ "geocode.countryCode": countryCode })
      .sort({ high_score: -1 })
      .limit(n)
      .toArray();
    //if (topUsers.length === 0) throw `No users in ${countryCode}`;
  } else {
    topUsers = await userCollection
      .find({ "geocode.countryCode": countryCode, "geocode.city": city })
      .sort({ high_score: -1 })
      .limit(n)
      .toArray();
    //if (topUsers.length === 0) throw `No users in ${city}, ${countryCode}`;
  }
  if (!topUsers)
    throw `Could not get top ${n} users in ${city}, ${countryCode}`;

  return objectId2str_docs_arr(topUsers);
};

export {
  createUser,
  getUserById,
  getUserByUserName,
  getAllUsers,
  removeUserById,
  updatePersonalInfoById,
  updatePlayerInfoById,
  topNthLocalUsers,
  topNthGlobalUsers,
  topNthGlobalUsersByHighScore,
  topNthLocalUsersByHighScore,
};
