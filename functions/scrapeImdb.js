// ---Scrapes IMDB---
// gets imdb data - show > season > episode

// ---dependencies---
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
// ---helpers---
const { cleanupData } = require('../helpers/dataCleaner');
const { writeOutputData } = require('../helpers/outputData');
// ---filepaths---
const showMetaDataFile = "./results/showOutput.json";
// ---user input---
const userInput = JSON.parse(fs.readFileSync('./input.json', 'utf8'));
const imdbId = userInput.imdbId;
const numberOfSeasons = userInput.numberOfSeasons;
// ---output---
// let returnMessage;

const getScrapedData = async (imdbId, numberOfSeasons) => {
    try {
        // TODO - Make seasons a single number instead of an array
        const seasons = [];
        for (let i = 1; i <= numberOfSeasons; i++) {
            seasons.push(i);
        }

        const baseUrl = "https://www.imdb.com/title/";
        const showScrapeUrl = baseUrl + imdbId;  // e.g. - https://www.imdb.com/title/tt0417299/
        // const season1ScrapeUrl = baseUrl + showTitleId + "/episodes?season=1"; // e.g. - https://www.imdb.com/title/tt0417299/episodes?season=1
        
        const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36';
        const referer = 'https://www.google.com';
        const requestOptions = {
            url: showScrapeUrl,
            method: 'GET',
            headers: {
              'User-Agent': userAgent,
              'Referer': referer
            }
        };
        const baseSeasonUrl = "/episodes?season=";

        // ---------- SHOW META DATA ----------
        axios.get(requestOptions.url, requestOptions)
        .then(async response => {
            const $ = cheerio.load(response.data);

            const metaTitle = $("span.sc-afe43def-1").text();
            const metaImageUrl = $("img.ipc-img").attr("src");
            const scrapedDescription = $("span.sc-2eb29e65-2").text();
            // const episodeAmount = $("div[data-testid='hero-subnav-bar-left-block']").text();
            // console.log("episodeAmount: ", episodeAmount);
            const yearsRan = $(".sc-afe43def-4 li:nth-of-type(2) a").text();
            const showStart = cleanupData(yearsRan).split("-")[0];
            const showEnd = cleanupData(yearsRan).split("-")[1];
            const avgEpisodeLength = $(".ipc-inline-list--show-dividers li:nth-of-type(4)").text();
            const ageRating = $(".sc-afe43def-4 li:nth-of-type(3) a").text();

            const showMetaData = {
                title: cleanupData(metaTitle),
                description: cleanupData(scrapedDescription),
                // numberOfEpisodes: episodeAmount,
                artWorkUrl: metaImageUrl,
                showStart: showStart,
                showEnd: showEnd,
                avgEpisodeLength: avgEpisodeLength,
                ageRating: ageRating
            };

            // console.log("showMetaData: ", showMetaData);

            // Write showMetaData to file
            writeOutputData(showMetaDataFile, showMetaData);

            const scrapeEpisodeData = async (season) => {
                try {
                    const episodeScrapeUrl = baseUrl + imdbId + baseSeasonUrl + season;
                        // e.g. - https://www.imdb.com/title/tt0417299/episodes?season=1
                    const episodeResponse = await axios.get(episodeScrapeUrl, requestOptions);
                    const $ = cheerio.load(episodeResponse.data);

                    const episodeTitles = [];
                    const episodeDescriptions = [];
                    const episodeNumbersList = [];
                    const episodeDateList = [];

                    // TITLE
                    $("a[itemprop='name']").each((index, element) => {
                        const title = $(element).text();
                        episodeTitles.push(title);
                    });

                    // DESCRIPTION
                    $("div[itemprop='description']").each((index, element) => {
                        const description = $(element).text();
                        episodeDescriptions.push(description);
                    });

                    // EPISODE NUMBER
                    // case - episodeSeasonAndNumber: "S1, Ep1" -> ["S1", " Ep1"] -> "Ep1" -> ["1"] -> "1"
                    $(".hover-over-image div").each((index, element) => {
                        const number = $(element).text();
                        const episodeNumber = parseInt(number.split(",")[1].trim().split("Ep")[1]);
                        episodeNumbersList.push(episodeNumber);
                    });

                    // const episodeImageUrl = $("div.list_item:nth-of-type(n+2) img").attr("src");
    
                    // DATE
                    // case - date: "21 Feb 2005"
                    $("div.airdate").each((index, element) => {
                        const date = $(element).text();
                        const cleanDate = date.trim();

                        // if month has a period, remove it (e.g. - "Feb." -> "Feb"
                        let episodeDateMonth;
                        if (cleanDate.split(" ")[1].includes(".")) {
                            episodeDateMonth = cleanDate.split(" ")[1].split(".")[0];
                        } else {
                            episodeDateMonth = cleanDate.split(" ")[1];
                        } 

                        const episodeDateDay = cleanDate.split(" ")[0];
                        const episodeDateMonthNumber = new Date(Date.parse(episodeDateMonth + " 1, 2021")).getMonth() + 1;
                        const episodeDateYear = cleanDate.split(" ")[2];
                        const episodeDateFormatted = episodeDateMonthNumber.toString() + "-" + episodeDateDay + "-" + episodeDateYear;
                        episodeDateList.push(episodeDateFormatted);
                    });

                    // SEASON
                    // const seasonMetaData = {
                    //     seasonNumber: season,
                    //     episodeAmount: episodeNumbersList.length,
                    //     episodeTitles: episodeTitles,
                    //     episodeDescriptions: episodeDescriptions,
                    //     episodeNumbers: episodeNumbersList,
                    //     episodeDates: episodeDateList,
                    //     episodes: []
                    // };

                    // EPISODES
                    const seasonEpisodes = episodeTitles.map((_, index) => {
                        return {
                            seasonNumber: season,
                            episodeNumber: episodeNumbersList[index],
                            title: cleanupData(episodeTitles[index]),
                            description: cleanupData(episodeDescriptions[index]),
                            airDate: episodeDateList[index]
                        };
                    });

                    return seasonEpisodes;
                } catch (error) {
                    throw new Error('Error occurred during scraping.');
                }
            };

            if (showMetaData) {
                // returnMessage = "Show information scraped.";

                const writeToFile = (episodeArray) => {
                    return new Promise((resolve, reject) => {
                        const episodesData = JSON.stringify(episodeArray, null, 2);
                        const episodesFile = "./results/episodesOutput.json";
                        // fs.writeFileSync(episodesFile, episodesData);
                        fs.writeFileSync(episodesFile, episodesData, 'utf8', (error) => {
                            if (error) {
                                reject(error);
                            } else {
                                console.log(`episodesData written to ${episodesFile}`);
                                resolve();
                            }
                        });
                    });
                };

                (async () => {
                    try {
                        const scrapingPromises = seasons.map(async (seasonNumber) => {
                            const episodes = await scrapeEpisodeData(seasonNumber);
                            // console.log("episodes: ", episodes);
                            return episodes;
                        });
                  
                        const allEpisodes = await Promise.all(scrapingPromises);
                  
                        await writeToFile(allEpisodes);
                        console.log('allEpisodes written to file successfully.');
                    } catch (error) {
                        console.error('Error occurred during scraping or writing to file:', error);
                    }
                })();
            } else {
                console.log("showmetadata invalid error");
            }
        })
        .catch(error => {
            console.error("showMetaData scrape error: ", error);
        });
    } catch (error) {
        console.error("general error (scrape): ", error);
    }
}

module.exports = getScrapedData(imdbId, numberOfSeasons);

// todo
// - add error handling
// - test with new changes