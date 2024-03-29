/* changeMetadata.js
// -changes metadata to match episodes scraped from imdb
// -writes failed videos to JSON file
// -writes successful videos to JSON file
*/

// ---dependencies---
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
// const cliProgress = require('cli-progress');
// ---helpers---
const { writeOutputData } = require('../helpers/outputData');
const { writeToLogfile } = require('../helpers/logfile');
// ---variables---
const failedVideosOutputFile = './results/failedVideos.json';
const ffmpegDirectory = "D:/executables/ffmpeg/bin/";
const videofileObjects = JSON.parse(fs.readFileSync('./results/videofileObjects.json', 'utf8'));

const changeMetadata = async (videofileObjects, ffmpegDirectory) => {
    try {
        // Set ffmpeg path variables
        const ffmpegPath = `${ffmpegDirectory}ffmpeg.exe`;
        const ffprobePath = `${ffmpegDirectory}ffprobe.exe`;
        ffmpeg.setFfmpegPath(ffmpegPath);
        ffmpeg.setFfprobePath(ffprobePath);

        const failedVideos = [];

        let areVideofilesReady = false;
        let completedTasks = 1;

        if (!videofileObjects) {
            console.error(`No videofileObjects found\n-Location: changeMetadata.main`);
            writeToLogfile(`No videofileObjects found\n-Location: changeMetadata.main`);
            return;
        }

        // check if any video files need fixing
        for (const videofileObject of videofileObjects) {
            if (videofileObject.needsFixing === true) {
                areVideofilesReady = false;
                console.error(`Video file needs fixing\n-Location: changeMetadata.main\n-Video: ${videofileObject.filepath}`);
                writeToLogfile(`Video file needs fixing\n-Location: changeMetadata.main\n-Video: ${videofileObject.filepath}`);
                return;
            }
        }

        areVideofilesReady = true;

    // -- todo: progress bar --
    // const totalTasks = videofileObjects.length;
    // console.log("totalTasks: ", totalTasks);
    // const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    // progressBar.start(totalTasks, 0);

    for (const videofileObject of videofileObjects) {
        // console.log("videofileObject: ", videofileObject);
        try {
            await new Promise((resolve, reject) => {
                // Get metadata
                ffmpeg.ffprobe(videofileObject.filepath, (err, metadata) => {
                    if (err) {
                        console.error(`Could not get metadata\n-Location: changeMetadata.main\n-Error message: ${err}`);
                        writeToLogfile(`Could not get metadata\n-Location: changeMetadata.main\n-Error message: ${err}`);
                    return;
                    }

                    // Remove title tag
                    const metadataTags = { ...metadata.format.tags };
                    delete metadataTags.title;

                    // console.log("videofileObject.filepath: ", videofileObject.filepath);
                
                    ffmpeg(videofileObject.filepath)
                        .outputOptions([
                            '-c copy', // Copy video and audio codecs
                            // '-f mkv', // Specify the output format as MKV
                            '-f mp4', // Specify the output format as MP4
                            // '-map_metadata', '0', // Use metadata from the first input file
                            '-metadata', `show=${videofileObject.show}`,
                            '-metadata', `season_number=${videofileObject.season}`,
                            // '-metadata', `format.tags:title=${videofileObject.title}`,
                            '-metadata', `episode_sort=${videofileObject.episode}`,
                        ])
                        .save(videofileObject.newFilename)
                        .on('start', (commandLine) => {
                            const consoleMessage = `FFmpeg command: (changeMetadata.main).\n-Command: ${commandLine}`;
                            console.log(consoleMessage);
                            writeToLogfile(consoleMessage);
                        })
                        .on('stderr', (stderrLine) => {
                            const consoleMessage = `FFmpeg stderr: (changeMetadata.main).\n-Command: ${stderrLine}`;
                            console.log(consoleMessage);
                            writeToLogfile(consoleMessage);
                        })
                        .on('end', () => {
                            const consoleMessage = `Successfully added metadata. Task #: ${completedTasks}/${videofileObjects.length}`;
                            console.log(consoleMessage);
                            writeToLogfile(consoleMessage);
                            completedTasks ++;
                            // progressBar.update(completedTasks);
                            resolve();
                        })
                        .on('error', (err) => {
                            const consoleMessage = `Failed to add/change metadata.\n-Video: ${videofileObject.filepath}\n-${err}`;
                            console.error(consoleMessage);
                            writeToLogfile(consoleMessage);

                            failedVideos.push(videofileObject);
                            reject(err);
                        });
                });
            });
        } catch (err) {
            console.error(`Could not change metadata\n-Location: changeMetadata.main\n-Error message: ${err}`);
            writeToLogfile(`Could not change metadata\n-Location: changeMetadata.main\n-Error message: ${err}`);
        }
    } // end for loop

        // write failed videos to file
        if (failedVideos.length > 0) {
            writeOutputData(failedVideosOutputFile, failedVideos);
        } else {
            console.log("All videos successfully changed metadata\n-Location: changeMetadata.main");
            writeToLogfile("All videos successfully changed metadata\n-Location: changeMetadata.main");
        }
    // progressBar.stop();
    } catch (err) {
        console.error(`Could not change metadata\n-Location: changeMetadata.main\n-Error message: ${err}`);
        writeToLogfile(`Could not change metadata\n-Location: changeMetadata.main\n-Error message: ${err}`);
    }
};

changeMetadata(videofileObjects, ffmpegDirectory);