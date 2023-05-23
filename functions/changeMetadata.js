// changes metadata to match episodes scraped from imdb
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = 'D:/executables/ffmpeg-essentials_build/bin/ffmpeg.exe';
const ffprobePath = 'D:/executables/ffmpeg-essentials_build/bin/ffprobe.exe';
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const videofileObjects = [
    {
      filename: 'C:/Users/tyler/Videos/poi/Person Of Interest S01e01 Pilot-1.mp4',
      show: 'Person of Interest',
      season: 1,
      episode: 1,
      title: 'Pilot',
      newFilename: 'C:/Users/tyler/Videos/poi/E01 - Pilot.mp4',
      description: 'When the social security number of a young prosecutor comes up, Reese and Finch work together to figure out if their person of interest is the victim or perpetrator.',
      date: '9-22-2011'
    },
    {
      filename: 'C:/Users/tyler/Videos/poi/Person Of Interest S01e02 Ghosts-2.mp4',
      show: 'Person of Interest',
      season: 1,
      episode: 2,
      title: 'Ghosts',
      newFilename: 'C:/Users/tyler/Videos/poi/E02 - Ghosts.mp4',
      description: "Reese and Finch are given the Social Security number of a teenager killed two years ago, questioning the infallibility of the Machine; Finch flashes back to the Machine's origin, and how it was developed.",
      date: '9-29-2011'
    },
    {
      filename: 'C:/Users/tyler/Videos/poi/Person Of Interest S01e03 Mission Creep-3.mp4',
      show: 'Person of Interest',
      season: 1,
      episode: 3,
      title: 'Mission Creep',
      newFilename: 'C:/Users/tyler/Videos/poi/E03 - Mission Creep.mp4',
      description: "The latest number is an ex-soldier who's now part of a gang that specialize in robberies. Mr. Reese goes undercover, infiltrating the gang. This triggers memories of Jessica.",
      date: '10-6-2011'
    }
  ];

main = async (videofileObjects) => {
    for (const videofileObject of videofileObjects) {
        ffmpeg.ffprobe(videofileObject.filename, (err, metadata) => {
            if (err) {
                console.error('An error occurred:', err);
            return;
            }
        
            const command = ffmpeg(videofileObject.filename)
            .outputOptions('-metadata', `show=${videofileObject.show}`)
            .outputOptions('-metadata', `season=${videofileObject.season}`)
            .outputOptions('-metadata', `episode=${videofileObject.episode}`)
            .outputOptions('-metadata', `title=${videofileObject.title}`)
            .outputOptions('-metadata', `description=${videofileObject.description}`)
            .outputOptions('-metadata', `date=${videofileObject.date}`)
            .save(videofileObject.newFilename)
            .on('end', () => {
                console.log('Metadata changed successfully.');
            })
            .on('error', (err) => {
                console.error(`An error occurred on ${videofileObject.filename}`, err);
            });
        
            command.run();
        });

        // ffmpeg.rename(videofileObject.filename, videofileObject.newFilename, (err) => {
        //     if (err) {
        //       console.error(`Error renaming file ${videofileObject.filename}:`, err);
        //       return;
        //     }
          
        //     console.log(`File renamed successfully: ${videofileObject.newFilename}`);
        // });
    }
};

main(videofileObjects);