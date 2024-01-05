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
const inputJSON = "./input/input.json";
const showMetadataJSON = "./results/showOutput.json";
const episodeMetadataJSON = "./results/scrapedEpisodes.json";
const videofileOutputFilepath = "./results/videofileObjects.json";
// ---variables---
const finalEpisodeObjects = [];

let showMetadata;
let seasonsMetadata;
let videoFileExtension;

/* parseInputJSON():
// -parses the input JSON
// -@input: input JSON
// -@output: parsed input JSON
*/
const parseInputJSON = (inputJSON) => {
  try {
    if (!inputJSON) {
      console.error("No input JSON provided\n-Location: main.js -> parseInputJSON()");
      writeToLogfile(`No input JSON provided\n-Location: main.js -> parseInputJSON()\n-Timestamp: ${new Date().toISOString()}`);
      return;
    }
    const inputJSONParsed = JSON.parse(fs.readFileSync(inputJSON, 'utf8'));
    let cleanUserInput;

    if (inputJSONParsed) {
      cleanUserInput = inputJSONParsed;
    } else {
      console.error(`Invalid input JSON (main.parseInputJSON).\n-Location: main.js -> parseInputJSON()`);
      writeToLogfile(`Invalid input JSON (main.parseInputJSON).\n-Location: main.js -> parseInputJSON()\n-Timestamp: ${new Date().toISOString()}`);
      return;
    }

    if (cleanUserInput.fileDirectory) {
      if (cleanUserInput.fileDirectory.length < 3) {
        console.error(`Invalid file directory (main.parseInputJSON).\n-Location: main.js -> parseInputJSON()`);
        writeToLogfile(`Invalid file directory (main.parseInputJSON).\n-Location: main.js -> parseInputJSON()\n-Timestamp: ${new Date().toISOString()}\n-Error message: ${err}`);
        return;
      } else {
        cleanUserInput.fileDirectory = cleanupFilepath(cleanUserInput.fileDirectory);
      }
    } else {
      console.error(`No file directory provided\n-Location: main.js -> parseInputJSON()`);
      writeToLogfile(`No file directory provided\n-Location: main.js -> parseInputJSON()\n-Timestamp: ${new Date().toISOString()}\n-Error message: ${err}`);
      return;
    }

    if (cleanUserInput.ffmpegDirectory) {
      if (cleanUserInput.ffmpegDirectory.length < 3) {
        console.error(`Invalid ffmpeg directory (main.parseInputJSON).\n-Location: main.js -> parseInputJSON()`);
        writeToLogfile(`Invalid ffmpeg directory (main.parseInputJSON).\n-Location: main.js -> parseInputJSON()\n-Timestamp: ${new Date().toISOString()}`);
        return;
      } else {
        cleanUserInput.ffmpegDirectory = cleanupFilepath(cleanUserInput.ffmpegDirectory);
      }
    } else {
      console.error(`No ffmpeg directory provided\n-Location: main.js -> parseInputJSON()`);
      writeToLogfile(`No ffmpeg directory provided\n-Location: main.js -> parseInputJSON()\n-Timestamp: ${new Date().toISOString()}\n-Error message: ${err}`);
      return;
    }

    if (cleanUserInput.imdbId) {
      if (cleanUserInput.imdbId.length < 3) {
        console.error(`Invalid imdbId (main.parseInputJSON).\n-Location: main.js -> parseInputJSON()`);
        writeToLogfile(`Invalid imdbId (main.parseInputJSON).\n-Location: main.js -> parseInputJSON()\n-Timestamp: ${new Date().toISOString()}`);
        return;
      } else {
        cleanUserInput.imdbId = cleanupData(cleanUserInput.imdbId);
      }
    } else {
      console.error(`No imdbId provided\n-Location: main.js -> parseInputJSON()`);
      writeToLogfile(`No imdbId provided\n-Location: main.js -> parseInputJSON()\n-Timestamp: ${new Date().toISOString()}`);
      return;
    }
  
    console.log("Successfully parsed input JSON\n-Location: main.js -> parseInputJSON()");
    writeToLogfile(`Successfully parsed input JSON\n-Location: main.js -> parseInputJSON()\n-Timestamp: ${new Date().toISOString()}`);
    return cleanUserInput;
  } catch(err) {
    console.error(`Error parsing JSON input.\n-Location: main.js -> parseInputJSON()\nError message: ${err}`);
    writeToLogfile(`Error parsing JSON input.\n-Location: main.js -> parseInputJSON()\n-Timestamp: ${new Date().toISOString()}\n-Error message: ${err}`);
  }
};

