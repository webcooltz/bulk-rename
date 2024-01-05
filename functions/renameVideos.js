/* renameVideos.js
// -renames videos to match episodes scraped from imdb
// -writes failed videos to JSON file
// -writes successful videos to JSON file
*/

//---Dependencies---
const fs = require('fs');
//---Input---
const videofileObjects = JSON.parse(fs.readFileSync('./results/videofileObjects.json', 'utf8'));
// const failedVideosOutputFile = './results/failedVideos.json';
//---Helpers---
const { writeToLogfile } = require('../helpers/logfile');
// const { writeOutputData } = require('../helpers/outputData');
//---Variables---
// const failedVideos = [];

const renameVideos = (videofileObjects) => {
    try {
        for (const videofileObject of videofileObjects) {
            const oldPath = videofileObject.filepath;
            const newPath = videofileObject.newFilename;

            fs.renameSync(oldPath, newPath);

            console.log(`Successfully renamed file: ${oldPath} to ${newPath}`);
            writeToLogfile(`Successfully renamed file: ${oldPath} to ${newPath}`);
        }

        console.log("All files successfully renamed");
        writeToLogfile("All files successfully renamed");

        // writeOutputData(failedVideos, failedVideosOutputFile);
    } catch (err) {
        console.error(`Could not rename files\n-Location: renameVideos()\n-Error message: ${err}`);
        writeToLogfile(`Could not rename files\n-Location: renameVideos()\n-Error message: ${err}`);
        // failedVideos.push(videofileObjects);
    }
};

renameVideos(videofileObjects);
