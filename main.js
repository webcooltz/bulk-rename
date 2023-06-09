/* ---Main.js---
// -takes in JSON input
// -gets show metadata (pre-scraped)
// -gets video file metadata
// -cleans data
// -creates video file objects based on files and metadata
// -writes output JSON (to be used to change the filenames/metadata)
*/

// ---packages---
const fs = require('fs');
const path = require('path');
// ---functions---
// const scrapeImdbModule = require('./functions/scrapeImdb'); // add scrape later
const getMetadataModule = require('./functions/getMetadata');
// const changeMetadata = require('./functions/changeMetadata'); // add change later
// ---helpers---
const { cleanupData, cleanupFilepath, cleanupFilename } = require('./helpers/dataCleaner');
const { writeToLogfile } = require('./helpers/logfile');
const { writeOutputData } = require('./helpers/outputData');
// ---JSON---
const inputJSON = "./input.json";
const showMetadataJSON = "./results/showOutput.json";
const episodeMetadataJSON = "./results/episodesOutput.json";
const videofileOutputFile = "./results/videofileObjects.json";
// ---variables---
const episodeObjectsFinal = [];

let showMetadata;
let seasonsMetadata;
let videoFileExtension;

/* take JSON, clean it up, and return it
// -directories
// -imdbId
*/
const parseInputJSON = (inputJSON) => {
  const inputJSONParsed = JSON.parse(fs.readFileSync(inputJSON, 'utf8'));
  let cleanUserInput;

  if (inputJSONParsed) {
    cleanUserInput = inputJSONParsed;
  } else {
    const errorMessage = "Invalid input JSON (main.parseInputJSON).";
    console.error(errorMessage);
    writeToLogfile(errorMessage);
    return;
  }

  if (cleanUserInput.fileDirectory) {
    if (cleanUserInput.fileDirectory.length < 3) {
      const errorMessage = "Invalid file directory (main.parseInputJSON).";
      console.error(errorMessage);
      writeToLogfile(errorMessage);
      return;
    } else {
      cleanUserInput.fileDirectory = cleanupFilepath(cleanUserInput.fileDirectory);
    }
  } else {
    const errorMessage = "No file directory provided (main.parseInputJSON).";
    console.error(errorMessage);
    writeToLogfile(errorMessage);
    return;
  }

  if (cleanUserInput.ffmpegDirectory) {
    if (cleanUserInput.ffmpegDirectory.length < 3) {
      const errorMessage = "Invalid ffmpeg directory (main.parseInputJSON).";
      console.error(errorMessage);
      writeToLogfile(errorMessage);
      return;
    } else {
      cleanUserInput.ffmpegDirectory = cleanupFilepath(cleanUserInput.ffmpegDirectory);
    }
  } else {
    const errorMessage = "No ffmpeg directory provided (main.parseInputJSON).";
    console.error(errorMessage);
    writeToLogfile(errorMessage);
    return;
  }

  if (cleanUserInput.imdbId) {
    if (cleanUserInput.imdbId.length < 3) {
      const errorMessage = "Invalid imdbId (main.parseInputJSON).";
      console.error(errorMessage);
      writeToLogfile(errorMessage);
      return;
    } else {
      cleanUserInput.imdbId = cleanupData(cleanUserInput.imdbId);
    }
  } else {
    const errorMessage = "No imdbId provided (main.parseInputJSON).";
    console.error(errorMessage);
    writeToLogfile(errorMessage);
    return;
  }
 
  const successMessage = "Successfully parsed JSON input (main.parseInputJSON).";
  console.log(successMessage);
  writeToLogfile(successMessage);

  return cleanUserInput;
};

// Input: video file meta data
// Ouput: usable objects
const turnMetadataIntoObjects = async (metadata) => {
  try {
    const videoMetadataObjects = [];

    for (let i = 0; i < metadata.length; i++) {
      // get file extension
      const videoMetadataObjectSplit = metadata[i].filename.split(".");
      const fileType = videoMetadataObjectSplit[videoMetadataObjectSplit.length - 1];
      let isVideofile = false;
      if (fileType === "mkv" || fileType === "avi" || fileType === "mp4" || fileType === "m4v") {
        isVideofile = true;
        videoFileExtension = "." + fileType;
      }

      const cleanFilename = await cleanupFilename(metadata[i].filename, showMetadata);

      const videoMetadataObject = {
          filepath: metadata[i].filename,
          filename: cleanFilename,
          show: "",
          season: "",
          episode: "",
          title: "",
          alternateTitle: "",
          newFilename: "",
          needsFixing: false
      };

      // if file extension is not a video file, skip
      isVideofile ? videoMetadataObjects.push(videoMetadataObject) : null;
    }

    const successMessage = "Successfully parsed metadata into objects (main.turnMetadataIntoObjects).";
    console.log(successMessage);
    writeToLogfile(successMessage);

    return videoMetadataObjects;
    
  } catch (error) {
    const errorMessage = `Error parsing metadata into objects (main.turnMetadataIntoObjects).\nError: ${error}`;
    console.error(errorMessage);
    writeToLogfile(errorMessage);
  }
};

