const loginForm = document.getElementById("login-form");

function checkStr(str, strName) {
  if (!str) throw `No string provided for ${strName}`;
  if (typeof str !== "string") throw `${strName} is not a string`;
  str = str.trim();
  if (str.length === 0) throw `${strName} is empty`;
  return str; // trimmed
}

function checkUserName(username) {
    username = checkStr(username, "Username"); // trimmed
    if (username.length < 3) throw "Username must be at least 3 characters long";
    if (username.length === 0) throw "Username cannot be empty";
    if (username.match(/\s/g)) throw "Username cannot contain spaces";
    if (username.match(/[!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?]/g))
      throw "Username cannot contain special characters except underscore and dash";
  
    return username; // trimmed
}

function checkPassword(password) {
    password = checkStr(password, "Password"); // trimmed
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
  
    return true;
}

if(loginForm){
    loginForm.addEventListener('submit', (event) => {

        const username = document.getElementById("username")
        const passwordInput = document.getElementById("password")
        const errorDiv = document.getElementById("error")
        errorDiv.innerHTML = '';
        errorDiv.hidden = true;

        if(!username.value || username.value === undefined){
            errorDiv.innerHTML = "A username was not provided!"
            errorDiv.hidden = false;
            event.preventDefault();
        }
        if(!passwordInput.value || passwordInput.value === undefined){
            errorDiv.innerHTML = "A password was not provided!"
            errorDiv.hidden = false;
            event.preventDefault();
        }

        try {
          checkUserName(username)
        } catch (error) {
            errorDiv.innerHTML = error
            errorDiv.hidden = false;
            event.preventDefault();
        }

        // if(!checkUserName(username)){
        //     errorDiv.innerHTML = "Username is invalid!"
        //     errorDiv.hidden = false;
        //     event.preventDefault();
        // }
        
        try {
          checkPassword(username)
        } catch (error) {
            errorDiv.innerHTML = error
            errorDiv.hidden = false;
            event.preventDefault();
        }

        // if(!checkPassword(passwordInput)){
        //     errorDiv.innerHTML = "Password is invalid!"
        //     errorDiv.hidden = false;
        //     event.preventDefault();
        // }

    });

}