/* turnMetadataIntoObjects():
// -turns metadata into objects
// -@input: metadata from video files
// -@output: usable video/episode objects
*/
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
    console.log("Successfully turned metadata into objects\n-Location: main.js -> turnMetadataIntoObjects()");
    writeToLogfile(`Successfully turned metadata into objects\n-Location: main.js -> turnMetadataIntoObjects()\n-Timestamp: ${new Date().toISOString()}`);
    return videoMetadataObjects;
  } catch (err) {
    console.error(`Error parsing metadata into objects.\n-Location: main.js -> turnMetadataIntoObjects()\nError message: ${err}`);
    writeToLogfile(`Error parsing metadata into objects.\n-Location: main.js -> turnMetadataIntoObjects()\n-Timestamp: ${new Date().toISOString()}\n-Error message: ${err}`);
  }
};

/* readShowMetadata():
// -reads the show metadata file
// -@input: none
// -@output: none
*/
const readShowMetadata = () => {
  return new Promise((resolve, reject) => {
    // Read show data
    fs.readFile(showMetadataJSON, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading file (main.main).\n-Location: main.js -> readShowMetadata()\nError message: ${err}`);
        writeToLogfile(`Error reading file (main.main).\n-Location: main.js -> readShowMetadata()\n-Timestamp: ${new Date().toISOString()}\n-Error message: ${err}`);
        reject(err);
        return;
      }

      try {
        const showMetadataParsed = JSON.parse(data);
        showMetadata = showMetadataParsed;

        console.log("Successfully read-in show metadata\n-Location: main.js -> readShowMetadata()");
        writeToLogfile(`Successfully read-in show metadata (main.main).\n-Location: main.js -> readShowMetadata()\n-Timestamp: ${new Date().toISOString()}`);
        resolve();
      } catch (err) {
        console.error(`Error parsing showMetadata JSON (main.main).\n-Location: main.js -> readShowMetadata()\nError message: ${err}`);
        writeToLogfile(`Error parsing showMetadata JSON (main.main).\n-Location: main.js -> readShowMetadata()\n-Timestamp: ${new Date().toISOString()}\n-Error message: ${err}`);
        reject(err);
      }
    });
  });
};

/* readEpisodeMetadata():
// - reads the episode metadata file
// - @input: none
// - @output: none
*/
const readEpisodeMetadata = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(episodeMetadataJSON, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading file (main.main).\n-Location: main.js -> readEpisodeMetadata()\nError message: ${err}`);
        writeToLogfile(`Error reading file (main.main).\n-Location: main.js -> readEpisodeMetadata()\n-Timestamp: ${new Date().toISOString()}\n-Error message: ${err}`);
        reject(err);
        return;
      }

      try {
        const episodeMetadataParsed = JSON.parse(data);
        seasonsMetadata = episodeMetadataParsed;

        console.log("Successfully read-in episode metadata\n-Location: main.js -> readEpisodeMetadata()");
        writeToLogfile(`Successfully read-in episode metadata\n-Location: main.js -> readEpisodeMetadata()\n-Timestamp: ${new Date().toISOString()}`);
        resolve();
      } catch (err) {
        console.error(`Error parsing episodeMetadata JSON.\n-Location: main.js -> readEpisodeMetadata()\nError message: ${err}`);
        writeToLogfile(`Error parsing episodeMetadata JSON.\n-Location: main.js -> readEpisodeMetadata()\n-Timestamp: ${new Date().toISOString()}\n-Error message: ${err}`);
        reject(err);
      }
    });
  });
};

