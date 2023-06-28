/* outputData.js
// -receives: outputFilePath, dataToWrite
// -writes data to JSON file
*/

// ---dependencies---
const fs = require('fs');
// ---helpers---
const { writeToLogfile } = require('./logfile');

const writeOutputData = (outputFilePath, dataToWrite) => {
      const outputDataToJSON = JSON.stringify(dataToWrite, null, 2);
      fs.writeFile(outputFilePath, outputDataToJSON, 'utf8', (err) => {
        if (err) {
          const errorMessage = `Error writing to file: ${outputFilePath}\n${err}`;
          console.error(errorMessage);
          writeToLogfile(errorMessage);
          return;
        } else {
          const successMessage = `Data written to file: ${outputFilePath}`;
          console.log(successMessage);
          writeToLogfile(successMessage);
        }
      });
};

module.exports = { writeOutputData };