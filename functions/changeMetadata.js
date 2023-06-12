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

const main = async (videofileObjects, ffmpegDirectory) => {
    const ffmpegPath = `${ffmpegDirectory}ffmpeg.exe`;
    const ffprobePath = `${ffmpegDirectory}ffprobe.exe`;
    ffmpeg.setFfmpegPath(ffmpegPath);
    ffmpeg.setFfprobePath(ffprobePath);

    const failedVideos = [];

    let areVideofilesReady = false;
    let completedTasks = 1;

    if (!videofileObjects) {
        const errorMessage = `No videofileObjects found (changeMetadata.main).`;
        console.error(errorMessage);
        logFileModule.writeToLogfile(errorMessage);
        return;
    }

    // check if any video files need fixing
    for (const videofileObject of videofileObjects) {
        if (videofileObject.needsFixing === true) {
            const errorMessage = `Video needs fixing: ${videofileObject.filepath}`;
            console.error(errorMessage);
            logFileModule.writeToLogfile(errorMessage);
            
            areVideofilesReady = false;
            return;
        }
    }

    areVideofilesReady = true;

  // const totalTasks = videofileObjects.length;
  // console.log("totalTasks: ", totalTasks);
  
  // const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  // progressBar.start(totalTasks, 0);

  for (const videofileObject of videofileObjects) {
    try {
        await new Promise((resolve, reject) => {
            // Get metadata
            ffmpeg.ffprobe(videofileObject.filepath, (err, metadata) => {
                if (err) {
                    const errorMessage = `Error occurred while reading metadata (changeMetadata.main).\nError: ${err}`;
                    console.error(errorMessage);
                    logFileModule.writeToLogfile(errorMessage);
                return;
                }

                // Remove title tag
                const metadataTags = { ...metadata.format.tags };
                delete metadataTags.title;
            
                ffmpeg(videofileObject.filepath)
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
                        const consoleMessage = `Failed to add/change metadata.\n-Video: ${videofileObject.filepath}\n-Error: ${err}`;
                        console.log(consoleMessage);
                        logFileModule.writeToLogfile(consoleMessage);

                        failedVideos.push(videofileObject);
                        reject(err);
                    });
            });
        });
    } catch (err) {
        const consoleMessage = `Catch - Failed to add/change metadata.\n-Video: ${videofileObjects.filepath}\n-Error: ${err}`;
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