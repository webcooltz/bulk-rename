// changes metadata to match episodes scraped from imdb
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = 'D:/executables/ffmpeg-essentials_build/bin/ffmpeg.exe';
const ffprobePath = 'D:/executables/ffmpeg-essentials_build/bin/ffprobe.exe';
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);
// const cliProgress = require('cli-progress');

const videofileObjects = JSON.parse(fs.readFileSync('./results/videofileObjects.json', 'utf8'));

const main = (videofileObjects) => {
  // const totalTasks = videofileObjects.length;
  // console.log("totalTasks: ", totalTasks);
  
  // const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  // progressBar.start(totalTasks, 0);
  let completedTasks = 0;

  for (const videofileObject of videofileObjects) {
      // Get metadata
      ffmpeg.ffprobe(videofileObject.filename, (err, metadata) => {
          if (err) {
              console.error('An error occurred:', err);
          return;
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
              '-metadata', `episode_sort=${videofileObject.episode}`
          ])
          .save(videofileObject.newFilename)
          .on('end', () => {
              console.log('Metadata added successfully.');
          })
          .on('error', (err) => {
              console.error(`Error adding metadata: ${videofileObject.filename}\n`, err);
          });
      });

      completedTasks ++;
      // progressBar.update(completedTasks);
  }
  // progressBar.stop();
};

main(videofileObjects);