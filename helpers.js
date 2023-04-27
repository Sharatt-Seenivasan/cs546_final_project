import { ObjectId } from "mongodb";

function checkStr(str, strName) {
  if (!str) throw `No string provided for ${strName}`;
  if (typeof str !== "string") throw `${strName} is not a string`;
  str = str.trim();
  if (str.length === 0) throw `${strName} is empty`;
  return str; // trimmed
}

function checkUserName(username) {
  username = checkStr(username, "username"); // trimmed
  if (username.length < 3) throw "Username must be at least 3 characters long";
  if (username.match(/\s/g)) throw "Username cannot contain spaces";
  if (username.match(/[!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?]/g))
    throw "Username cannot contain special characters except underscore and dash";

  return username; // trimmed
}

function checkPassword(password) {
  password = checkStr(password, "password"); // trimmed
  if (password.length === 0) throw "Password cannot be empty";
  if (password.length < 8) throw "Password must be at least 8 characters long";
  if (password.match(/\s/g)) throw "Password cannot contain spaces";
  if (!password.match(/[a-z]/g))
    throw "Password must contain at least one lowercase letter";
  if (!password.match(/[A-Z]/g))
    throw "Password must contain at least one uppercase letter";
  if (!password.match(/[0-9]/g))
    throw "Password must contain at least one number";
  if (!password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g))
    throw "Password must contain at least one special character";

  return password;
}

function checkId(id, idName) {
  id = checkStr(id, idName); // trimmed
  if (!ObjectId.isValid(id)) throw `${idName} is not a valid ObjectId`;
  return id; // trimmed
}

function checkUrl(url, urlName, minimumLength = 0) {
  url = checkStr(url, urlName); // trimmed
  url = url.replace(/\s/, "%20");

  const supportedProtocols = ["http://", "https://"];

  if (!supportedProtocols.some((p) => url.startsWith(p)))
    throw ` must provide supported protocols for ${urlName}: ${supportedProtocols.join(
      ", "
    )}`;
  if (url.split("//")[1].length < minimumLength)
    throw `${urlName} is too short`;

  return url; // trimmed and replaced spaces with %20
}

function checkImgUrl(url, imgName) {
  url = checkUrl(url, `${imgName} link`); // trimmed and replaced spaces with %20

  const supportedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".svg"];
  if (
    !supportedExtensions.some(
      (ext) => url.endsWith(ext) || url.endsWith(ext.toUpperCase())
    )
  ) {
    throw `Provided ${url}. ${imgName} must have supported formats: ${supportedExtensions.join(
      ", "
    )}`;
  }

  return url; // trimmed and replaced spaces with %20
}

function checkCountryCode(countryCode, countryCodeName) {
  countryCode = checkStr(countryCode, countryCodeName);
  return countryCode; // trimmed
}

function checkCity(city, cityName) {
  city = checkStr(city, cityName);
  return city.toLowerCase(); // trimmed and lowercased
}

function checkZipCode(zipCode, zipCodeName) {
  zipCode = checkStr(zipCode, zipCodeName);
  if (zipCode.length !== 5) throw `${zipCodeName} must be 5 digits long`;
  if (zipCode.match(/\d{5}/g)[0] !== zipCode)
    throw `${zipCodeName} must contain only digits`;
  return zipCode; // trimmed
}

function checkGeoCode(geocode, geocodeName) {
  if (!geocode) throw "No geocode provided";
  if (typeof geocode !== "object") throw `${geocodeName} is not an object`;

  const { latitude, longitude, country, countryCode, city } = geocode;

  if (!latitude) throw `${geocodeName} is missing latitude`;
  if (!longitude) throw `${geocodeName} is missing longitude`;
  if (typeof latitude !== "number")
    throw `${geocodeName} latitude is not a number`;
  if (typeof longitude !== "number")
    throw `${geocodeName} longitude is not a number`;
  if (!country) throw `${geocodeName} country is missing`;
  if (!countryCode) throw `${geocodeName} country code is missing`;
  if (!city) throw `${geocode} city is missing`;

  geocode.country = checkStr(geocode.country, `${geocodeName} country`);
  geocode.countryCode = checkCountryCode(
    geocode.countryCode,
    `${geocodeName} countryCode`
  );
  geocode.city = checkCity(geocode.city, `${geocodeName} city`);

  return geocode; // have country, countryCode, city trimmed
}

function checkNumber(num, numFor, { inclusiveMin, inclusiveMax } = {}) {
  if (!num) throw `No ${numFor} provided`;
  if (typeof num !== "number") throw `${numFor} is not a number`;
  if (!inclusiveMin && !inclusiveMax) return num;
  if (inclusiveMin || inclusiveMin === 0) {
    inclusiveMin = checkNumber(num, `${numFor} min`);
    if (num < inclusiveMin) throw `${numFor} must be at least ${inclusiveMin}`;
  }
  if (inclusiveMax || inclusiveMax === 0) {
    inclusiveMax = checkNumber(num, `${numFor} max`);
    if (num > inclusiveMax) throw `${numFor} must be at most ${inclusiveMax}`;
  }

  return num; // nothing changed
}

