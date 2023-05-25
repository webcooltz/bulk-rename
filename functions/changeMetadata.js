// changes metadata to match episodes scraped from imdb
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = 'D:/executables/ffmpeg-essentials_build/bin/ffmpeg.exe';
const ffprobePath = 'D:/executables/ffmpeg-essentials_build/bin/ffprobe.exe';
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);
// const cliProgress = require('cli-progress');

const writeOutputDataModule = require('../helpers/writeOutputData');

const videofileObjects = JSON.parse(fs.readFileSync('./results/videofileObjects.json', 'utf8'));
const failedVideofileObjects = JSON.parse(fs.readFileSync('./results/failedVideos.json', 'utf8'));

const main = async (videofileObjects) => {
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
                    console.log("videofileObject.filename: ", videofileObject.filename);
                    console.log("videofileObject.newFilename: ", videofileObject.newFilename);
                }
            
                ffmpeg(videofileObject.filename)
                    .outputOptions([
                        // Copy video/audio codecs - Prevents re-encoding
                        '-c:v copy', 
                        '-c:a copy',
                        // Add metadata tags
                        '-metadata', `show=${videofileObject.show}`,
                        '-metadata', `season_number=${videofileObject.season}`,
                        '-metadata', `title=${videofileObject.title}`,
                        '-metadata', `episode_sort=${videofileObject.episode}`,
                        // '-f mp4' // Specify the output format as MP4
                    ])
                    .save(videofileObject.newFilename + '.mp4')
                    .on('start', (commandLine) => {
                        console.log('FFmpeg command:', commandLine);
                    })
                    .on('stderr', (stderrLine) => {
                        console.log('FFmpeg stderr:', stderrLine);
                    })
                    .on('end', () => {
                        console.log('Metadata added successfully.');
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
    completedTasks ++;
    // progressBar.update(completedTasks);
    }

    // write failed videos to file
    const failedVideosOutputFile = './results/failedVideos.json';
    writeOutputDataModule.main(failedVideosOutputFile, failedVideos);
  // progressBar.stop();
};

main(videofileObjects);