const fs = require('fs');

const logfilePath = "./results/logfile.txt";

const writeToLogfile = (dataToBeLogged) => {
      const outputData =  `${dataToBeLogged}\n`;
      fs.appendFile(logfilePath, outputData, 'utf8', (err) => {
        if (err) {
          console.error(`Error writing to logfile.\nPath: ${logfilePath}\nerror: ${err}`);
          return;
        } else {
          console.log(`Data written to logfile: ${logfilePath}`);
        }
      });
};

module.exports = { writeToLogfile };