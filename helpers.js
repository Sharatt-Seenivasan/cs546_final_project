import { ObjectId } from "mongodb";

function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.replace(word[0], word[0].toUpperCase()))
    .join(" ");
}

function checkStr(str, strName) {
  if (!str) throw `No string provided for ${strName}`;
  if (typeof str !== "string") throw `${strName} is not a string`;
  str = str.trim();
  if (str.length === 0) throw `${strName} is empty`;
  return str; // trimmed
};

function checkId(id, idName) {
  id = checkStr(id, idName); // trimmed
  if (!ObjectId.isValid(id)) throw `${idName} is not a valid ObjectId`;
  return id; // trimmed
};

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
};
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
};

function checkCountryCode(countryCode) {
  countryCode = checkStr(countryCode, "countryCode");
  return countryCode; // trimmed
};

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

  geocode.country = checkStr(geocode.country, "country");
  geocode.countryCode = checkCountryCode(geocode.countryCode, "countryCode");
  geocode.city = checkStr(geocode.city, "city");

  return geocode; // have country, countryCode, city trimmed
};

function checkNumber(num, numName, min, max) {
  if (!num && num !== 0) throw `No ${numName} provided`;
  if (typeof num !== "number") throw `${numName} is not a number`;

  if (typeof min !== "number" && typeof max !== "number") return num; // nothing changed

  if (typeof min !== "number" && num > max)
    throw `${numName} must be smaller than ${max}`;
  if (typeof max !== "number" && num < min)
    throw `${numName} must be bigger than ${min}`;

  if (typeof min === "number" && typeof max === "number") {
    if (min > max) throw "min must be smaller than max";

    if (num < min || num > max)
      throw `${numName} must be between ${min} and ${max}`;
  }
  return num; // nothing changed
};

function checkStrArr(arr, arrName) {
  if (!arr) throw `No ${arrName} provided`;
  if (!Array.isArray(arr)) throw `${arrName} is not an array`;
  if (arr.length === 0) throw `${arrName} is empty`;

  arr.map((e) => checkStr(e, `${arrName} element`));

  return arr; // trimmed
};

function arrsEqual(arr1, arr2) {
  if (!arr1 || !arr2) return false;
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
  if (arr1.length !== arr2.length) return false;

  const arr1_sorted = arr1.sort();
  const arr2_sorted = arr2.sort();

  return arr1_sorted.every((e, i) => deepEqual(e, arr2_sorted[i]));
};

function objsEqual(obj1, obj2) {
  if (!obj1 || !obj2) return false;
  if (typeof obj1 !== "object" || typeof obj2 !== "object") return false;
  if (Array.isArray(obj1) || Array.isArray(obj2)) return false;

  const obj1_keys = Object.keys(obj1);
  const obj2_keys = Object.keys(obj2);

  if (!arrsEqual(obj1_keys, obj2_keys)) return false;

  return obj1_keys.every((key) => deepEqual(obj1[key], obj2[key]));
};

function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;
  if (typeof obj1 !== typeof obj2) return false;
  if (Array.isArray(obj1)) return arrsEqual(obj1, obj2);
  if (typeof obj1 === "object") return objsEqual(obj1, obj2);
};

function objectId2str_doc(doc) {
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) return doc;

  return JSON.parse(
    JSON.stringify(doc, (key, value) => {
      if (key === "_id" && typeof value === ObjectId) return value.toString();
      return value;
    })
  );
};

function objectId2str_docs_arr(arrOfDocs) {
  if (
    !arrOfDocs ||
    !Array.isArray(arrOfDocs) ||
    arrOfDocs.some((e) => typeof e !== "object" || Array.isArray(e))
  )
    return arrOfDocs;

  return arrOfDocs.map((doc) => objectId2str_doc(doc));
};

function randomizeArray(array) {
  for (let index = array.length - 1; index > 0; index--) {
    let rdmIdx= Math.floor(Math.random() * (index + 1));
    [array[index], array[rdmIdx]] = [array[rdmIdx], array[index]];
  }
  return array;
}

function checkPassword(password){
  if(!password) throw "No password provided";
  if(typeof password !== "string") throw "Password is not a string";
  if(password.length < 8) throw "Password must be at least 8 characters long";
  if(password.length===0) throw "Password cannot be empty";
  if(password.trim().match(/\s/g)) throw "Password cannot contain spaces";
  if(!password.match(/[a-z]/g)) throw "Password must contain at least one lowercase letter";
  if(!password.match(/[A-Z]/g)) throw "Password must contain at least one uppercase letter";
  if(!password.match(/[0-9]/g)) throw "Password must contain at least one number";
  if(!password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g)) throw "Password must contain at least one special character";

  return true;
}

function checkUsername(username){
  if(!username) throw "No username provided";
  if(typeof username !== "string") throw "Username is not a string";
  if(username.length < 4) throw "Username must be at least 4 characters long";
  if(username.trim().length===0) throw "Username cannot be empty";
  if(username.trim().match(/\s/g)) throw "Username cannot contain spaces";
  if(username.match(/[!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?]/g)) throw "Username cannot contain special characters except underscore and dash";

  return true;
}

function checkBirdName(birdName){
  if(!birdName) throw "No bird name provided!";
  if(typeof birdName !== "string") throw "Bird name must be a string!";
  if(birdName.trim().length===0) throw "Bird name cannot be empty!";
  if(birdName.trim().match(/\s/g)) throw "Bird name cannot contain spaces";
  if(birdName.match(/[^A-Za-z\s\(\)]/)) throw "Bird name cannot contain any special characters (excluding parentheses in some special cases) or numbers";

  const regexPattern = /^[A-Za-z\s]+(\s\([A-Za-z\s]+\))?$/
  if(regexPattern.text(birdName)){
    return true
  }

  throw "Bird name is invalid!"
}

export {
  toTitleCase,
  checkStr,
  checkId,
  checkUrl,
  checkImgUrl,
  checkCountryCode,
  checkGeoCode,
  checkNumber,
  checkStrArr,
  objectId2str_doc,
  objectId2str_docs_arr,
  arrsEqual,
  objsEqual,
  randomizeArray,
  checkPassword,
  checkUsername,
  checkBirdName
};
