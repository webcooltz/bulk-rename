const fs = require('fs');

const main = (outputFilePath, dataToWrite) => {
      const outputDataToJSON = JSON.stringify(dataToWrite, null, 2);
      fs.writeFile(outputFilePath, outputDataToJSON, 'utf8', (err) => {
        if (err) {
          console.error(`Error writing to file: ${outputFilePath}\n${err}`);
          return;
        } else {
          console.log(`Data written to file: ${outputFilePath}`);
        }
      });
};

module.exports = { main };