//import {  checkPassword, checkUserName, checkImgUrl} from "../helpers.js";

function checkStr(str, strName) {
  if (!str) throw `No string provided for ${strName}`;
  if (typeof str !== "string") throw `${strName} is not a string`;
  str = str.trim();
  if (str.length === 0) throw `${strName} is empty`;
  return str; // trimmed
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

function checkUserName(username) {
  username = checkStr(username, "username"); // trimmed
  if (username.length < 3) throw "Username must be at least 3 characters long";
  if (username.match(/\s/g)) throw "Username cannot contain spaces";
  if (username.match(/[!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?]/g))
    throw "Username cannot contain special characters except underscore and dash";

  return username; // trimmed
}

function checkUrl(url, urlName, minimumLength = 0) {
  url = checkStr(url, urlName); // trimmed
  url = url.replace(/\s/, "%20");

  const supportedProtocols = ["http://", "https://"];

  if (!supportedProtocols.some((p) => url.startsWith(p)))
    throw ` must provide supported protocols for ${urlName}: ${supportedProtocols.join(
      " "
    )}, you provided ${url}`;
  if (url.split("//")[1].length < minimumLength)
    throw `${urlName} is too short`;

  return url; // trimmed and replaced spaces with %20
}

function checkImgUrl(url, imgName) {
  url = checkUrl(url, `${imgName} link`); // trimmed and replaced spaces with %20

  const supportedExtensions = ["jpg", "jpeg", "png", "gif", "svg"];
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

function checkZipCode(zipCode, zipCodeName) {
  zipCode = checkStr(zipCode, zipCodeName);
  //if (zipCode.length !== 5) throw `${zipCodeName} must be 5 digits long`;
  if (zipCode.match(/^\d+$/g)[0] !== zipCode)
    throw `${zipCodeName} must contain only digits`;
  return zipCode; // trimmed
}

function checkCity(city, cityName) {
  city = checkStr(city, cityName);
  if(/\d/.test(city)) {
      throw "City name contains a numerical digit!"
  }
  return city.toLowerCase(); // trimmed and lowercased
}

const profileForm = document.getElementById("profile-form");

if (profileForm) {
  profileForm.addEventListener("submit", (event) => {
    const username = document.getElementById("newUserName");
    const passwordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("newConfirmPassword");
    const icon = document.getElementById("newIcon");
    const country = document.getElementById("newCountryCode");
    const city = document.getElementById("newCity");
    const zipcode = document.getElementById("newZipCode");
    const error = document.getElementById("error");

    error.innerHTML = "";
    error.hidden = true;

    if (
      !username.value &&
      !passwordInput.value &&
      !confirmPasswordInput.value &&
      !icon.value &&
      (country.value === "invalid") &&
      !city.value &&
      !zipcode.value
    ) {
      error.innerHTML = "All of the fields are empty!";
      error.hidden = false;
      event.preventDefault();
      return false;
    }

    if (username.value) {
      try {
        checkUserName(username.value);
      } catch (e) {
        error.innerHTML = "Username is invalid!";
        error.hidden = false;
        event.preventDefault();
        return false;
      }
    }

    if (passwordInput.value) {
      try {
        checkPassword(passwordInput.value);
      } catch (e) {
        error.innerHTML = "Password is invalid!";
        error.hidden = false;
        event.preventDefault();
        return false;
      }
    }

    if (!passwordInput.value && confirmPasswordInput.value) {
      error.innerHTML = "You have not entered a new password.";
      error.hidden = false;
      event.preventDefault();
      return false;
    }

    if (passwordInput.value && !confirmPasswordInput.value) {
      error.innerHTML = "Please confirm your new password.";
      error.hidden = false;
      event.preventDefault();
      return false;
    }

    if (
      passwordInput.value &&
      passwordInput.value !== confirmPasswordInput.value
    ) {
      error.innerHTML = "Passwords do not match!";
      error.hidden = false;
      event.preventDefault();
      return false;
    }

    if (icon.value) {
      try {
        checkImgUrl(icon.value, "User Icon");
      } catch (e) {
        error.innerHTML = "Icon is invalid!";
        error.hidden = false;
        event.preventDefault();
        return false;
      }
    }

    if (zipcode.value) {
      try {
        checkZipCode(zipcode.value, "User Zipcode");
      } catch (e) {
        error.innerHTML = "Zipcode is invalid!";
        error.hidden = false;
        event.preventDefault();
        return false;
      }
    }

    // if((country.value || city.value || zipcode.value) && !(country.value && city.value && zipcode.value)){
    //     error.innerHTML= "When updating location information, please fill out all the location fields!";
    //     error.hidden= false;
    //     event.preventDefault();
    //     return false;
    // }
  });
}
