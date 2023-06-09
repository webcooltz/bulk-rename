// changes metadata to match episodes scraped from imdb

// ---dependencies---
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
// const cliProgress = require('cli-progress');

// ---helpers---
const outputDataModule = require('../helpers/writeOutputData');
const logFileModule = require('../helpers/writeToLogfile');

// ---variables---
const failedVideosOutputFile = './results/failedVideos.json';
const ffmpegDirectory = "D:/executables/ffmpeg/bin/";
const videofileObjects = JSON.parse(fs.readFileSync('./results/videofileObjects.json', 'utf8'));
// const failedVideofileObjects = JSON.parse(fs.readFileSync('./results/failedVideos.json', 'utf8'));
// const poiFailedVideoObjects = JSON.parse(fs.readFileSync('./results/poiFailedVideosMP4.json', 'utf8'));

const main = async (videofileObjects, ffmpegDirectory) => {
    const ffmpegPath = `${ffmpegDirectory}ffmpeg.exe`;
    const ffprobePath = `${ffmpegDirectory}ffprobe.exe`;
    ffmpeg.setFfmpegPath(ffmpegPath);
    ffmpeg.setFfprobePath(ffprobePath);

    const failedVideos = [];
  // const totalTasks = videofileObjects.length;
  // console.log("totalTasks: ", totalTasks);
  
  // const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  // progressBar.start(totalTasks, 0);
  let completedTasks = 1;

  for (const videofileObject of videofileObjects) {
    try {
        await new Promise((resolve, reject) => {
            // Get metadata
            ffmpeg.ffprobe(videofileObject.filename, (err, metadata) => {
                if (err) {
                    const errorMessage = `Error occurred while reading metadata (changeMetadata.main).\nError: ${err}`;
                    console.error(errorMessage);
                    logFileModule.writeToLogfile(errorMessage);
                return;
                }

                // Remove title tag
                const metadataTags = { ...metadata.format.tags };
                delete metadataTags.title;
            
                ffmpeg(videofileObject.filename)
                    .outputOptions([
                        '-c copy', // Copy video and audio codecs
                        // '-f mkv', // Specify the output format as MKV
                        '-metadata', `show=${videofileObject.show}`,
                        '-metadata', `season_number=${videofileObject.season}`,
                        // '-metadata', `format.tags:title=${videofileObject.title}`,
                        '-metadata', `episode_sort=${videofileObject.episode}`,
                    ])
                    .save(videofileObject.newFilename)
                    .on('start', (commandLine) => {
                        const consoleMessage = `FFmpeg command: (changeMetadata.main).\n-Command: ${commandLine}`;
                        console.log(consoleMessage);
                        logFileModule.writeToLogfile(consoleMessage);
                    })
                    .on('stderr', (stderrLine) => {
                        const consoleMessage = `FFmpeg stderr: (changeMetadata.main).\n-Command: ${stderrLine}`;
                        console.log(consoleMessage);
                        logFileModule.writeToLogfile(consoleMessage);
                    })
                    .on('end', () => {
                        const consoleMessage = `Successfully added metadata. Task #: ${completedTasks}/${videofileObjects.length}`;
                        console.log(consoleMessage);
                        logFileModule.writeToLogfile(consoleMessage);
                        completedTasks ++;
                        // progressBar.update(completedTasks);
                        resolve();
                    })
                    .on('error', (err) => {
                        const consoleMessage = `Failed to add/change metadata.\n-Video: ${videofileObjects.filename}\n-Error: ${err}`;
                        console.log(consoleMessage);
                        logFileModule.writeToLogfile(consoleMessage);

                        failedVideos.push(videofileObject);
                        reject(err);
                    });
            });
        });
    } catch (err) {
        const consoleMessage = `Catch - Failed to add/change metadata.\n-Video: ${videofileObjects.filename}\n-Error: ${err}`;
        console.log(consoleMessage);
        logFileModule.writeToLogfile(consoleMessage);
    }
} // end for loop

    // write failed videos to file
    if (failedVideos.length > 0) {
        outputDataModule.writeOutputData(failedVideosOutputFile, failedVideos);
    } else {
        const successMessage = `All videos processed successfully (changeMetadata.main).`;
        console.log(successMessage);
        logFileModule.writeToLogfile(successMessage);
    }
  // progressBar.stop();
};

main(videofileObjects, ffmpegDirectory);