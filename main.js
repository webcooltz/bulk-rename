// ---packages---
const fs = require('fs');

// ---functions---
// const scrapeImdbModule = require('./functions/scrapeImdb');
const getMetadataModule = require('./functions/getMetadata');
// const changeMetadata = require('./functions/changeMetadata');
const outputDataModule = require('./helpers/writeOutputData');

// ---helpers---
const cleanDataModule = require('./helpers/cleanData');
const logFileModule = require('./helpers/writeToLogfile');

// ---variables---
const videofileOutputFile = "./results/videofileObjects.json";
const inputJSON = "./input.json";
const showMetadataJSON = "./results/showOutput.json";
const episodeMetadataJSON = "./results/episodesOutput.json";

let videoFileExtension;

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

    const successMessage = "Successfully cleaned file paths (main.cleanFilepath).";
    console.log(successMessage);
    logFileModule.writeToLogfile(successMessage);

    return filepath;
};

// take input and parse it
// -directories
// -imdbId
const parseInputJSON = (inputJSON) => {
  const inputJSONParsed = JSON.parse(fs.readFileSync(inputJSON, 'utf8'));
  let cleanUserInput;

  if (inputJSONParsed) {
    cleanUserInput = inputJSONParsed;
  } else {
    const errorMessage = "Invalid input JSON (main.parseInputJSON).";
    console.error(errorMessage);
    logFileModule.writeToLogfile(errorMessage);
    return;
  }

  if (cleanUserInput.fileDirectory) {
    if (cleanUserInput.fileDirectory.length < 3) {
      const errorMessage = "Invalid file directory (main.parseInputJSON).";
      console.error(errorMessage);
      logFileModule.writeToLogfile(errorMessage);
      return;
    } else {
      cleanUserInput.fileDirectory = cleanFilepath(cleanUserInput.fileDirectory);
    }
  } else {
    const errorMessage = "No file directory provided (main.parseInputJSON).";
    console.error(errorMessage);
    logFileModule.writeToLogfile(errorMessage);
    return;
  }

  if (cleanUserInput.ffmpegDirectory) {
    if (cleanUserInput.ffmpegDirectory.length < 3) {
      const errorMessage = "Invalid ffmpeg directory (main.parseInputJSON).";
      console.error(errorMessage);
      logFileModule.writeToLogfile(errorMessage);
      return;
    } else {
      cleanUserInput.ffmpegDirectory = cleanFilepath(cleanUserInput.ffmpegDirectory);
    }
  } else {
    const errorMessage = "No ffmpeg directory provided (main.parseInputJSON).";
    console.error(errorMessage);
    logFileModule.writeToLogfile(errorMessage);
    return;
  }

  if (cleanUserInput.imdbId) {
    if (cleanUserInput.imdbId.length < 3) {
      const errorMessage = "Invalid imdbId (main.parseInputJSON).";
      console.error(errorMessage);
      logFileModule.writeToLogfile(errorMessage);
      return;
    } else {
      cleanUserInput.imdbId = cleanDataModule.cleanData(cleanUserInput.imdbId);
    }
  } else {
    const errorMessage = "No imdbId provided (main.parseInputJSON).";
    console.error(errorMessage);
    logFileModule.writeToLogfile(errorMessage);
    return;
  }
 
  const successMessage = "Successfully parsed JSON input (main.parseInputJSON).";
  console.log(successMessage);
  logFileModule.writeToLogfile(successMessage);

  return cleanUserInput;
};

