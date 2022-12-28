import axios from "axios";
import fs from "fs";

let keepLooping = true;
const final = [];
const FILE_DEEZER_SONGS_NAME = "test.json";

let url = "https://api.deezer.com/playlist/1993803246/tracks";

export const mainDeezer = async () => {
  //nodemon reiniciaba c/vez q hacia un writeFile
  if (readJson()?.length > 0) {
    console.log(
      "ya hay canciones en el json, ABORTAMOS EL NODEMON REFRESH, y la busqueda en deezer"
    );
    return;
  }
  async function getDeezerData() {
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
  console.log("start FETCHING FROM DEEZER API");
  while (keepLooping) {
    await getDeezerData();
  }

  //save all songs in test.json FILE
  try {
    fs.writeFileSync(FILE_DEEZER_SONGS_NAME, JSON.stringify(final));
  } catch (err) {
    console.error(err);
  }
};

export function readJson() {
  let rawdata = fs.readFileSync(FILE_DEEZER_SONGS_NAME);

  let array = JSON.parse(rawdata);
  return array;
}
