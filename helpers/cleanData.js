// Cleans the data before it's put into the output file

// --- helpers ---
const logfileModule = require("./writeToLogfile.js");

const characters = {
    "–": "-", // en dash
    "…": "...", // ellipsis
    "—": "-", // em dash
    "&nbsp;": " ", // non-breaking space
    "&amp;": "&", // ampersand
    "“": '"', // left double quote
    "”": '"', // right double quote
    "‘": "'", // left single quote
    "’": "'", // right single quote
    " ": " ", // non-breaking space
    "Π": "pi" // pi
};

const cleanData = (inputData) => {
    if (!inputData) {
        // console.log("Failed to clean data. cleanData.js - cleanData() - inputData is null or undefined");
        logfileModule.writeToLogfile("Failed to clean data. cleanData.js - cleanData() - inputData is null or undefined");
        return inputData;
    } else {
        // console.log(inputData);
        let cleanedData = inputData;

        // removes "bad" characters
        for (const [badChar, goodChar] of Object.entries(characters)) {
            const regex = new RegExp(badChar, "g");
            cleanedData = cleanedData.replace(regex, goodChar);
        }

        // removes footnotes if footnotes are present
        cleanedData = cleanedData.replace(/\[([A-Z])\](.*?)\[[^\/\]]*\]/g, "");

        return cleanedData.trim();
    }
}

module.exports = { cleanData };
