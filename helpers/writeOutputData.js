const fs = require('fs');

// ---helper functions---
const logFileModule = require('./writeToLogfile');

const writeOutputData = (outputFilePath, dataToWrite) => {
      const outputDataToJSON = JSON.stringify(dataToWrite, null, 2);
      fs.writeFile(outputFilePath, outputDataToJSON, 'utf8', (err) => {
        if (err) {
          const errorMessage = `Error writing to file: ${outputFilePath}\n${err}`;
          console.error(errorMessage);
          logFileModule.writeToLogfile(errorMessage);
          return;
        } else {
          const successMessage = `Data written to file: ${outputFilePath}`;
          console.log(successMessage);
          logFileModule.writeToLogfile(successMessage);
        }
      });
};

module.exports = { writeOutputData };