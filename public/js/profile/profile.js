//import {  checkPassword, checkUserName, checkImgUrl} from "../helpers.js";

function checkStr(str, strName) {
    if (!str) throw `No string provided for ${strName}`;
    if (typeof str !== "string") throw `${strName} is not a string`;
    str = str.trim();
    if (str.length === 0) throw `${strName} is empty`;
    return (str); // trimmed
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
  
    return (password);
}

function checkUserName(username) {
    username = checkStr(username, "username"); // trimmed
    if (username.length < 3) throw "Username must be at least 3 characters long";
    if (username.match(/\s/g)) throw "Username cannot contain spaces";
    if (username.match(/[!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?]/g))
      throw "Username cannot contain special characters except underscore and dash";
  
    return (username); // trimmed
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

const profileForm = document.getElementById("profile-form");

if(profileForm){
    profileForm.addEventListener('submit', (event) => {
        console.log("check")
        const username= document.getElementById("username");
        const passwordInput = document.getElementById("password");
        const confirmPasswordInput = document.getElementById("confirm-password");
        const icon= document.getElementById("icon");
        const country= document.getElementById("country-select");
        const city= document.getElementById("userCity");
        const error= document.getElementById("error");

        error.innerHTML = '';
        error.hidden = true;

        if(username && !checkUserName(username)){
            error.innerHTML= "Username is invalid!";
            error.hidden= false;
            event.preventDefault();
        }

        if(passwordInput && !checkPassword(passwordInput)){
            error.innerHTML= "Password is invalid!";
            error.hidden= false;
            event.preventDefault();
        }

        if(passwordInput.value !== confirmPasswordInput.value){
            error.innerHTML= "Passwords do not match!";
            error.hidden= false;
            event.preventDefault();
        }

        if(icon && !checkImgUrl(icon)){
            error.innerHTML= "Icon is invalid!";
            error.hidden= false;
            event.preventDefault();
        }

        // if(country.value === "Select Country"){
        //     error.innerHTML= "Country is invalid!";
        //     error.hidden= false;
        //     event.preventDefault();
        // }

        // if(!city.value || city.value === undefined){
        //     error.innerHTML= "City is invalid!";
        //     error.hidden= false;
        //     event.preventDefault();
        // }
    });
}