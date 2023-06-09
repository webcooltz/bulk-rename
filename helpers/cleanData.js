// Cleans the data before it's put into the output file

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
    // console.log(scrapedData);
    let cleanedData = inputData;

    // removes "bad" characters
    for (const [badChar, goodChar] of Object.entries(characters)) {
        const regex = new RegExp(badChar, "g");
        cleanedData = cleanedData.replace(regex, goodChar);
    }

    // removes footnotes if footnotes are present
    cleanedData = cleanedData.replace(/\[([A-Z])\](.*?)\[[^\/\]]*\]/g, "");

    // removes new lines
    // cleanedData = cleanedData.replace(/\n/g, " ");

    // console.log("cleanedData: ", cleanedData);
    return cleanedData.trim();
}

module.exports = { cleanData };
