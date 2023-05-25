// ---packages---
const fs = require('fs');

// ---functions---
// const scrapeImdbModule = require('./functions/scrapeImdb');
const getMetadataModule = require('./functions/getMetadata');
// const changeMetadata = require('./functions/changeMetadata');
const writeOutputDataModule = require('./helpers/writeOutputData');

const fileDirectory = "C:/Users/tyler/Videos/poi/";
// const showId = "tt0417299";
const showMetadataJSON = "./results/show-output.json";
const episodeMetadataJSON = "./results/episodes-output.json";

// Input: video file meta data
// Ouput: usable objects
const turnMetadataIntoObjects = (metadata) => {
    // console.log("metadata: ", metadata);

    const videoMetadataObjects = [];

    for (let i = 0; i < metadata.length; i++) {
        const videoMetadataObject = {
            filename: metadata[i].filename,
            show: "",
            season: "",
            episode: "",
            title: "",
            newFilename: ""
        };
        
        const fileType = videoMetadataObject.filename.split(".")[1];
        if (fileType === "mp4" || fileType === "m4v") {
          videoMetadataObjects.push(videoMetadataObject);
        }
    }

    // console.log("videoMetadataObjects: ", videoMetadataObjects);

    return videoMetadataObjects;
};

main = async () => {
  let showMetadata;
  let seasonsMetadata;

    // Read show data
    fs.readFile(showMetadataJSON, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
    
        try {
            const showMetadataParsed = JSON.parse(data);
            // console.log(showMetadata);
            showMetadata = showMetadataParsed;
        } catch (error) {
            console.error('Error parsing showMetadata JSON:', error);
        }
    });

    // Read episodes data
    fs.readFile(episodeMetadataJSON, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
    
        try {
            const episodeMetadataParsed = JSON.parse(data);
            // console.log(episodeMetadata);
            seasonsMetadata = episodeMetadataParsed;
        } catch (error) {
            console.error('Error parsing episodeMetadata JSON:', error);
        }
    });

    const processMetadata = (metadata) => {
        const videoMetadataObjects = turnMetadataIntoObjects(metadata);
        return videoMetadataObjects;
      };
      
      const waitAndGetMetadata = async () => {
        try {
          const videofileMetadata = await new Promise((resolve, reject) => {
            getMetadataModule.main(fileDirectory, (err, metadata) => {
              if (err) {
                console.error('Error:', err);
                reject(err);
                return;
              }
            
              resolve(metadata);
            });
          });
      
          const videofileMetadataObjects = processMetadata(videofileMetadata);

          return videofileMetadataObjects;
        } catch (error) {
          console.error('Error:', error);
        }
      };
      
      const videofileMetadataObjects = await waitAndGetMetadata();

      // Add metadata to episode objects
      // -search for episode name from episodeMetadata, compare with videofileMetadataObject.filename
      // -if match, add episode number, season number, episode title, episode description, episode date
      for (let videofileMetadataObject of videofileMetadataObjects) {
        for (let season of seasonsMetadata) {
          for (let episode of season) {
            // turn to lowercase to compare easily
            const filenameLowerCase = videofileMetadataObject.filename.toLowerCase();
            const titleLowerCase = episode.title.toLowerCase();

            if (filenameLowerCase.includes(titleLowerCase)) {
              videofileMetadataObject.season = episode.seasonNumber;
              videofileMetadataObject.episode = episode.episodeNumber;
              videofileMetadataObject.title = episode.title;
              videofileMetadataObject.description = episode.description;
              videofileMetadataObject.date = episode.airDate;
              if (videofileMetadataObject.episode < 10) {
                videofileMetadataObject.newFilename = fileDirectory + "E0" + videofileMetadataObject.episode + " - " + videofileMetadataObject.title + ".mp4"
              } else {
                videofileMetadataObject.newFilename = fileDirectory + "E" + videofileMetadataObject.episode + " - " + videofileMetadataObject.title + ".mp4"
              }
            }
          }
        }
        videofileMetadataObject.show = showMetadata.title;
      }

      console.log("videofileMetadataObjects: ", videofileMetadataObjects);

      // write videofileMetadataObjects to file
      const videofileOutputFile = "./results/videofileObjects.json";
      const videofileMetadataObjectsJSON = JSON.stringify(videofileMetadataObjects, null, 2);
        if (err) {
      writeOutputDataModule.main(videofileOutputFile, videofileMetadataObjects);
};

main();

// module.exports = main();