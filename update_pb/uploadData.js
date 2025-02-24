import "dotenv/config";
import { readFile } from "fs/promises";
import PocketBase from "pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

await pb
  .collection("_superusers")
  .authWithPassword(process.env.pb_email, process.env.pb_password);

pb.autoCancellation(false);

const data = JSON.parse(await readFile("./LOL.json"));

while (data.length) {
  const chunk = data.splice(0, 1000);
  const promises = [];

  for (let item of chunk) {
    promises.push(pb.collection("games").create(item));
  }

  await Promise.all(promises);
}