function checkDifficulty(difficulty, difficultyName) {
  difficulty = checkNumber(difficulty, difficultyName, {
    inclusiveMin: 1,
    inclusiveMax: 5,
  });
  if (difficulty % 1 !== 0) throw `${difficultyName} must be an integer`;
  return difficulty; // nothing changed, required to be an integer
}

function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.replace(word[0], word[0].toUpperCase()))
    .join(" ");
}

function checkStrArr(arr, arrName) {
  if (!arr) throw `No ${arrName} provided`;
  if (!Array.isArray(arr)) throw `${arrName} is not an array`;
  if (arr.length === 0) throw `${arrName} is empty`;

  arr.map((e) => checkStr(e, `${arrName} element`));

  return arr; // trimmed
}

function arrsEqual(arr1, arr2) {
  if (!arr1 || !arr2) return false;
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
  if (arr1.length !== arr2.length) return false;

  const arr1_sorted = arr1.sort();
  const arr2_sorted = arr2.sort();

  return arr1_sorted.every((e, i) => deepEqual(e, arr2_sorted[i]));
}

function objsEqual(obj1, obj2) {
  if (!obj1 || !obj2) return false;
  if (typeof obj1 !== "object" || typeof obj2 !== "object") return false;
  if (Array.isArray(obj1) || Array.isArray(obj2)) return false;

  const obj1_keys = Object.keys(obj1);
  const obj2_keys = Object.keys(obj2);

  if (!arrsEqual(obj1_keys, obj2_keys)) return false;

  return obj1_keys.every((key) => deepEqual(obj1[key], obj2[key]));
}

function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;
  if (typeof obj1 !== typeof obj2) return false;
  if (Array.isArray(obj1)) return arrsEqual(obj1, obj2);
  if (typeof obj1 === "object") return objsEqual(obj1, obj2);
}

function objectId2str_doc(doc) {
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) return doc;

  return JSON.parse(
    JSON.stringify(doc, (key, value) => {
      if (key === "_id" && typeof value === ObjectId) return value.toString();
      return value;
    })
  );
}

function objectId2str_docs_arr(arrOfDocs) {
  if (
    !arrOfDocs ||
    !Array.isArray(arrOfDocs) ||
    arrOfDocs.some((e) => typeof e !== "object" || Array.isArray(e))
  )
    return arrOfDocs;

  return arrOfDocs.map((doc) => objectId2str_doc(doc));
}

function randomizeArray(array) {
  for (let index = array.length - 1; index > 0; index--) {
    let rdmIdx = Math.floor(Math.random() * (index + 1));
    [array[index], array[rdmIdx]] = [array[rdmIdx], array[index]];
  }
  return array;
}

function extractKV(
  toObj,
  fromObj,
  [...keys],
  { ifFilterUndefined = false } = {}
) {
  if (!fromObj || typeof fromObj !== "object" || Array.isArray(fromObj))
    return fromObj;
  keys.map((key) => checkStr(key, "key to extract"));

  for (const key of keys) {
    const [firstKey, ...restKeys] = key.split(".");
    const subFromObj = fromObj[firstKey];

    if (restKeys.length === 0) {
      if (!ifFilterUndefined || subFromObj !== undefined) {
        toObj[firstKey] = subFromObj;
      }
      continue;
    }

    extractKV(toObj, subFromObj, restKeys, ifFilterUndefined);
  }

  return toObj;
}

function extractKV_objArr(
  fromObjArr,
  [...keys],
  { ifFilterUndefined = false } = {}
) {
  if (
    !fromObjArr ||
    !Array.isArray(fromObjArr) ||
    fromObjArr.some((e) => typeof e !== "object" || Array.isArray(e))
  )
    return fromObjArr;

  const toObjArr = [];

  fromObjArr.map((fromObj) => {
    const toObj = {};
    extractKV(toObj, fromObj, keys, ifFilterUndefined);
    toObjArr.push(toObj);
  });

  return toObjArr;
}

export {
  toTitleCase,
  checkStr,
  checkId,
  checkUrl,
  checkImgUrl,
  checkCountryCode,
  checkDifficulty,
  checkGeoCode,
  checkCity,
  checkNumber,
  checkStrArr,
  objectId2str_doc,
  objectId2str_docs_arr,
  arrsEqual,
  objsEqual,
  extractKV,
  extractKV_objArr,
  randomizeArray,
  checkPassword,
  checkUserName,
  checkZipCode
};
