/* convertScrapedEpisodes.js:
// - converts csv data to json for episodes
// - takes csv data as input
// - sorts into episode objects
// - outputs json data
*/

// ---Dependencies---
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse'); // CSV parser
const episodesOutputFilepath = "./results/episodesOutput.json";
// ---Input---
const csvFilePath = path.join(__dirname, '../../input/episodes.csv'); // Path to the CSV file
const csvEpisodeData = fs.readFileSync(csvFilePath, 'utf8'); // Read the CSV data from the file
// ---helpers---
const { writeToLogfile } = require('../../helpers/logfile');
const { writeOutputData } = require('../../helpers/outputData');
// ---Variables---
var episodeDataObjects = []; // Array to hold the episode objects
const finalEpisodeObjects = []; // Array to hold the final episode objects
const failedEpisodes = []; // Array to hold the failed episodes
const episodeTitlesAndNumbers = [];
const episodeDescriptions = [];
const episodeAirdates = [];
const episodeSeasonNumbers = [];
const episodeEpisodeNumbers = [];
const episodeTitles = [];
const failedDates = [];
// ---Functions---

/* formatDate():
// - formats the date from the input date (e.g. - "May 21, 1998") to the output date (e.g. - "05-21-1998")
*/
const formatDate = (inputDate) => {
    try {
        if (!inputDate) {
            console.error('Invalid date format:', inputDate);
            return null;
        }
        const months = {
            Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
            Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
        };
    
        const splitDate = inputDate.split(',');
    
        if (splitDate) {
            const month = splitDate[1].trim().split(' ')[0];
            let day = splitDate[1].trim().split(' ')[1];
            if (day && parseInt(day) < 10) {
                day = `0${day}`;
            }
            const year = splitDate[2].trim();
            const formattedDate = `${months[month]}-${day}-${year}`;
            return formattedDate;
        } else {
            console.error('Invalid date format:', inputDate);
            failedDates.push(inputDate);
            return null;
        }
    } catch (err) {
        console.error(`Catch - Failed to format date.\n-Location: /functions/convertScrapedEpisodes.js -> formatDate()\n-Error message: ${err}`);
        writeToLogfile(`Catch - Failed to format date.\n-Location: /functions/convertScrapedEpisodes.js -> formatDate()\n-Timestamp: ${new Date().toISOString()}\n-Error message: ${err}`);
    }
};

/* createEpisodeObjects():
// - creates the episode objects from the index of each array
*/
const createEpisodeObjects = () => {
    try {
        if (episodeTitlesAndNumbers.length === episodeDescriptions.length && episodeDescriptions.length === episodeAirdates.length) {
            for (let i = 0; i < episodeTitlesAndNumbers.length; i++) {
                const episodeObject = {
                    seasonNumber: episodeSeasonNumbers[i],
                    episodeNumber: episodeEpisodeNumbers[i],
                    title: episodeTitles[i],
                    description: episodeDescriptions[i],
                    airDate: episodeAirdates[i],
                };
                finalEpisodeObjects.push(episodeObject);
            }
        } else {
            console.error(`Failed to create episode objects.\n-Location: /functions/convertScrapedEpisodes.js -> createEpisodeObjects()\n-episodeTitlesAndNumbers.length: ${episodeTitlesAndNumbers.length}\n-episodeDescriptions.length: ${episodeDescriptions.length}\n-episodeAirdates.length: ${episodeAirdates.length}`);
            writeToLogfile(`Failed to create episode objects.\n-Location: /functions/convertScrapedEpisodes.js -> createEpisodeObjects()\n-Timestamp: ${new Date().toISOString()}\n-episodeTitlesAndNumbers.length: ${episodeTitlesAndNumbers.length}\n-episodeDescriptions.length: ${episodeDescriptions.length}\n-episodeAirdates.length: ${episodeAirdates.length}`);
        }
    } catch (err) {
        console.error(`Catch - Failed to create episode objects.\n-Location: /functions/convertScrapedEpisodes.js -> createEpisodeObjects()\n-Error message: ${err}`);
        writeToLogfile(`Catch - Failed to create episode objects.\n-Location: /functions/convertScrapedEpisodes.js -> createEpisodeObjects()\n-Timestamp: ${new Date().toISOString()}\n-Error message: ${err}`);
    }
};