// Input: video file meta data
// Ouput: usable objects
const turnMetadataIntoObjects = (metadata) => {
  try {
    const videoMetadataObjects = [];

    for (let i = 0; i < metadata.length; i++) {
        const videoMetadataObject = {
            filename: cleanDataModule.cleanData(metadata[i].filename),
            show: "",
            season: "",
            episode: "",
            title: "",
            alternateTitle: "",
            newFilename: "",
            needsFixing: false
        };
        
        const videoMetadataObjectSplit = videoMetadataObject.filename.split(".");
        const fileType = videoMetadataObjectSplit[videoMetadataObjectSplit.length - 1];
        if (fileType === "mkv" || fileType === "avi" || fileType === "mp4" || fileType === "m4v") {
          videoFileExtension = "." + fileType;
          videoMetadataObjects.push(videoMetadataObject);
        }
    }

    const successMessage = "Successfully parsed metadata into objects (main.turnMetadataIntoObjects).";
    console.log(successMessage);
    logFileModule.writeToLogfile(successMessage);

    return videoMetadataObjects;
    
  } catch (error) {
    const errorMessage = `Error parsing metadata into objects (main.turnMetadataIntoObjects).\nError: ${error}`;
    console.error(errorMessage);
    logFileModule.writeToLogfile(errorMessage);
  }
};

