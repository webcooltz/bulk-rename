// Cleans the data before it's put into the output file

const characters = {
    "–": "-",
    "’": "'",
    "…": "...",
    "—": "-",
    "&nbsp;": " ",
    "&amp;": "&",
    "“": '"',
    "”": '"',
    "‘": "'",
    "’": "'",
    " ": " "
};

const cleanScrapedData = (scrapedData) => {
    // console.log(scrapedData);
    let cleanData = scrapedData;

    // removes "bad" characters
    for (const [badChar, goodChar] of Object.entries(characters)) {
        const regex = new RegExp(badChar, "g");
        cleanData = cleanData.replace(regex, goodChar);
    }

    // removes footnotes
    const cleanedText = cleanData.replace(/\[([A-Z])\](.*?)\[[^\/\]]*\]/g, "");

    // removes new lines
    // const cleanedText2 = cleanedText.replace(/\n/g, " ");

    // console.log("cleanedText: ", cleanedText);
    return cleanedText.trim();
}

module.exports = cleanScrapedData;
