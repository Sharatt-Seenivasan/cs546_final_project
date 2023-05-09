import bcrypt from "bcrypt";
import path from "path";
import fs from "fs/promises";
const saltRounds = 16;
const target_path_all = path.resolve("static/users.json");

await fs.writeFile(target_path_all, "");

// ------------------ read geocode data -------------------------
const nation_geocodes_raw = await fs.readFile(
  path.resolve("static/nation_geocodes.json"),
  "utf-8"
);
const nation_geocodes = JSON.parse(nation_geocodes_raw);

const users = [];
// ------------------ create global users -------------------------
const target_path_globalUsers = path.resolve("static/global_users.json");
const global_usernames = [
  "Alice",
  "Bob",
  "Charlie",
  "David",
  "Eve",
  "Frank",
  "Grace",
  "Hannah",
  "Ivan",
  "Judy",
  "Karl",
  "Linda",
];
const user_icons = [
  "https://developer.mozilla.org/static/media/chrome.4c57086589fd964c05f5.svg",
  "https://developer.mozilla.org/static/media/edge.40018f6a959bc3e5c537.svg",
  "https://developer.mozilla.org/static/media/simple-firefox.9b9181d8c30c3de88edf.svg",
  "https://developer.mozilla.org/static/media/opera.a0ab0c5004c00e618a00.svg",
  "https://developer.mozilla.org/static/media/safari.3679eb31121b46323304.svg",
  "https://developer.mozilla.org/static/media/samsunginternet.55e41ddfc05627ecc331.svg",
  "https://developer.mozilla.org/static/media/webview.7d9bf32041e0c57240b5.svg",
  "https://developer.mozilla.org/static/media/deno.a791d0899729b3089500.svg",
  "https://developer.mozilla.org/static/media/nodejs.bb93afa7923c2473034b.svg",
  "https://developer.mozilla.org/static/media/twitter.cc5b37feab537ddbf701.svg",
  "https://developer.mozilla.org/static/media/github-mark-small.348586b8904b950b8ea8.svg",
  "https://developer.mozilla.org/static/media/theme-os-default.b14255eadab403fa2e8a.svg",
];

const global_user = [];
for (let idx = 0; idx < global_usernames.length; idx++) {
  const user = {};
  const username = global_usernames[idx];
  const plaintext_password = `${username[0]};0global`;
  user["username"] = username;
  user["plaintext_password"] = plaintext_password;
  user["hashed_password"] = await bcrypt.hash(plaintext_password, saltRounds);
  user["icon"] = user_icons[idx];
  user["geocode"] = Object.values(nation_geocodes)[idx];
  users.push(user);
  global_user.push(user);
}
await fs.appendFile(target_path_globalUsers, JSON.stringify(global_user));

// ------------------ create Hoboken users -------------------------
const target_path_hobokenUsers = path.resolve("static/hoboken_users.json");
const Hoboken_user_icons = [
  "https://cdn-icons-png.flaticon.com/128/45/45823.png",
  "https://cdn-icons-png.flaticon.com/128/5968/5968260.png",
  "https://cdn-icons-png.flaticon.com/128/6132/6132222.png",
  "https://cdn-icons-png.flaticon.com/128/9768/9768082.png",
  "https://cdn-icons-png.flaticon.com/128/8361/8361190.png",
  "https://cdn-icons-png.flaticon.com/128/26/26726.png",
  "https://cdn-icons-png.flaticon.com/128/281/281764.png",
  "https://cdn-icons-png.flaticon.com/128/1647/1647851.png",
  "https://t3.ftcdn.net/jpg/03/08/01/88/240_F_308018888_dTriP4D0eoXGFCnGEsJt2qaSA69WpAmJ.jpg",
  "https://cdn-icons-png.flaticon.com/128/3425/3425808.png",
  "https://cdn-icons-png.flaticon.com/128/10108/10108546.png",
  "https://cdn-icons-png.flaticon.com/128/4019/4019828.png",
  "https://cdn-icons-png.flaticon.com/128/732/732217.png",
  "https://cdn-icons-png.flaticon.com/128/732/732228.png",
  "https://static.wikia.nocookie.net/yugioh/images/e/e9/OOversoul-LDS3-EN-C-1E.png",
  "https://upload.wikimedia.org/wikipedia/commons/7/7e/Pixiv_Icon.svg",
  "https://cdn-icons-png.flaticon.com/128/2839/2839259.png",
  "https://static.wikia.nocookie.net/bindingofisaacre_gamepedia/images/3/32/Collectible_R_Key_icon.png",
  "https://img.icons8.com/?size=1x&id=21566&format=png",
  "https://cdn-icons-png.flaticon.com/128/5969/5969259.png",
  "https://cdn-icons-png.flaticon.com/128/3989/3989630.png",
  "https://cdn-icons-png.flaticon.com/128/190/190411.png",
  "https://img01.weeecdn.net/static/www/_next/static/media/weee.877aaea8.svg",
  "https://img.icons8.com/?size=1x&id=13903&format=png",
  "https://cdn-icons-png.flaticon.com/128/10527/10527318.png",
  "https://static.wikia.nocookie.net/metalslug/images/e/e6/021445.gif",
];
const Hoboken_user = [];
let charCode = "A".charCodeAt(0);
const Hoboken_geocode = {
  latitude: 40.7439905,
  longitude: -74.0323626,
  country: "United States",
  countryCode: "US",
  city: "Hoboken",
};
for (const Hoboken_user_icon of Hoboken_user_icons) {
  const user = {};
  const username = String.fromCharCode(charCode++) + "-hoboken";
  const icon = Hoboken_user_icon;
  const plaintext_password = `${username[0]};0global`;
  const hashed_password = await bcrypt.hash(plaintext_password, saltRounds);
  user["username"] = username;
  user["plaintext_password"] = plaintext_password;
  user["hashed_password"] = hashed_password;
  user["icon"] = icon;
  user["geocode"] = Hoboken_geocode;
  users.push(user);
  Hoboken_user.push(user);
}
await fs.appendFile(
  path.resolve(target_path_hobokenUsers),
  JSON.stringify(Hoboken_user)
);

// ------------------ create all users -------------------------
await fs.appendFile(target_path_all, JSON.stringify(users));
