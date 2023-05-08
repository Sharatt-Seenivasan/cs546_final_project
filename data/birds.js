import { birdsCollection as birds } from "../config/mongoCollections.js";
import { Long, ObjectId } from "mongodb";
import { updatePlayerInfoById } from "./users.js";
import {
  checkImgUrl,
  checkStr,
  checkStrArr,
  checkGeoCode,
  checkCountryCode,
  checkCity,
  checkNumber,
  checkId,
  objectId2str_doc,
  objectId2str_docs_arr,
  arrsEqual,
  objsEqual,
  isInVicinity,
} from "../helpers.js";

const createBird = async ({ userId, url, names, geocode, difficulty } = {}) => {
  const __name = createBird.name;
  userId = checkId(userId, `user id at ${__name}`);
  url = checkImgUrl(url, `bird url at ${__name}`);
  names = checkStrArr(names,  `bird names at ${__name}`);
  geocode = checkGeoCode(geocode, `bird geocode at ${__name}`);
  difficulty = checkNumber(difficulty, `difficulty at ${__name}`, 1, 5);

  const birdFields = { url, names, geocode, difficulty };

  const birdsCollection = await birds();
  const insertInfo = await birdsCollection.insertOne(birdFields);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
    throw `Bird ${names[0]} was not created`;

  const birdId = insertInfo.insertedId.toString();
  await updatePlayerInfoById(userId, { $pushSubmission: { birdId } });

  return getBirdById(birdId);
};

const getBirdById = async (birdId) => {
  const __name = getBirdById.name;
  birdId = checkId(birdId, `bird id at ${__name}`);

  const birdsCollection = await birds();
  const theBird = await birdsCollection.findOne({ _id: new ObjectId(birdId) });
  if (!theBird) throw `Bird with id ${birdId} not found`;

  return objectId2str_doc(theBird);
};

const getAllBirdsNames = async () => {
  const birdsCollection = await birds();
  const allBirds = await birdsCollection.find({}).toArray();
  let arrayNames=[]
  for(let index=0;index<allBirds.length;index++){
    arrayNames.push(allBirds[index]['names'][0]);
  }
  if (!allBirds) throw `Could not get all birds`;
  return arrayNames;
};

const getLocalBirds = async (countryCode, city) => {
  const __name = getLocalBirds.name;
  countryCode = checkCountryCode(countryCode, `country code at ${__name}`);
  city = checkCity(city, `city at ${__name}`);

  const birdsCollection = await birds();
  let localBirds;
  if (city === "all") {
    localBirds = await birdsCollection
      .find({ "geocode.countryCode": countryCode })
      .toArray();
  } else {
    localBirds = await birdsCollection
      .find({ "geocode.countryCode": countryCode, "geocode.city": city })
      .toArray();
  }
  if (localBirds.length === 0)
    throw `No birds found in ${city}, ${countryCode}`;

  return objectId2str_docs_arr(localBirds);
};
const getLocalBirdsLatLong= async (latitude_x,longitude_x)=>{
  if(typeof latitude_x!=="number" || typeof longitude_x!=="number") throw 'Latitude and Longitude are expected to be numbers';
  const birdsCollection = await birds();
  let localBirds=[];
  /*localBirds = await birdsCollection
      .find({ "$where": function() { return isInVicinity(latitude_x,longitude_x,this.geocode.latitude,this.geocode.longitude,60); }  })
      .toArray();
  if (localBirds.length === 0)
    throw `No birds found in ${city}, ${countryCode}`;*/
  let allBirds = await getAllBirds();
  for(let i=0;i<allBirds.length;i++){
    let bird = allBirds[i];
    if(isInVicinity(latitude_x,longitude_x,bird.geocode.latitude,bird.geocode.longitude,60)){
      localBirds.push(bird);
    }
  }
  return objectId2str_docs_arr(localBirds);
}

const getAllBirds = async () => {
  const birdsCollection = await birds();
  const allBirds = await birdsCollection.find({}).toArray();
  if (!allBirds) throw `Could not get all birds`;
  return objectId2str_docs_arr(allBirds);
};

const removeBirdById = async (birdId) => {
  const __name = removeBirdById.name;
  birdId = checkId(birdId, `bird id at ${__name}`);

  const birdsCollection = await birds();
  const deleteInfo = await birdsCollection.findOneAndDelete({
    _id: new ObjectId(birdId),
  });
  if (!deleteInfo.lastErrorObject.n === 0)
    throw `Could not delete bird with id ${birdId}`;

  await updatePlayerInfoById({ $pullSubmission: { birdId } });

  return objectId2str_doc(deleteInfo.value);
};

const updateBirdById = async (
  birdId,
  { url, names, geocode, difficulty } = {}
) => {
  const __name = updateBirdById.name;
  birdId = checkId(birdId, `bird id at ${__name}`);
  const theBird = await getBirdById(birdId);
  const fields2Update = { url, names, geocode, difficulty };

  for (const [k, v] of Object.entries(fields2Update)) {
    if (v === undefined) {
      delete fields2Update[k];
      continue;
    }
    switch (k) {
      case "url":
        fields2Update.k = checkImgUrl(v, `bird url at ${__name}`);
        if (fields2Update.k === theBird.k)
          throw `${k} is already ${v},please provide a new one to update`;
        break;
      case "names":
        fields2Update.k = checkStrArr(v, `bird names at ${__name}`);
        if (arrsEqual(fields2Update.k, theBird.k))
          throw `${k} is already ${v},please provide a new one to update`;
        break;
      case "geocode":
        fields2Update.k = checkGeoCode(v, `bird geocode at ${__name}`);
        if (objsEqual(fields2Update.k, theBird.k))
          throw `${k} is already ${v},please provide a new one to update`;
        break;
      case "difficulty":
        fields2Update.k = checkNumber(v, `bird difficulty at ${__name}`, 1, 5);
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

const hasBirdWithImageUrl = async (imageUrl) => {
  const birdsCollection = await birds();
  const bird  = await birdsCollection.findOne({ url: imageUrl });
  if(!bird){
    return false;
  }
  return true;
};

export {
  createBird,
  getBirdById,
  getLocalBirds,
  getAllBirds,
  removeBirdById,
  updateBirdById,
  getAllBirdsNames,
  hasBirdWithImageUrl,
  getLocalBirdsLatLong
};