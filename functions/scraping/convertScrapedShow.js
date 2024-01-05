/* convertScrapedShow.js:
// - converts csv data to json for show info
// - takes csv data as input
// - sorts into show info
// - outputs json data to file
*/

// ---Dependencies---
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse'); // CSV parser
const showOutputFilepath = "./results/showOutput.json";
// ---Input---
const csvFilePath = path.join(__dirname, '../../input/show-info.csv'); // Path to the CSV file
const csvShowData = fs.readFileSync(csvFilePath, 'utf8'); // Read the CSV data from the file
// ---helpers---
const { writeToLogfile } = require('../../helpers/logfile');
const { writeOutputData } = require('../../helpers/outputData');
// ---Variables---
var showDataObject; // Array to hold the episode objects
// ---Functions---

/* parseCsv():
// - parses the CSV data
// - formats to show object
*/
const parseCsv = async (csvShowData) => {
    try {
        if (!csvShowData) {
            console.error(`csvShowData is invalid.\n-Location: /functions/convertScrapedShow.js -> parseCsv().`);
            writeToLogfile(`csvShowData is invalid.\n-Location: /functions/convertScrapedShow.js -> parseCsv().\n-Timestamp: ${new Date().toISOString()}`);
            return;
        }

         // Parse the CSV data
         const { data, errors } = Papa.parse(csvShowData, {
            header: true,
            skipEmptyLines: true,
        });

        if (errors && errors.length > 0) {
            console.error(`CSV parsing errors:`, errors);
            return;
        }

        const formattedShowObject = {
            title: data[0].title.trim(),
            description: data[0].description.trim(),
            showStart: data[0].yearsRan.split('–')[0].trim(),
            avgEpisodeLength: data[0].avgEpisodeLength.split('m')[0].trim(),
            ageRating: data[0].ageRating.trim()
        };

        showDataObject = formattedShowObject;
    } catch (err) {
        console.error(`Catch - Failed to convert CSV to JSON.\n-Location: /functions/convertScrapedShow.js -> parseCsv()\n-Error message: ${err}`);
        writeToLogfile(`Catch - Failed to convert CSV to JSON.\n-Location: /functions/convertScrapedShow.js  -> parseCsv()\n-Timestamp: ${new Date().toISOString()}\n-Error message: ${err}`);
    }
};

const convertScrapedShow = async (csvShowData) => {
    try {
        await parseCsv(csvShowData);

        if (showDataObject) {
            console.log("showDataObject: ", showDataObject);
            writeOutputData(showOutputFilepath, showDataObject);
        }
    } catch (err) {
        console.error(`Catch - Failed to convert CSV to JSON.\n-Location: /functions/convertScrapedShow.js -> main()\n-Error message: ${err}`);
        writeToLogfile(`Catch - Failed to convert CSV to JSON.\n-Location: /functions/convertScrapedShow.js -> main()\n-Timestamp: ${new Date().toISOString()}\n-Error message: ${err}`);
    }
};

module.exports = convertScrapedShow(csvShowData);