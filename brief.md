[toc]

[./helper.js](#./helper.js)

[./seed/seed/js](##./seed/seed.js)

[./test/dbtest.js](##./test/dbtest.js)

[./data/users.js](##./data/users.js)

[./data/birds.js](##./data/birds.js)

# ./helper.js

`checkStr(str, strName)`

- non-empty string
- trimmed

`checkUserName(username)`

- no spaces allowed
- at least 3 characters long
- no special characters, except "_" and "-"

`checkPassWord(password)`

- no spaces allowed
- at least 8 characters long
- at least 1 lowercase letter
- at least 1 Uppercase letter
- at least 1 number
- at least 1 special character

`checkId(id, idName)`

- valid ObjectId string
- trimmed

`checkUrl(url, urlName, minimumLength = 0)`

- supported prefix: ["http://", "https://"]
- trimmed
- replaced space in-between with "%20"
- minimumLength refers the length AFTER prefix

`checkImgUrl(url, imgName)`
checkNumber
- supported extensions : [".jpg", ".jpeg", ".png", ".gif", ".svg"], including their uppercase variants

`checkCountryCode(countryCode, countryCodeName)`

JUST `checkStr`

`checkCity(city, cityName)`

- trimmed and lowercased

`checkZipCode(zipCode, zipCodeName)`

- 5-digits string

`checkGeoCode(geocode, geocodeName)`

- latitude: number
- longitude: number
- country: `checkStr`
- countryCode: `checkCountryCode()`
- city: `checkCity()`

`checkNumber(num, numFor, {inclusiveMin,inclusiveMax}={})`

- No `inclusiveMin` nor `inclusiveMin` provided: JUST check type
- `inclusiveMin` provided: check type & lower limit
- `inclusiveMax` provided: check type & upper limit

```js
checkNumber(1,"eg1",{inclusiveMin:1,inclusiveMax:5})
checkNumber(3,"eg2",{inclusiveMin:1})
checkNumber(5,"eg3",{inclusiveMax:5})
checkNumber(7,"eg4")
```

- 

`checkDifficulty(difficulty, difficultyName)`

- 1<= difficulty <=5
- integer

`toTitleCase(str)`

```js
"an apple a day" -> "An Apple A Day"
```

`checkStrArr(arr, arrName)`

- non-empty array
- non-empty string as array element(s)

`arrsEqual(arr1, arr2)`

- recursively

`objsEqual(obj1, obj2)`

- recursively

`deepEqual = (obj1, obj2)`

- support mixed type

- recursively

`randomizeArray(array)`

- JUST shuffle elements

`objectId2str_doc(doc)`

- replace any {\_id: new ObjectId('xxxx')} with {\_id: 'xxxx'}
- recursively

`objectId2str_docs_arr(arrOfDocs)`

- apply `objectId2str_doc(doc)` to each document element

`extractKV(toObj,fromObj,[...keys],{ifFilterUndefined=false}={})`

- in-place, fill `toObj`

```js
const toObj = {};
const fromObj = {
    aStr:"str",
    aNum:1,
    aBool: false,
    anArr: ["rts",0,true],
    anObj:{
        bObj:{
            cStr:"here"
        },
    }
}
extractKV(toObj, fromObj, ["aStr","anArr","anObj.bObj.cStr","XXX"]) // by default not fileter "undefined" out
console.log(toObj)
/*
{
    aStr: "str",
    anArr: ["rts",0,true],
    cStr: "here",
    XXX: undefined
}
*/

```

`extractKV_objArr(fromObjArr,[...keys],{ifFilterUndefined=false}={})`

- not in-place

- apply `extractKV` to each element

## ./seed/seed.js

- to populate database
- run by `npm run seed`
- options available: `npm run seed -- <option>`
  - -uid: show user ids after populating
  - -bid: show bird ids after populating
  - -all: show all users information after populating
  - -v: verbose. show all above
  - Only prompts like "seed done!" by default

## ./test/dbtest.js

- try some problematic input and catch
- run by `npm run dbtest`
- automatically call `npm run seed`
- NO options available

## ./data/users.js

~~`createUser({ username, hashed_password, icon, geocode } = {})`~~

`createUser( username, hashed_password, icon, geocode } = {})`

all args required

- username: string. case INsensitive
- hash_password: string. NO further validation
- ~~icon: string.~~
  - ~~validate supported extension, and supported protocols(http:// , https://)~~
  - ~~NO length validation~~
- ~~geocode: object~~

`getUserById = async (userId)`

throw if no such id

`getUserByUserName = async (username)`

throw if no such username

`getAllUsers()`

get all users. returns [] when no users.

`removeUserById(userId)`

throw if no such id

`updatePersonalInfoById( userId, { username, hashed_password, icon, geocode } = {})`

````js
// at least 1 field should be different and provided. username is case INsensitive
await updatePersonalInfoById("642bdbf502ce2ade5ce6bfa0",{username:"Bob"});
await updatePersonalInfoById("642bdbf502ce2ade5ce6bfa1",{username:"Daniel",hashed_password:"e0f4f767ac88a9303e7317843ac20be980665a36f52397e5b26d4cc2bf54011d",icon:"https://developer.mozilla.org/static/media/chrome.4c57086589fd964c05f5.svg",geocode:{}})
````

`updatePlayerInfoById(userId, operation)`

e.g

```js
// only support $inc so far for scores, standing for increment
// at least 1 score increment should be provided
// increment of high_score should >= 0, lifetime_score should be non-negative after increment
await updatePlayerInfoById("642bdbf502ce2ade5ce6bfa0",{$inc:{high_score:10,lifetime_score:-2}});
await updatePlayerInfoById("642bdbf502ce2ade5ce6bfa1",{$inc:{lifetime_score:8}});

// $pushSubmission, $pullSubmission
await updatePlayerInfoById("642bdbf502ce2ade5ce6bfa3",{$pushSubmission:{birdId:"642bdbf502ce2ade5ce6bfa2"}});
await updatePlayerInfoById(,"642bdbf502ce2ade5ce6bfa5",{$pullSubmission:{birdId:"642bdbf502ce2ade5ce6bfa4"}});

// $pushLastQuestions
await updatePlayerInfo("642bdbf502ce2ade5ce6bfa7",{$pushLastQuestions:{birdId:"642bdbf502ce2ade5ce6bfa6"}});
```

~~`incrementScoresById(id, { high_score, lifetime_score } = {})`~~

NOT exported

~~`pullSubmissionByBirdId({ birdId } = {})`~~

NOT exported

~~`pushSubmissionByIds(userId, { birdId } = {})`~~

NOT exported

~~`pushLastQuestionsByIds(userId, { birdId } = {})`~~

NOT exported

`topNthLocalUsers(n, countryCode, city)`

throw if no users found. `city` can be "all", which gets users for some country

`topNthGlobalUsers(n)`

throw if no users found

## ./data/birds.js

`createBird({ userId, url, names, geocode, difficulty } = {}) `

all args required

- userId: string
- url: string
  - validate supported extension, and supported protocols(http:// , https://)
  - NO length validation
- geocode: object
- difficulty: number. ranging from 1 to 5, inclusively

`getBirdById(birdId)`

throw if no such id

`getAllBirdsNames()`

return  an array of array of birds names

`getLocalBirds(countryCode, city)`

throw if no user found.` city` can be "all", which gets users for some country

`getAllBirds()`

get all birds. returns [] when there is no birds.

`removeBirdById(birdId)`

throw if no such id

`updateBirdById( birdId, { url, names, geocode, difficulty } = {} ) `

at least one field should be different and provided



## ./data/questions

`getQuestions4User(userId,{numberOfOptions=4, numberOfQuestions=5, countryCode, city, ifGlobal=false}={})`

- if `ifGlobal===true`, then get questions for user from all birds. It overrides `countryCode` and `city`
- `countryCode` and `city` should be both defined or undefined
  - if both defined, get questions from `countryCode` and `city`
  - if both undefined, get questions from user local
- throw if not enough birds to make such a quiz set
- `numberOfOptions` should be >=2
- `numberOfQuestions` should be >=1
- `city` is case INsensitive

```js
// get 5 4-option questions from the user local
await getQuestions4User("642bdbf502ce2ade5ce6bfa0");
// get 5 4-option questions from global(note "ifGlobal: true" dominates)
await getQuestions4User("642bdbf502ce2ade5ce6bfa1",{ifGlobal:true, coutryCode:"XX", city:"anywhere"});
// get 6 3-option questions from "US", "New York"
await getQuestions4User("642bdbf502ce2ade5ce6bfa1",{numberOfOptions:3, numberOfQuestions:6, coutryCode:"US", city:"new YoRk"})
```

`getQuestions4Guest({numberOfOptions=4, numberOfQuestions=5, countryCode, city}={})`

- `countryCode` and `city` should be both defined or undefined
  - if both defined, get questions from `countryCode` and `city`
  - if both undefined, get questions from global
- throw if not enough birds to make such a quiz set
- `numberOfOptions` should be >=2
- `numberOfQuestions` should be >=1
- `city` is case INsensitive

```js
// get 2 6-option questions from global
await getQuestions4Guest({numberOfQuestions:2, numberOfOptions:6});
// get 5 4-option questions from "US", "New York"
await getQuestions4Guest({numberOfQuestions:2, numberOfOptions:6, countryCode:"US", city:"nEw yOrk"});
```

​	
