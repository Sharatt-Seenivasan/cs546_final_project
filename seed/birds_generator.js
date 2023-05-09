import fs from "fs/promises";
import path from "path";
const target_path = path.resolve("static/birds.json");

await fs.writeFile(target_path, "");

const national2Birds_raw = await fs.readFile(
  path.resolve("static/wiki_national_birds.json"),
  "utf-8"
);
const nation_geocodes_raw = await fs.readFile(
  path.resolve("static/nation_geocodes.json"),
  "utf-8"
);
const national2Birds = JSON.parse(national2Birds_raw);
const nation_geocodes = JSON.parse(nation_geocodes_raw);

const birds = [];
for (const [nation, nation_birds] of Object.entries(national2Birds)) {
  for (const nation_bird of nation_birds) {
    const aBird = {};
    aBird.url = nation_bird.pic;
    aBird.names = [nation_bird.name, nation_bird.name_sci];
    aBird.geocode = nation_geocodes[nation];
    aBird.difficulty = Math.floor(Math.random() * 5) + 1;
    birds.push(aBird);
  }
}
await fs.appendFile(target_path, JSON.stringify(birds));
