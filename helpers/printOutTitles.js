// -- dependencies --
const fs = require('fs');

// -- helpers --
const outputDataModule = require('./writeOutputData');

// -- variables --
const failedEpisodesJSON = "./results/poiFailedVideos.json";
// const videofileObjects = "./results/videofileObjects.json";
const titleOutputFile = "./results/titles.json";

const main = (inputJSON) => {
    const parsedEpisodes = JSON.parse(fs.readFileSync(inputJSON, 'utf8'));
    console.log("inputJSONParsed: ", parsedEpisodes);

    const titles = [];

    for (const episode of parsedEpisodes) {
        console.log("episode.title: ", episode.title);
        titles.push(episode.title);
    }

    outputDataModule.writeOutputData(titleOutputFile, titles);
};

main(failedEpisodesJSON);