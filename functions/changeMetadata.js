// changes metadata to match episodes scraped from imdb

// ---dependencies---
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
// const cliProgress = require('cli-progress');

// ---helpers---
const writeOutputDataModule = require('../helpers/writeOutputData');

// ---variables---
const failedVideosOutputFile = './results/failedVideos.json';
const ffmpegDirectory = "D:/executables/ffmpeg/bin/";
const videofileObjects = JSON.parse(fs.readFileSync('./results/videofileObjects.json', 'utf8'));
const failedVideofileObjects = JSON.parse(fs.readFileSync('./results/failedVideos.json', 'utf8'));
const poiFailedVideoObjects = JSON.parse(fs.readFileSync('./results/poiFailedVideosMP4.json', 'utf8'));

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
  let completedTasks = 0;

  for (const videofileObject of videofileObjects) {
    try {
        await new Promise((resolve, reject) => {
            // Get metadata
            ffmpeg.ffprobe(videofileObject.filename, (err, metadata) => {
                if (err) {
                    console.error('An error occurred:', err);
                return;
                } else {
                    // console.log("metadata: ", metadata);
                    // console.log("videofileObject: ", videofileObject);
                    // console.log("videofileObject.filename: ", videofileObject.filename);
                    console.log("videofileObject.title: ", videofileObject.title);
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
                        console.log('FFmpeg command:', commandLine);
                    })
                    .on('stderr', (stderrLine) => {
                        console.log('FFmpeg stderr:', stderrLine);
                    })
                    .on('end', () => {
                        console.log(`Metadata added successfully. Task #: ${completedTasks}/${videofileObjects.length}`);
                        completedTasks ++;
                        resolve();
                    })
                    .on('error', (err) => {
                        failedVideos.push(videofileObject);
                        reject(err);
                    });
            });
        });
    } catch (err) {
        console.error(`Error adding metadata:\n ${videofileObject.filename}\n`, err);
        console.error("Error (catch): ", err);
    }
    // completedTasks ++;
    // progressBar.update(completedTasks);
    }

    // write failed videos to file
    if (failedVideos.length > 0) {
        writeOutputDataModule.main(failedVideosOutputFile, failedVideos);
    } else {
        console.log("All videos processed successfully.");
    }
  // progressBar.stop();
};

main(videofileObjects, ffmpegDirectory);