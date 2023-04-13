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

`checkId(id, idName)`

- valid ObjectId string
- trimmed

`checkUrl(url, urlName, minimumLength = 0)`

- supported prefix: ["http://", "https://"]
- trimmed
- replaced space in-between with "%20"
- minimumLength refers the length AFTER prefix

`checkImgUrl(url, imgName)`

- supported extensions : [".jpg", ".jpeg", ".png", ".gif", ".svg"], including their uppercase variants

`checkCountryCode(countryCode)`

JUST `checkStr`

`checkGeoCode(geoCode, geoCodeName)`

- latitude: number
- longitude: number
- country: string
- countryCode: string
- city: string

`checkNumber(num, numName, min, max)`

- No `min` nor `max` provided: JUST check type
- `min` provided: check type & lower limit
- `max` provided: check type & upper limit

`checkStrArr(arr, arrName)`

- non-empty array
- non-empty string as array element(s)

`arrsEqual(arr1, arr2)`

- recursively

`objsEqual(obj1, obj2)`

- recursively

`deepEqual = (obj1, obj2)`

- recursively

`objectId2str_doc(doc)`

- replace any {\_id: new ObjectId('xxxx')} with  {\_id: 'xxxx'}
- recursively

`objectId2str_docs_arr(arrOfDocs)`

- apply `objectId2str_doc(doc)` to each document element

## ./seed/seed.js

- to populate database
- run by `npm run seed`
- options available: `npm run seed -- <option>`
  - -uid: show user ids after populating
  - -bid: show bird ids after populating
  - -all: show all users information after populating
  - -v: verbose. show all above
  - Only prompt like "seed done!" by default

## ./test/dbtest.js

- try some problematic input and catch
- run by `npm run dbtest`
- automatically call `npm run seed`
- NO options available

## ./data/users.js

`createUser({ username, hashed_password, icon, geocode } = {})`

all args required

- username: string. case INsensitive
- hash_password: string. NO further validation
- icon: string.
  - validate supported extension, and supported protocols(http:// , https://)
  - NO length validation
- geocode: object

`getUserById = async (userId)`

throw if no such id

~~`getUserByUserName = async (username)`~~

NOT exported

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



`updatePlayerInfoById(operation, userId)`

e.g

```js
// only support $inc so far for scores, standing for increment
// at least 1 score increment should be provided
// increment of high_score should >= 0, lifetime_score should be non-negative after increment
await updatePlayerInfoById({$inc:{high_score:10,lifetime_score:-2}},"642bdbf502ce2ade5ce6bfa0");
await updatePlayerInfoById({$inc:{lifetime_score:8}},"642bdbf502ce2ade5ce6bfa1");

// $pushSubmission, $pullSubmission
await updatePlayerInfoById("642bdbf502ce2ade5ce6bfa3",{$pushSubmission:{birdId:"642bdbf502ce2ade5ce6bfa2"}});
await updatePlayerInfoById(,"642bdbf502ce2ade5ce6bfa5",{$pullSubmission:{birdId:"642bdbf502ce2ade5ce6bfa4"}});

// $pushLastQuestions
await updatePlayerInfo({$pushLastQuestions:{birdId:"642bdbf502ce2ade5ce6bfa6"}},"642bdbf502ce2ade5ce6bfa7");
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

`getLocalBirds(countrycode, city)`

throw if no user found.` city` can be "all", which gets users for some country

`getAllBirds()`

get all birds. returns [] when there is no birds.

`removeBirdById(birdId)`

throw if no such id

`updateBirdById( birdId, { url, names, geocode, difficulty } = {} ) `

at least one field should be different and provided

