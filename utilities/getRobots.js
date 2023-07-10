/* getRobots.js
//  -gets robots.txt file from a website
*/
// ---dependencies---
const axios = require('axios');
// ---headers---
// Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.93 Safari/537.36
// FireFox: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/114.0
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36';
const referer = 'https://www.google.com';
let requestOptions = {
    url: 'https://www.imdb.com',
    method: 'GET',
    headers: {
        'User-Agent': userAgent,
        'Referer': referer
    }
};

// main function
const getRobotsTxt = async (requestOptions) => {
  try {
    const response = await axios.get(`${requestOptions.url}/robots.txt`, requestOptions);
    const robotsTxt = response.data;
    console.log(robotsTxt);
  } catch (error) {
    console.error('Error retrieving robots.txt:', error);
  }
};

getRobotsTxt(requestOptions);
