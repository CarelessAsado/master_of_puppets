import axios from "axios";
import fs from "fs";

let keepLooping = true;
const final = [];

let url = "https://api.deezer.com/playlist/1993803246/tracks";

const main = async () => {
  if (readJson()?.length > 0) {
    console.log("ABORTAMOS EL NODEMON REFRESH");
    return;
  }
  async function doIT() {
    try {
      const { data: dataResp } = await axios.get(url);
      dataResp.data.forEach((song) => {
        const ALLINEED = song.title + " " + song.artist.name;
        final.push(ALLINEED);
      });
      console.log("NEXT CALL: ", dataResp.next);
      dataResp.next;
      if (!dataResp.next) {
        keepLooping = false;
      }
      url = dataResp.next;
    } catch (error) {
      console.log(error);
    }
  }
  console.log("start");
  while (keepLooping) {
    await doIT();
  }
};

main().then(async () => {
  if (readJson()?.length > 0) {
    console.log("ABORTAMOS EL NODEMON REFRESH");
    return;
  }
  try {
    fs.writeFileSync("test.json", JSON.stringify(final));
    readJson();
  } catch (err) {
    console.error(err);
  }
});

function readJson() {
  let rawdata = fs.readFileSync("test.json");

  let array = JSON.parse(rawdata);
  return array;
}
