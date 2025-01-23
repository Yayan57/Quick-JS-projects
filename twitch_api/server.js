require("dotenv").config();
const request = require("request");
const fs = require("fs");

const getToken = (callback) => {
  const options = {
    url: "https://id.twitch.tv/oauth2/token",
    json: true,
    form: {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "client_credentials",
    },
  };

  request.post(options, (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    console.log(`Status: ${res.statusCode}`);
    console.log(body);

    callback(body.access_token);
  });
};

const getGameID = (accessToken, gameName, callback) => {
  const gameOptions = {
    url: `https://api.twitch.tv/helix/games?name=${encodeURIComponent(
      gameName
    )}`,
    method: "GET",
    headers: {
      "Client-ID": process.env.CLIENT_ID,
      Authorization: `Bearer ${accessToken}`,
    },
  };

  request.get(gameOptions, (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    const data = JSON.parse(body);
    if (data.data && data.data.length > 0) {
      callback(data.data[0].id);
    } else {
      console.log(`Game not found: ${gameName}`);
    }
  });
};

const getTopStreams = (accessToken, gameID, gameName, callback) => {
  const streamOptions = {
    url: `https://api.twitch.tv/helix/streams?game_id=${gameID}&first=10`,
    method: "GET",
    headers: {
      "Client-ID": process.env.CLIENT_ID,
      Authorization: `Bearer ${accessToken}`,
    },
  };

  request.get(streamOptions, (err, res, body) => {
    if (err) {
      return console.log(err);
    }
    console.log(`Top 10 streams for ${gameName}:`);
    const streams = JSON.parse(body);
    console.log(streams);
    callback(gameName, streams);
  });
};

const writeToFile = (data) => {
  fs.writeFile("watch.json", JSON.stringify(data, null, 2), (err) => {
    if (err) {
      return console.log(err);
    }
    console.log("Data written to watch.json");
  });
};

getToken((accessToken) => {
  const gameNames = [
    "League of Legends",
    "Rocket League",
    "Counter-Strike",
    "Marvel Rivals",
    "Fortnite",
  ];
  const allStreams = {};

  let processedGames = 0;
  gameNames.forEach((gameName) => {
    getGameID(accessToken, gameName, (gameID) => {
      getTopStreams(accessToken, gameID, gameName, (gameName, streams) => {
        allStreams[gameName] = streams;
        processedGames++;
        if (processedGames === gameNames.length) {
          writeToFile(allStreams);
        }
      });
    });
  });
});
