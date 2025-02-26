import "dotenv/config";
import { readFile } from "fs/promises";
import PocketBase from "pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

await pb
  .collection("_superusers")
  .authWithPassword(process.env.pb_email, process.env.pb_password);

pb.autoCancellation(false);

const data = JSON.parse(await readFile("./LOL.json"));
const videoGameName = "League of Legends";

const flattenData = data.map((item) => ({
  ...item,
  league_name: item.league?.name || null,
  league_image: item.league?.image || null,
  videoGame: videoGameName,
  league: undefined, // Remove the nested league object
}));

while (flattenData.length) {
  const chunk = flattenData.splice(0, 1000);
  const promises = [];

  for (let item of chunk) {
    promises.push(pb.collection("games").create(item));
  }

  await Promise.all(promises);
}
