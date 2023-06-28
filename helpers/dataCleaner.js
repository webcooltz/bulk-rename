/* dataCleaner.js
// -cleans strings
// -cleans filepaths
// -cleans filenames
*/

// --- helpers ---
const { writeToLogfile } =  require("./logfile");

const characters = {
    "–": "-", // en dash
    "…": "...", // ellipsis
    "—": "-", // em dash
    "&nbsp;": " ", // non-breaking space
    // "&": "and", // ampersand
    "“": '"', // left double quote
    "”": '"', // right double quote
    "‘": "'", // left single quote
    "’": "'", // right single quote
    " ": " ", // non-breaking space
    "Π": "pi", // pi
    // "'": "", // replace in titles
    ":": "-", // colon
};

const cleanupData = (inputData) => {
    if (!inputData) {
        // console.log("Failed to clean data. dataCleaner.js - dataCleaner() - inputData is null or undefined");
        writeToLogfile("Failed to clean data. dataCleaner.js - dataCleaner() - inputData is null or undefined");
        return inputData;
    } else {
        // console.log(inputData);
        let cleanedData = inputData;

        // removes "bad" characters
        for (const [badChar, goodChar] of Object.entries(characters)) {
            const regex = new RegExp(badChar, "g");
            cleanedData = cleanedData.replace(regex, goodChar);
        }

        // removes footnotes if footnotes are present
        cleanedData = cleanedData.replace(/\[([A-Z])\](.*?)\[[^\/\]]*\]/g, "");

        return cleanedData.trim();
    }
};

/* cleans filepath
// -replaces backslashes with forward slashes
// -adds a trailing slash if it doesn't exist
*/
const cleanupFilepath = (filepath) => {
    if (filepath.includes("\\")) {
        filepath = filepath.replace(/\\/g, "/");
    }
    if (filepath[filepath.length - 1] !== "/") {
        filepath += "/";
    }

    const successMessage = "Successfully cleaned file paths (main.cleanFilepath).";
    console.log(successMessage);
    writeToLogfile(successMessage);

    return filepath;
};

/* cleans up filename
// -turn periods to spaces in filenames
*/
const cleanupFilename = (filename, showMetadata) => {
  // console.log("filename: ", filename);
  // console.log("showMetadata: ", showMetadata);

  if (!filename) {
    const errorMessage = "No filename provided (main.cleanupFilename).";
    console.error(errorMessage);
    writeToLogfile(errorMessage);
    return;
  }

  try {
    const resolutions = ["1080p", "720p", "480p", "360p"];
    const videoFilename = filename.split("/")[filename.split("/").length - 1];
    let newFilename = videoFilename.toLowerCase();

    // if filename includes resolution, remove it
    for (let i = 0; i < resolutions.length; i++) {
      if (newFilename.includes(resolutions[i])) {
        newFilename = newFilename.split(resolutions[i])[0];
      }
    }

    // if showname is included in filename, remove it
    if (newFilename.includes(showMetadata.title.toLowerCase())) {
      newFilename = newFilename.split(showMetadata.title.toLowerCase())[1];
    }

    // if bluray or brrip is included in filename, remove it
    if (newFilename.includes("bluray")) {
      newFilename = newFilename.split("bluray")[0];
    }
    if (newFilename.includes("brrip")) {
      newFilename = newFilename.split("brrip")[0];
    }

    // if there are any periods, turn them into spaces
    newFilename = newFilename.replace(/\./g, " ");

    // add a dash after episode number
    newFilename = newFilename.replace(/e(\d+)/i, "e$1 -");
  
    const successMessage = "Successfully cleaned up filename (main.cleanupFilename).";
    console.log(successMessage);
    writeToLogfile(successMessage);

    return newFilename;
  } catch(error) {
    const errorMessage = `Error cleaning up filename: ${filename} - (main.cleanupFilename)\n${error}`;
    console.error(errorMessage);
    writeToLogfile(errorMessage);
    return;
  }
};

module.exports = { cleanupData, cleanupFilepath, cleanupFilename };
