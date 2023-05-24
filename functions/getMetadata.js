const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = 'D:/executables/ffmpeg-essentials_build/bin/ffmpeg.exe';
const ffprobePath = 'D:/executables/ffmpeg-essentials_build/bin/ffprobe.exe';
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const folderPath = "C:/Users/tyler/Videos/poi/";

const getVideoFilenames = (folderPath, callback) => {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error('Error reading folder:', err);
      callback(err, null);
      return;
    }

    callback(null, files);
  });
};

const getMetadata = (videoPath, callback) => {
  ffmpeg.ffprobe(videoPath, (err, metadata) => {
    if (err) {
      console.error('An error occurred: ' + err.message);
      callback(err, null);
      return;
    }
    callback(null, metadata);
    // console.log(metadata.format);
  });
};

// Combined functions
const main = (pathToVideoFiles, callback) => {
  const metadataObjects = [];
  // get video file names
  getVideoFilenames(pathToVideoFiles, (err, videoFilenames) => {
    if (err) {
      console.error('Error:', err);
      callback(err, null);
      return;
    }

    // get metadata for each video
    let count = 0;
    videoFilenames.forEach((videoFilename) => {
      const videoPath = pathToVideoFiles + videoFilename;
      getMetadata(videoPath, (err, videoMetadata) => {
        if (err) {
          console.error('Error retrieving metadata:', err);
          callback(err, null);
          return;
        }
        console.log("videoMetadata format: ", videoMetadata.format);
        // console.log("videoMetadata: ", videoMetadata);
        
        const metadataFormat = videoMetadata.format;
        metadataObjects.push(metadataFormat);

        count++;
        if (count === videoFilenames.length) {
          // All metadata retrieved
          callback(null, metadataObjects);
        }
      });
    });
  });
};

// main(folderPath);

module.exports = {
  main: main
};