main = async () => {
  const userInput = parseInputJSON(inputJSON);
   /*
    {
      "imdbId": "tt0111161",
      "numberOfSeasons": 5,
      "fileDirectory": "D:\\TV Shows\\Person of Interest (2011)\\season1",
      "ffmpegDirectory": "C:\\ffmpeg\\bin"
    }
  */

  if (!userInput) {
    const errorMessage = "Invalid user input (main.main).";
    console.error(errorMessage);
    logFileModule.writeToLogfile(errorMessage);
    return;
  }

  let showMetadata;
  let seasonsMetadata;

  // Read show data
  fs.readFile(showMetadataJSON, 'utf8', (err, data) => {
      if (err) {
        const errorMessage = `Error reading file (main.main (read showMetaData)).\nError: ${err}`;
        console.error(errorMessage);
        logFileModule.writeToLogfile(errorMessage);
        return;
      }
  
      try {
        const showMetadataParsed = JSON.parse(data);
        showMetadata = showMetadataParsed;

        const successMessage = "Successfully read-in show metadata (main.main).";
        console.log(successMessage);
        logFileModule.writeToLogfile(successMessage);
      } catch (error) {
        const errorMessage = `Error parsing showMetadata JSON (main.main).\nError: ${error}`;
        console.error(errorMessage);
        logFileModule.writeToLogfile(errorMessage);
      }
  });

  // Read episodes data
  fs.readFile(episodeMetadataJSON, 'utf8', (err, data) => {
      if (err) {
        const errorMessage = `Error reading file (main.main).\nError: ${err}`;
        console.error(errorMessage);
        logFileModule.writeToLogfile(errorMessage);
        return;
      }
  
      try {
        const episodeMetadataParsed = JSON.parse(data);
        seasonsMetadata = episodeMetadataParsed;

        const successMessage = "Successfully read-in seasons metadata (main.main).";
        console.log(successMessage);
        logFileModule.writeToLogfile(successMessage);
      } catch (error) {
        const errorMessage = `Error parsing episodeMetadata JSON (main.main).\nError: ${error}`;
        console.error(errorMessage);
        logFileModule.writeToLogfile(errorMessage);
      }
  });

  // processMetadata
  // -Process metadata from video files
  // -input: metadata from video files
  // -output: usable video/episode objects
  const processMetadata = (metadata) => {
    const videoMetadataObjects = turnMetadataIntoObjects(metadata);
    return videoMetadataObjects;
  };
  
  // Get metadata from video files
  const waitAndGetMetadata = async () => {
    try {
      const videofileMetadata = await new Promise((resolve, reject) => {
        getMetadataModule.main(userInput.fileDirectory, userInput.ffmpegDirectory, (err, metadata) => {
          if (err) {
            const errorMessage = `Error getting metadata (main.waitAndGetMetadata).\nError: ${err}`;
            console.error(errorMessage);
            logFileModule.writeToLogfile(errorMessage);
            reject(err);
            return;
          }
          resolve(metadata);
        });
      });
      const videofileMetadataObjects = processMetadata(videofileMetadata);

      const successMessage = "Successfully got metadata from video files (main.waitAndGetMetadata).";
      console.log(successMessage);
      logFileModule.writeToLogfile(successMessage);

      return videofileMetadataObjects;
    } catch (error) {
      const errorMessage = `Catch error getting metadata from video files (main.waitAndGetMetadata).\nError: ${error}`;
      console.error(errorMessage);
      logFileModule.writeToLogfile(errorMessage);
    }
  };
    
  const videofileMetadataObjects = await waitAndGetMetadata();
  // const successMessage = "Successfully got metadata from video files (main.main).";

  // Add metadata to episode objects
  // -search for episode name from episodeMetadata, compare with videofileMetadataObject.filename
  // -if match, add episode number, season number, episode title, episode description, episode date
  // -else - finds the episode number and matches that

  for (let videofileMetadataObject of videofileMetadataObjects) {
    for (const season of seasonsMetadata) {
      for (const episode of season) {
        const episodeGuess = videofileMetadataObject.filename.match(/E\d+/g);
        const episodeGuessNumber = parseInt(episodeGuess[0].split("E")[1]);
        if (videofileMetadataObject.filename.toLowerCase().includes(episode.title.toLowerCase())) {
          // season
          videofileMetadataObject.season = episode.seasonNumber.toString();
          // episode title
          videofileMetadataObject.title = cleanDataModule.cleanData(episode.title);
          // episode number
          videofileMetadataObject.episode = episode.episodeNumber.toString();
          // episode description
          videofileMetadataObject.description = cleanDataModule.cleanData(episode.description);
          // episode date
          videofileMetadataObject.date = episode.airDate;
          // episode filename
          videofileMetadataObject.newFilename = episode.episodeNumber < 10 ? userInput.fileDirectory + "E0" + videofileMetadataObject.episode + " - " + videofileMetadataObject.title + videoFileExtension : userInput.fileDirectory + "E" + videofileMetadataObject.episode + " - " + videofileMetadataObject.title + videoFileExtension;
        } else if (episodeGuessNumber === episode.episodeNumber) {
            // episode number
            videofileMetadataObject.episode = episode.episodeNumber.toString();
            // season
            videofileMetadataObject.season = episode.seasonNumber.toString();
            // episode title
            videofileMetadataObject.title = cleanDataModule.cleanData(episode.title);
            // episode alternate title
            videofileMetadataObject.alternateTitle = cleanDataModule.cleanData(videofileMetadataObject.filename.split("-")[1].trim());
            // remove excess characters from alternate title
            videofileMetadataObject.alternateTitle = videofileMetadataObject.alternateTitle.includes("[") ? videofileMetadataObject.alternateTitle.split("[")[0].trim() : videofileMetadataObject.alternateTitle;
            // episode description
            videofileMetadataObject.description = cleanDataModule.cleanData(episode.description);
            // episode date
            videofileMetadataObject.date = episode.airDate;
            // new filename
            const newFilename = episode.episodeNumber < 10 ? userInput.fileDirectory + "E0" + videofileMetadataObject.episode + " - " + videofileMetadataObject.title : userInput.fileDirectory + "E" + videofileMetadataObject.episode + " - " + videofileMetadataObject.title;
            // add file extension depending on whether or not there is an alternate title
            if (videofileMetadataObject.alternateTitle.length > 0) {
              const alternateTitleWithoutExtension = videofileMetadataObject.alternateTitle.split(".")[0];
              videofileMetadataObject.newFilename = newFilename + ` (${alternateTitleWithoutExtension})` + videoFileExtension;
            } else {
              videofileMetadataObject.newFilename = newFilename + videoFileExtension;
            }
            videofileMetadataObject.needsFixing = true;
        } else {
          const errorMessage = `Error setting videofileMetadataObjects (main.main line 309).`;
          console.error(errorMessage);
          logFileModule.writeToLogfile(errorMessage);
        }
    }
    videofileMetadataObject.show = cleanDataModule.cleanData(showMetadata.title);
  }
}

  // write episodes to file
  outputDataModule.writeOutputData(videofileOutputFile, videofileMetadataObjects);

  // display success message in log file
  const successMessage = `Successfully completed main.js (main.main).`;
  console.log(successMessage);
  logFileModule.writeToLogfile(successMessage);
};

main();

// module.exports = main();

// to-do
// -if seasons are in the same folder / if season numbers are mixed in the same folder
