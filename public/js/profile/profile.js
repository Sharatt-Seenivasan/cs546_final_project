import {  checkPassword, checkUserName, checkImgUrl} from "../helpers.js";

const profileForm = document.getElementById("profile-form");

if(profileForm){
    profileForm.addEventListener('submit', (event) => {
        const username= document.getElementById("username");
        const passwordInput = document.getElementById("password");
        const confirmPasswordInput = document.getElementById("confirm-password");
        const icon= document.getElementById("icon");
        const country= document.getElementById("country-select");
        const city= document.getElementById("userCity");
        const error= document.getElementById("error");

        error.innerHTML = '';
        error.hidden = true;

        if(!checkUserName(username)){
            error.innerHTML= "Username is invalid!";
            error.hidden= false;
            event.preventDefault();
        }

        if(!checkPassword(passwordInput)){
            error.innerHTML= "Password is invalid!";
            error.hidden= false;
            event.preventDefault();
        }

        if(passwordInput.value !== confirmPasswordInput.value){
            error.innerHTML= "Passwords do not match!";
            error.hidden= false;
            event.preventDefault();
        }

        if(!checkImgUrl(icon)){
            error.innerHTML= "Icon is invalid!";
            error.hidden= false;
            event.preventDefault();
        }

        if(country.value === "Select Country"){
            error.innerHTML= "Country is invalid!";
            error.hidden= false;
            event.preventDefault();
        }

        if(!city.value || city.value === undefined){
            error.innerHTML= "City is invalid!";
            error.hidden= false;
            event.preventDefault();
        }

        
    });
}