import { getUserById } from "./users.js";
import { getLocalBirds, getAllBirdsNames, getAllBirds } from "./birds.js";
import { checkId, checkNumber, checkCountryCode,checkCity } from "../helpers.js";

const getQuestion4User = async (
  userId,
  {
    numberOfOptions = 4,
    numberOfQuestions = 5,
    local_or_global = "global",
  } = {}
) => {
  const __name = getQuestion4User.name;
  userId = checkId(userId, "user id");
  if (numberOfQuestions || numberOfQuestions === 0) {
    numberOfQuestions = checkNumber(numberOfQuestions, `questions number at ${__name}`, {
      inclusiveMin: 1,
    });
  }
  if (numberOfOptions || numberOfOptions === 0) {
    numberOfOptions = checkNumber(numberOfOptions, `options number at ${__name}`, {
      inclusiveMin: 2,
    });
  }
  if (local_or_global) {
    local_or_global = checkStr(local_or_global, `local_or_global at ${__name}`);
    local_or_global = local_or_global.trim().toLowerCase();
    if (["local", "global"].includes(local_or_global)) {
      throw `local_or_global option must be either "local" or "global"`;
    }
  }

  const theUser = await getUserById(userId);
  const qAnswered = theUser.last_questions;

  let allBirds, unseenBirds;
  if (local_or_global === "global") {
    allBirds = await getAllBirds();
  }
  if (local_or_global === "local") {
    const userCountry = theUser.geocode && theUser.geocode.countryCode;
    const userCity = theUser.geocode && theUser.geocode.city;
    allBirds = await getLocalBirds(userCountry, userCity);
  }
  unseenBirds = allBirds.filter((bird) => !qAnswered.includes(bird._id));

  let questions = [];
  let rdmUnseenBirdIdx, rdmAnswerIdx;
  while (questions.length < numberOfQuestions && unseenBirds.length > 0) {
    let q = {},
      options = [];
    rdmAnswerIdx = Math.floor(Math.random() * numberOfOptions);
    while (options.length < numberOfOptions && unseenBirds.length > 0) {
      rdmUnseenBirdIdx = Math.floor(Math.random() * unseenBirds.length);
      const theBird = unseenBirds[rdmUnseenBirdIdx];
      const birdName = theBird.names[0]; // take 1st name by default
      options.push(birdName);
      if (options.length === rdmAnswerIdx + 1) {
        q["answer"] = birdName;
        q["image"] = theBird.url;
        unseenBirds.splice(rdmUnseenBirdIdx, 1);
      }
    }
    q["options"] = options;
    questions.push(q);
  }

  if (
    q.length < numberOfQuestions ||
    q.some((question) => question.options.length < numberOfOptions)
  ) {
    throw `Not enough birds in database to create a quiz with ${numberOfOptions} options`;
  }

  return questions;
};

const getQuestion4Guest = async ({
  numberOfOptions = 4,
  numberOfQuestions = 5,
  countryCode,
  city,
} = {}) => {
  const __name = getQuestion4Guest.name;
  if (numberOfQuestions || numberOfQuestions === 0) {
    numberOfQuestions = checkNumber(numberOfQuestions, `questions number at ${__name}`, {
      inclusiveMin: 1,
    });
  }
  if (numberOfOptions || numberOfOptions === 0) {
    numberOfOptions = checkNumber(numberOfOptions, `option number at ${__name}`, {
      inclusiveMin: 2,
    });
  }
  if((countryCode && !city) || (!countryCode && city)){
    throw `countryCode and city must be both defined or both undefined at getQuestions4Guest`;
  }
  if (countryCode) {
    countryCode = checkCountryCode(countryCode, `countryCode at ${__name}`);
  }
  if (city) {
    city = checkCity(city, `city at ${__name}`);
  }

  if (!countryCode && !city) {
    const allBirds = await getAllBirds();
  } else {
    const allBirds = await getLocalBirds(countryCode,city);
  }

  let questions = [];
  let rdmBirdIdx, rdmAnswerIdx;
  while (questions.length < numberOfQuestions && allBirds.length > 0) {
    let q = {},
      options = [];
    rdmAnswerIdx = Math.floor(Math.random() * numberOfOptions);
    while (options.length < numberOfOptions && allBirds.length > 0) {
      rdmBirdIdx = Math.floor(Math.random() * allBirds.length);
      const theBird = allBirds[rdmBirdIdx];
      const birdName = theBird.names[0]; // take 1st name by default
      options.push(birdName);
      if (options.length === rdmAnswerIdx + 1) {
        q["answer"] = birdName;
        q["image"] = theBird.url;
        allBirds.splice(rdmBirdIdx, 1);
      }
    }
    q["options"] = options;
    questions.push(q);
  }

  if (
    q.length < numberOfQuestions ||
    q.every((question) => question.options.length < numberOfOptions)
  ) {
    throw `Not enough birds in database to create a quiz with ${numberOfOptions} options`;
  }

  return questions;
};

export { getQuestion4User, getQuestion4Guest };