// reads the show metadata file
const readShowMetadata = () => {
  return new Promise((resolve, reject) => {
    // Read show data
    fs.readFile(showMetadataJSON, 'utf8', (err, data) => {
      if (err) {
        const errorMessage = `Error reading file (main.main (read showMetaData)).\nError: ${err}`;
        console.error(errorMessage);
        writeToLogfile(errorMessage);
        reject(err);
        return;
      }

      try {
        const showMetadataParsed = JSON.parse(data);
        showMetadata = showMetadataParsed;

        const successMessage = "Successfully read-in show metadata (main.main).";
        console.log(successMessage);
        writeToLogfile(successMessage);
        resolve();
      } catch (error) {
        const errorMessage = `Error parsing showMetadata JSON (main.main).\nError: ${error}`;
        console.error(errorMessage);
        writeToLogfile(errorMessage);
        reject(error);
      }
    });
  });
};

// reads the episode metadata file
const readEpisodeMetadata = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(episodeMetadataJSON, 'utf8', (err, data) => {
      if (err) {
        const errorMessage = `Error reading file (main.main).\nError: ${err}`;
        console.error(errorMessage);
        writeToLogfile(errorMessage);
        reject(err);
        return;
      }

      try {
        const episodeMetadataParsed = JSON.parse(data);
        seasonsMetadata = episodeMetadataParsed;

        const successMessage = "Successfully read-in seasons metadata (main.main).";
        console.log(successMessage);
        writeToLogfile(successMessage);
        resolve();
      } catch (error) {
        const errorMessage = `Error parsing episodeMetadata JSON (main.main).\nError: ${error}`;
        console.error(errorMessage);
        writeToLogfile(errorMessage);
        reject(error);
      }
    });
  });
};

// finds how many directories there are
const getSeasonDirectories = (fileDirectory) => {
  return new Promise((resolve, reject) => {
    fs.readdir(fileDirectory, (err, items) => {
      if (err) {
        const errorMessage = `Error reading directory (main.main).\nError: ${err}`;
        console.error(errorMessage);
        writeToLogfile(errorMessage);
        reject(err);
        return;
      } else {
        const seasonDirectories = [];

        items.forEach((folder) => {
          let fullPath = path.join(fileDirectory, folder);
          if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
            seasonDirectories.push(fullPath + "/");
          }
        });
        // console.log("seasonDirectories: ", seasonDirectories);

        const successMessage = `Successfully read-in season directories (main.main).`;
        console.log(successMessage);
        writeToLogfile(successMessage);

        resolve(seasonDirectories);
      }
    });
  });
};

