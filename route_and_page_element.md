

> Any client-side problem(400+), re-render the page with additional error, except 403
>
> - ~~res.status(400).render('original_page',{errors:[error1,...]})~~
> - res.status(400).render('original_page',{error:xxx, title:xxx});
> - error passed from route to handlebars as String[] errors
> - if 403 is applicable
>   - redirect to an error page telling user that he is not authorized
>
> ~~Any server-side problem(500+), send "Internal Server Error" with specific error~~
> Any server side problem(500+), re-render the page with additional error
> - ~~res.status(500).send("Internal Server Error:", error)~~
> - res.status(500).render('original_page',{error:xxx, title:xxx});

# /user

- if NOT logged in, redirect to `/login`
- GET `/user`
  - if logged in, display user data
    - user current score
    - user highest score
    - answered quizzes
  - if logged in, show a link to logout
    - <a herf="/logout">Logout</a>
  - if logged in, show links to local and global leaderboard
    - <a herf="/leaderboard/local">Local Leaderboard</a>
    - <a herf="/leaderboard/global">Global Leaderboard</a>
- POST `/user`
  - reserved for AJAX

- GET `/user/profile`
  - if logged in, display user profile as a form, he can update them
    - username
    - password
    - confirm password
    - user icon
    - user country
      - <label for="">Country</label> <select name="" id=""></select>
    - user city
      - <label for="">City</label> <select name="" id=""></select>
    - submit button
      - <button type="submit" id="">submit</button>
  - if logged in, show a link to logout
    - <a herf="/logout">Logout</a>

- PATCH`/user/profile`

  - client-side input check

  - submit the form to server

- GET `/user/post`
  - a form for user to post bird quiz
    - bird name
    - bird picture 
    - bird location
    - difficulty for reference

- POST `/user/post`
  - client side check
  - submit the form to server
    - server "throws" by re-rendering



# /logout

- GET `/logout`
  - destroy session
  - a link back to quiz
    - <a herf="/quiz">To quiz</a>



# /signup

- if logged in, redirect to `/user/profile`
- GET `/signup`
  - if not logged in, display a form
    - username
    - password
    - confirm password
    - link to login
      - <a herf="/login">Already have an account?</a>
- POST `/signup`
  - client-side input check
  - submit the form to server
    - server "throws" by re-rendering



# /login

- if logged in, redirect to user/profile
- GET `/login`
  - if not logged in, display a form
    - username
    - password
    - submit button
      - <button type="submit" id="">submit</button>
    - link to signup
      - <a herf="/signup">Create a new account</a>
- POST `/login`
  - client-side input check
  - submit the form to server
    - server "throws" by re-rendering



# /leaderboard

- if NOT logged in, redirect to `/leaderboard/global`

- GET `/leaderboard/global`

  - show dropdown to get local leaderboard (AJAX)
    - <label for="">Country</label> <select name="" id=""></select>
    - <label for="">City</label> <select name="" id=""></select>
  - if NOT logged in, show a global leaderboard, with temp score
  - if logged in, show a global leaderboard, with user score

- GET `/leaderboard/local`

  - if NOT logged in, redirect to `/leaderboard`
  - if logged in, show a local leaderboard, with user score
    - show a link to global leaderboard
      - <a herf="/leaderboard/global">Global Leaderboard</a>

- POST `/leaderboard/local`

  - reserved for AJAX

- POST `/leaderboard/global`

  - reserved for AJAX

  

# /quiz

- GET `/quiz`

  - if NOT logged in, randomly show bird quizzes, with temporary score initialized as 0. But keep tracked with quizzes the user already answered, so they won't come across the same quiz(bird picture) again

    - links to signup & login

      - <a herf="/login">Already have an account?</a>
      - <a herf="/signup">Create a new account</a>

    - buttons to skip & confirm & end

      - <button type="submit" id="">skip</button>

      - <button type="submit" id="">confirm</button>
      - <button type="submit" id="">quit</button>
        - redirect to`/leaderboard`

  - if logged in, show quizzes that the user has never answered, with user score

    - buttons to skip & confirm & end

      - <button type="submit" id="">skip</button>

      - <button type="submit" id="">confirm</button>

      - <button type="submit" id="">save & quit</button>

- PUT `/quiz`
  - if NOT logged in, redirect to `/leaderboard`
  - if logged in, update user scores to db































