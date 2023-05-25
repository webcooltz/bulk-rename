// ---packages---
const fs = require('fs');

// ---functions---
// const scrapeImdbModule = require('./functions/scrapeImdb');
const getMetadataModule = require('./functions/getMetadata');
// const changeMetadata = require('./functions/changeMetadata');
const writeOutputDataModule = require('./helpers/writeOutputData');

// ---variables---
const videofileOutputFile = "./results/videofileObjects.json";
const inputJSON = "./input.json";
const showMetadataJSON = "./results/showOutput.json";
const episodeMetadataJSON = "./results/episodesOutput.json";

// cleans filepath
// -replaces backslashes with forward slashes
// -adds a trailing slash if it doesn't exist
const cleanFilepath = (filepath) => {
    if (filepath.includes("\\")) {
        filepath = filepath.replace(/\\/g, "/");
    }
    if (filepath[filepath.length - 1] !== "/") {
        filepath += "/";
    }
    return filepath;
};

// take input and parse it
// -directory
// -showId
const parseInputJSON = (inputJSON) => {
  const inputJSONParsed = JSON.parse(fs.readFileSync(inputJSON, 'utf8'));
  let cleanUserInput;

  if (inputJSONParsed) {
    cleanUserInput = inputJSONParsed;
  } else {
    console.error("Invalid input JSON.");
    return;
  }

  let fileDirectory = cleanUserInput.fileDirectory;
  if (fileDirectory) {
    if (fileDirectory.length < 3) {
      console.error("Invalid file directory.");
      return;
    }
    cleanUserInput.fileDirectory = cleanFilepath(fileDirectory);
  } else {
    console.error("No file directory provided.");
    return;
  }

  let ffmpegDirectory = cleanUserInput.ffmpegDirectory;
  if (ffmpegDirectory) {
    if (ffmpegDirectory.length < 3) {
      console.error("Invalid file directory.");
      return;
    }
    cleanUserInput.ffmpegDirectory = cleanFilepath(ffmpegDirectory);
  } else {
    console.error("No file directory provided.");
    return;
  }

  if (cleanUserInput.imdbId) {
    if (cleanUserInput.imdbId.length < 3) {
      console.error("Invalid imdbId.");
      return;
    }
  } else {
    console.error("No imdbId provided.");
    return;
  }
 
  return cleanUserInput;
};

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

  const userInput = parseInputJSON(inputJSON);
  /*
  {
    "imdbId": "tt0111161",
    "numberOfSeasons": 5,
    "fileDirectory": "D:\\TV Shows\\Person of Interest (2011)\\season1",
    "ffmpegDirectory": "C:\\ffmpeg\\bin"
  }
  */
  // console.log("userInput: ", userInput);
  // return;

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
            getMetadataModule.main(userInput.fileDirectory, userInput.ffmpegDirectory, (err, metadata) => {
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
                videofileMetadataObject.newFilename = userInput.fileDirectory + "E0" + videofileMetadataObject.episode + " - " + videofileMetadataObject.title + ".mp4"
              } else {
                videofileMetadataObject.newFilename = userInput.fileDirectory + "E" + videofileMetadataObject.episode + " - " + videofileMetadataObject.title + ".mp4"
              }
            }
          }
        }
        videofileMetadataObject.show = showMetadata.title;
      }

      // write episodes to file
      writeOutputDataModule.main(videofileOutputFile, videofileMetadataObjects);
};

main();

// module.exports = main();