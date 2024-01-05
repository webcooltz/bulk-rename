# bulk-rename instructions

## Table of Contents

- [Input](#input)
- [Running the app](#running-the-app)

## Input

- Put your info into the `input.json` file in the 'input' folder
- Include quotes around the string you put in

`imdbId`:

- The show's IMDB title ID
- Found in the URL [imdb.com/title/tt0417299](https://www.imdb.com/title/tt0417299)
- Example: `"tt0417299"`

`fileDirectory`:

- The file directory where your videos are kept
- Example: `"D:/TV Shows/Person of Interest (2011)/season1/"`
- It should fix it automatically if the directory address is wrong, but try to put it in the format above

### File example

`{
    "imdbId": "tt0111161",
    "fileDirectory": "D:/TV Shows/Person of Interest (2011)/season1/"
}`

## New Input ?

- Scrape data manually using a Chrome extension
- Add episode data to /input/episodes.csv
- Add show data to /input/show-info.csv

## Running-the-app

- Open in VS Code or another IDE

### Download packages

- Run `npm i` to download the packages

### Scraping episode/show data

- Run `npm run scrape` to scrape IMDB and get the show's info saved
- Double-check the info is correct before proceeding

#### Pre-scraped data

- Run `npm run convert` to convert CSV to JSON

### Getting current video metadata

- Run `npm run start` to get the app's metadata
- It will compare the IMDB data and properly put together your show data
- Double-check the info is correct before proceeding

### Changing video file metadata

- Run `npm run change` to change your video metadata
- Double-check there are no errors
- Delete the old video files

#### If a video failed:

- Check the `results/failedVideos.json` file to see which videos failed
- You may have to manually fix these (using iTunes or another program)
