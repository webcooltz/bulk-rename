// ---dependencies---
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

// ---variables for testing---
const fileDirectory = "C:/Users/Admin/Downloads/Stargate SG-1 (1997)/season6";
const ffmpegDirectory = "D:/executables/ffmpeg/bin/";

const getVideoFilenames = (fileDirectory, callback) => {
  fs.readdir(fileDirectory, (err, files) => {
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
  });
};

// Combined functions
const main = (pathToVideoFiles, ffmpegDirectory) => {
  const ffmpegPath = `${ffmpegDirectory}ffmpeg.exe`;
  const ffprobePath = `${ffmpegDirectory}ffprobe.exe`;
  ffmpeg.setFfmpegPath(ffmpegPath);
  ffmpeg.setFfprobePath(ffprobePath);

  let count = 0;
  const metadataObjects = [];

  // get video file names
  getVideoFilenames(pathToVideoFiles, (err, videoFilenames) => {
    if (err) {
      console.error('Error:', err);
      return;
    }

    // get metadata for each video
    videoFilenames.forEach((videoFilename) => {
      const videoPath = pathToVideoFiles + '/' + videoFilename;
      getMetadata(videoPath, (err, videoMetadata) => {
        if (err) {
          console.error('Error retrieving metadata:', err);
          return;
        }

        const metadataFormat = videoMetadata.format;
        metadataObjects.push(metadataFormat);

        count++;
        if (count === videoFilenames.length) {
          // All metadata retrieved
          console.log("metadataObjects: ", metadataObjects);
        }
      });
    });
  });
};

main(fileDirectory, ffmpegDirectory);