/* getSeasonDirectories():
// - gets the season directories
// - @input: file directory
// - @output: season directories
*/
const getSeasonDirectories = (fileDirectory) => {
  return new Promise((resolve, reject) => {
    fs.readdir(fileDirectory, (err, items) => {
      if (err) {
        console.error(`Error reading season folder.\n-Location: main.js -> getSeasonDirectories()\nError message: ${err}`);
        writeToLogfile(`Error reading season folder.\n-Location: main.js\n-Timestamp: ${new Date().toISOString()}\n-Error message: ${err}`);
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

        console.log("Successfully got season directories\n-Location: main.js -> getSeasonDirectories()");
        writeToLogfile(`Successfully got season directories\n-Location: main.js -> getSeasonDirectories()\n-Timestamp: ${new Date().toISOString()}`);
        resolve(seasonDirectories);
      }
    });
  });
};

/* main():
// -main function
// -@input: none
// -@output: none
// -Calls the following functions:
// --parseInputJSON()
// --readShowMetadata()
// --readEpisodeMetadata()
// --getSeasonDirectories()
// --processMetadata()
// --waitAndGetMetadata()
// --turnMetadataIntoObjects()
// --writeOutputData()
*/
const main = async () => {
  try {
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
      console.error(`Invalid input JSON (main.main).\n-Location: main.js -> main()`);
      writeToLogfile(`Invalid input JSON (main.main).\n-Location: main.js -> main()\n-Timestamp: ${new Date().toISOString()}`);
      return;
    }

    await readShowMetadata();
    await readEpisodeMetadata();

    // find amount of folders in the directory
    const seasonDirectories = await getSeasonDirectories(userInput.fileDirectory);

    if (seasonDirectories.length < 1) {
      console.error(`No season directories found\n-Location: main.js -> main()`);
      writeToLogfile(`No season directories found\n-Location: main.js -> main()\n-Timestamp: ${new Date().toISOString()}`);
      return;
    }
    // console.log("seasonDirectories: ", seasonDirectories);

    // loops through each season directory
    for (const seasonDirectory of seasonDirectories) {

      // replace \\ with / in directory
      const seasonDirectoryCleaned = seasonDirectory.replace(/\\/g, "/");

      /* processMetadata():
      // -Process metadata from video files
      // -@input: metadata from video files
      // -@output: usable video/episode objects
      */
      const processMetadata = (metadata) => {
        const videoMetadataObjects = turnMetadataIntoObjects(metadata);
        return videoMetadataObjects;
      };
      
      /* waitAndGetMetadata():
      // - waits for metadata to be retrieved
      // - gets metadata from video files
      // - @input: season directory
      // - @output: usable video/episode objects
      */
      const waitAndGetMetadata = async () => {
        try {
          const videofileMetadata = await new Promise((resolve, reject) => {
            getMetadataModule.main(seasonDirectoryCleaned, userInput.ffmpegDirectory, (err, metadata) => {
              if (err) {
                console.error(`Error getting metadata from video files (main.waitAndGetMetadata).\nError: ${err}`);
                writeToLogfile(`Error getting metadata from video files (main.waitAndGetMetadata).\nTimestamp: ${new Date().toISOString()}\nError: ${err}`);
                reject(err);
                return;
              }
              resolve(metadata);
            });
          });
          const videofileMetadataObjects = processMetadata(videofileMetadata);

          console.log("Successfully got metadata from video files\n-Location: main.js -> waitAndGetMetadata()");
          writeToLogfile(`Successfully got metadata from video files\n-Location: main.js -> waitAndGetMetadata()\n-Timestamp: ${new Date().toISOString()}`);
          return videofileMetadataObjects;
        } catch (err) {
          console.error(`Catch error getting metadata from video files\n-Location: main.js -> waitAndGetMetadata()\n-Error message: ${err}`);
          writeToLogfile(`Catch error getting metadata from video files\n-Location: main.js -> waitAndGetMetadata()\n-Timestamp: ${new Date().toISOString()}\n-Error message: ${err}`);
        }
      };
        
      const videofileMetadataObjects = await waitAndGetMetadata();
      // console.log("videofileMetadataObjects: ", videofileMetadataObjects);
      /* Example of videofileMetadataObjects: (not sure if broken)
        {
          filepath: 'C:/Users/Admin/Downloads/Stargate SG-1 (1997)/season6/Stargate.SG-1.S06E22.720p.BluRay.x264-BORDURE.mkv',
          filename: 's06e19 - mkv',
          show: '',
          season: '',
          episode: '',
          title: '',
          alternateTitle: '',
          newFilename: '',
          needsFixing: false
        }
      */
      // Add metadata to episode objects
      // -search for episode name from episodeMetadata, compare with videofileMetadataObject.filename
      // -if match, add episode number, season number, episode title, episode description, episode date
      // -else - finds the episode number and matches that
      for (let videofileMetadataObject of videofileMetadataObjects) {
        console.log("videofileMetadataObject: ", videofileMetadataObject);
        for (const season of seasonsMetadata) {
          // console.log("season: ", season);
          for (const episode of season) {
            // console.log("episode: ", episode);
            // clean before comparing
            // episode.title = episode.title;
            // console.log("videofileMetadataObject.filename: ", videofileMetadataObject.filename);
            const episodeGuess = videofileMetadataObject.filename.match(/e\d+/gi);
            // console.log("episodeGuess: ", episodeGuess);
            const episodeGuessNumber = parseInt(episodeGuess[0].split("e")[1]);
            // console.log("episodeGuessNumber: ", episodeGuessNumber);
            // find directory and use that as the season number if there is no season in the filename
            const seasonGuess = videofileMetadataObject.filename.includes("s") ? videofileMetadataObject.filename.match(/s\d+/gi) : seasonDirectoryCleaned.match(/s\d+/gi);
            // console.log("seasonGuess: ", seasonGuess);
            const seasonGuessNumber = parseInt(seasonGuess[0].split("s")[1]);
            // turn into int just in case
            episode.episodeNumber = parseInt(episode.episodeNumber);
            episode.seasonNumber = parseInt(episode.seasonNumber);
            // console.log("seasonGuessNumber: ", seasonGuessNumber);
            // console.log("episodeGuessNumber: ", episodeGuessNumber);
            // console.log("episode.episodeNumber: ", episode.episodeNumber);
            // console.log("episode.season: ", episode.seasonNumber);
            if (videofileMetadataObject.filename.toLowerCase().includes(episode.title.toLowerCase())) {
              // console.log("includes");
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
              finalEpisodeObjects.push(videofileMetadataObject);

            } else if (episodeGuessNumber === episode.episodeNumber && seasonGuessNumber === episode.seasonNumber) {
              // console.log("includes (2)");
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

              finalEpisodeObjects.push(videofileMetadataObject);
            } else {
              console.log("excludes (3)");
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
    writeOutputData(videofileOutputFilepath, finalEpisodeObjects);

    // display success message in log file
    console.log("Successfully wrote output data to file\n-Location: main.js -> main()");
    writeToLogfile(`Successfully wrote output data to file\n-Location: main.js -> main()\n-Timestamp: ${new Date().toISOString()}`);
  } catch (err) {
    console.error(`Error in main.js (main.main).\nError: ${err}`);
    writeToLogfile(`Error in main.js (main.main).\nTimestamp: ${new Date().toISOString()}\nError: ${err}`);
  }
};

main();