main = async () => {
  const userInput = await parseInputJSON(inputJSON);
   /*
    {
      "imdbId": "tt0111161",
      "numberOfSeasons": 5,
      "fileDirectory": "D:\\TV Shows\\Person of Interest (2011)\\season1",
      "ffmpegDirectory": "C:\\ffmpeg\\bin",
      "type": "anime"
    }
  */

  if (!userInput) {
    const errorMessage = "Invalid user input (main.main).";
    console.error(errorMessage);
    writeToLogfile(errorMessage);
    return;
  }

  await readShowMetadata();
  await readEpisodeMetadata();

  // find amount of folders in the directory
  const seasonDirectories = await getSeasonDirectories(userInput.fileDirectory);

  if (seasonDirectories.length < 1) {
    const errorMessage = "No seasons found (main.main).";
    console.error(errorMessage);
    writeToLogfile(errorMessage);
    return;
  }
  // console.log("seasonDirectories: ", seasonDirectories);

  // loops through each season directory
  for (const seasonDirectory of seasonDirectories) {

    // replace \\ with / in directory
    const seasonDirectoryCleaned = seasonDirectory.replace(/\\/g, "/");

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
          getMetadataModule.main(seasonDirectoryCleaned, userInput.ffmpegDirectory, (err, metadata) => {
            if (err) {
              const errorMessage = `Error getting metadata (main.waitAndGetMetadata).\nError: ${err}`;
              console.error(errorMessage);
              writeToLogfile(errorMessage);
              reject(err);
              return;
            }
            resolve(metadata);
          });
        });
        const videofileMetadataObjects = processMetadata(videofileMetadata);

        const successMessage = "Successfully got metadata from video files (main.waitAndGetMetadata).";
        console.log(successMessage);
        writeToLogfile(successMessage);

        return videofileMetadataObjects;
      } catch (error) {
        const errorMessage = `Catch error getting metadata from video files (main.waitAndGetMetadata).\nError: ${error}`;
        console.error(errorMessage);
        writeToLogfile(errorMessage);
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
          // console.log("videofileMetadataObject: ", videofileMetadataObject);
          // clean before comparing
          episode.title = episode.title;
          // console.log("videofileMetadataObject.filename: ", videofileMetadataObject.filename);
          const episodeGuess = videofileMetadataObject.filename.match(/e\d+/gi);
          // console.log("episodeGuess: ", episodeGuess);
          const episodeGuessNumber = parseInt(episodeGuess[0].split("e")[1]);
          // console.log("episodeGuessNumber: ", episodeGuessNumber);
          // find directory and use that as the season number if there is no season in the filename
          const seasonGuess = videofileMetadataObject.filename.includes("s") ? videofileMetadataObject.filename.match(/s\d+/gi) : seasonDirectoryCleaned.match(/s\d+/gi);
          // console.log("seasonGuess: ", seasonGuess);
          const seasonGuessNumber = parseInt(seasonGuess[0].split("s")[1]);
          // console.log("seasonGuessNumber: ", seasonGuessNumber);
          if (videofileMetadataObject.filename.toLowerCase().includes(episode.title.toLowerCase())) {
            // show
            videofileMetadataObject.show = showMetadata.title;
            // season
            videofileMetadataObject.season = episode.seasonNumber.toString();
            // episode title
            videofileMetadataObject.title = episode.title;
            // episode number
            videofileMetadataObject.episode = episode.episodeNumber.toString();
            // episode description
            videofileMetadataObject.description = cleanupData(episode.description);
            // episode date
            videofileMetadataObject.date = episode.airDate;
            // episode filename
            videofileMetadataObject.newFilename = episode.episodeNumber < 10 ? seasonDirectoryCleaned + "E0" + videofileMetadataObject.episode + " - " + videofileMetadataObject.title + videoFileExtension : seasonDirectoryCleaned + "E" + videofileMetadataObject.episode + " - " + videofileMetadataObject.title + videoFileExtension;
            // videofileMetadataObject.newFilename = cleanupData(videofileMetadataObject.newFilename);
            episodeObjectsFinal.push(videofileMetadataObject);

          } else if (episodeGuessNumber === episode.episodeNumber && seasonGuessNumber === episode.seasonNumber) {
            // show
            videofileMetadataObject.show = showMetadata.title;
            // episode number
            videofileMetadataObject.episode = episode.episodeNumber.toString();
            // season
            videofileMetadataObject.season = episode.seasonNumber.toString();
            // episode title
            videofileMetadataObject.title = cleanupData(episode.title);
            // episode alternate title
            videofileMetadataObject.alternateTitle = cleanupData(videofileMetadataObject.filename.split("-")[1].trim());
            // remove excess characters from alternate title
            videofileMetadataObject.alternateTitle = videofileMetadataObject.alternateTitle.includes("[") ? videofileMetadataObject.alternateTitle.split("[")[0].trim() : videofileMetadataObject.alternateTitle;
            // episode description
            videofileMetadataObject.description = cleanupData(episode.description);
            // episode date
            videofileMetadataObject.date = episode.airDate;
            // new filename
            let newFilename = episode.episodeNumber < 10 ? seasonDirectoryCleaned + "E0" + videofileMetadataObject.episode + " - " + videofileMetadataObject.title : seasonDirectoryCleaned + "E" + videofileMetadataObject.episode + " - " + videofileMetadataObject.title;
            // newFilename = cleanupData(newFilename);
            // add file extension depending on whether or not there is an alternate title
            if (videofileMetadataObject.alternateTitle.length > 0 && userInput.type === "anime") {
              const alternateTitleWithoutExtension = videofileMetadataObject.alternateTitle.split(".")[0];
              videofileMetadataObject.newFilename = newFilename + ` (${alternateTitleWithoutExtension})` + videoFileExtension;
            } else {
              videofileMetadataObject.newFilename = newFilename + videoFileExtension;
            }
            videofileMetadataObject.needsFixing = true;

            episodeObjectsFinal.push(videofileMetadataObject);
          } else {
            const errorMessage = `Error setting videofileMetadataObjects (main.main line 392) ${videofileMetadataObject.filename}.`;
            // console.error(errorMessage);
            // writeToLogfile(errorMessage);
            // todo - fix this -- every loop iteration hits this. maybe do try-catch instead?
          } // end of if
      } // end of for loop
    } // end of for loop
  } // end of for loop (add episode data to episode objects)
} // end of for loop - season directories

  // write episodes to file
  writeOutputData(videofileOutputFile, episodeObjectsFinal);

  // display success message in log file
  const successMessage = `Successfully completed main.js (main.main).`;
  console.log(successMessage);
  writeToLogfile(successMessage);
};

main();
