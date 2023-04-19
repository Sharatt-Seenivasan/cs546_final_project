import { birdsCollection as birds } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import { updatePlayerInfoById } from "./users.js";
import {
  checkImgUrl,
  checkStr,
  checkStrArr,
  checkGeoCode,
  checkNumber,
  checkId,
  objectId2str_doc,
  objectId2str_docs_arr,
  arrsEqual,
  objsEqual,
} from "../helpers.js";

const createBird = async ({ userId, url, names, geocode, difficulty } = {}) => {
  userId = checkId(userId, "user id");
  url = checkImgUrl(url, "bird picture");
  names = checkStrArr(names, "bird names");
  geocode = checkGeoCode(geocode, "bird geocode");
  difficulty = checkNumber(difficulty, "bird difficulty", 1, 5);

  const birdFields = { url, names, geocode, difficulty };

  const birdsCollection = await birds();
  const insertInfo = await birdsCollection.insertOne(birdFields);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
    throw `Bird ${names[0]} was not created`;

  const birdId = insertInfo.insertedId.toString();
  await updatePlayerInfoById(userId,{ $pushSubmission: { birdId } });

  return getBirdById(birdId);
};

const getBirdById = async (birdId) => {
  birdId = checkId(birdId, "bird id");

  const birdsCollection = await birds();
  const theBird = await birdsCollection.findOne({ _id: new ObjectId(birdId) });
  if (!theBird) throw `Bird with id ${birdId} not found`;

  return objectId2str_doc(theBird);
};

const getLocalBirds = async (countrycode, city) => {
  countrycode = checkStr(countrycode, "country code");
  city = checkStr(city, "city");

  const birdsCollection = await birds();
  let localBirds;
  if (city === "all") {
    localBirds = await birdsCollection
      .find({ "geocode.countrycode": countrycode })
      .toArray();
  } else {
    localBirds = await birdsCollection
      .find({ "geocode.countrycode": countrycode, "geocode.city": city })
      .toArray();
  }
  if (localBirds.length === 0)
    throw `No birds found in ${city}, ${countrycode}`;

  return objectId2str_docs_arr(localBirds);
};

const getAllBirds = async () => {
  const birdsCollection = await birds();
  const allBirds = await birdsCollection.find({}).toArray();
  if (!allBirds) throw `Could not get all birds`;
  return objectId2str_docs_arr(allBirds);
};

const removeBirdById = async (birdId) => {
  birdId = checkId(birdId, "bird id");

  const birdsCollection = await birds();
  const deleteInfo = await birdsCollection.findOneAndDelete({
    _id: new ObjectId(birdId),
  });
  if (!deleteInfo.lastErrorObject.n === 0)
    throw `Could not delete bird with id ${birdId}`;

  await updatePlayerInfoById({ $pullSubmission: { birdId } });

  return objectId2str_doc(deleteInfo.value);
};

const updateBirdById = async ( birdId, { url, names, geocode, difficulty } = {} ) => {
  const theBird = await getBirdById(birdId);
  const fields2Update = { url, names, geocode, difficulty };

  for (const [k, v] of Object.entries(fields2Update)) {
    if (v === undefined) {
      delete fields2Update[k];
      continue;
    }
    switch (k) {
      case "url":
        fields2Update.k = checkImgUrl(v, "bird picture");
        if (fields2Update.k === theBird.k)
          throw `${k} is already ${v},please provide a new one to update`;
        break;
      case "names":
        fields2Update.k = checkStrArr(v, "bird names");
        if (arrsEqual(fields2Update.k, theBird.k))
          throw `${k} is already ${v},please provide a new one to update`;
        break;
      case "geocode":
        fields2Update.k = checkGeoCode(v, "bird geocode");
        if (objsEqual(fields2Update.k, theBird.k))
          throw `${k} is already ${v},please provide a new one to update`;
        break;
      case "difficulty":
        fields2Update.k = checkNumber(v, "bird difficulty", 1, 5);
        if (fields2Update.k === theBird.k)
          throw `${k} is already ${v},please provide a new one to update`;
        break;
      default:
        break;
    }
    if (fields2Update.k === theBird.k)
      throw `${k} is already ${v},please provide a new one to update`;
  }
  if (fields2Update.length === 0) throw `No field provided to update`;

  const birdsCollection = await birds();
  const updateInfo = await birdsCollection.findOneAndUpdate(
    { _id: new ObjectId(birdId) },
    { $set: fields2Update },
    { returnDocument: "after" }
  );
  if (!updateInfo.lastErrorObject.n === 0)
    throw `Could not update bird with id ${birdId}`;

  return objectId2str_doc(updateInfo.value);
};

export {
  createBird,
  getBirdById,
  getLocalBirds,
  getAllBirds,
  removeBirdById,
  updateBirdById,
};