/* separateEpisodeData():
// - separates the episode data into separate arrays
*/
const separateEpisodeData = (episodeObject) => {
    try {
        if (!episodeObject) {
            console.error(`episodeObject is invalid.\n-Location: /functions/convertScrapedEpisodes.js -> separateEpisodeData()\n-episodeObject: ${episodeObject}`);
            writeToLogfile(`episodeObject is invalid.\n-Location: /functions/convertScrapedEpisodes.js -> separateEpisodeData()\n-Timestamp: ${new Date().toISOString()}\n-episodeObject: ${episodeObject}`);
            return;
        }

        if (episodeObject['seasonNumberANDepisodeNumberANDtitle'] && episodeObject['seasonNumberANDepisodeNumberANDtitle'] !== "") {
            // e.g. - S6.E22 ∙ Full Circle
            episodeTitlesAndNumbers.push(episodeObject['seasonNumberANDepisodeNumberANDtitle']);
            const episodeTitleSplit = episodeObject['seasonNumberANDepisodeNumberANDtitle'].trim().split(' ∙ '); // e.g. - S6.E22
            const episodeSeasonNumber = episodeTitleSplit[0].split('.')[0].split('S')[1]; // e.g. - 6
            episodeSeasonNumbers.push(episodeSeasonNumber);
            const episodeEpisodeNumber = episodeTitleSplit[0].split('.')[1].split('E')[1]; // e.g. - 22
            episodeEpisodeNumbers.push(episodeEpisodeNumber);
            const episodeTitle = episodeTitleSplit[1].trim(); // e.g. - Full Circle
            episodeTitles.push(episodeTitle);
        }
        if (episodeObject['description'] && episodeObject['description'] !== "") {
            episodeDescriptions.push(episodeObject['description']);
        }
        if (episodeObject['airDate'] && episodeObject['airDate'] !== "") {
            episodeAirdates.push(formatDate(episodeObject['airDate']));
        }
    } catch(err) {
        failedEpisodes.push(episodeObject);
        console.error(`Catch - Failed to separate episode data.\n-Location: /functions/convertScrapedEpisodes.js -> separateEpisodeData()\n-Error message: ${err}`);
        writeToLogfile(`Catch - Failed to separate episode data.\n-Location: /functions/convertScrapedEpisodes.js -> separateEpisodeData()\n-Timestamp: ${new Date().toISOString()}\n-Error message: ${err}`);
    }
};

/* parseCsv():
// - parses the CSV data
// - sorts into episode objects
*/
const parseCsv = async (csvEpisodeData) => {
    try {
        if (!csvEpisodeData) {
            console.error(`csvEpisodeData is invalid.\n-Location: /functions/convertScrapedEpisodes.js -> parseCsv().`);
            writeToLogfile(`csvEpisodeData is invalid.\n-Location: /functions/convertScrapedEpisodes.js -> parseCsv().\n-Timestamp: ${new Date().toISOString()}`);
            return;
        }

         // Parse the CSV data
         const { data, errors } = Papa.parse(csvEpisodeData, {
            header: true,
            skipEmptyLines: true,
        });

        if (errors && errors.length > 0) {
            console.error(`CSV parsing errors:`, errors);
            return;
        }

        console.log("data: ", data);

        episodeDataObjects = data;

        // const jsonString = JSON.stringify(data, null, 2);
        // console.log("jsonString: ", jsonString);
    } catch (err) {
        console.error(`Catch - Failed to convert CSV to JSON.\n-Location: /functions/convertScrapedEpisodes.js -> parseCsv()\n-Error message: ${err}`);
        writeToLogfile(`Catch - Failed to convert CSV to JSON.\n-Location: /functions/convertScrapedEpisodes.js  -> parseCsv()\n-Timestamp: ${new Date().toISOString()}\n-Error message: ${err}`);
    }
};

const convertScrapedEpisodes = async (csvEpisodeData) => {
    try {
        await parseCsv(csvEpisodeData);
        episodeDataObjects.forEach((episodeObject) => {
            separateEpisodeData(episodeObject);
        });

        // console.log("episodeTitles: ", episodeTitles);
        // console.log("episodeSeasonNumbers: ", episodeSeasonNumbers);
        // console.log("episodeEpisodeNumbers: ", episodeEpisodeNumbers);
        // console.log("episodeDescriptions: ", episodeDescriptions);
        // console.log("episodeAirdates: ", episodeAirdates);

        createEpisodeObjects();
        console.log("finalEpisodeObjects: ", finalEpisodeObjects);

        if (finalEpisodeObjects) {
            writeOutputData(episodesOutputFilepath, finalEpisodeObjects);
        }
    } catch (err) {
        console.error(`Catch - Failed to convert CSV to JSON.\n-Location: /functions/convertScrapedEpisodes.js -> main()\n-Error message: ${err}`);
        writeToLogfile(`Catch - Failed to convert CSV to JSON.\n-Location: /functions/convertScrapedEpisodes.js -> main()\n-Timestamp: ${new Date().toISOString()}\n-Error message: ${err}`);
    }
};

module.exports = convertScrapedEpisodes(csvEpisodeData);