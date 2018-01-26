const _ = require('lodash'),
    Promise = require('bluebird'),
    cheerio = require('cheerio'),
    request = require('request'),
    winston = require('winston');

winston.level = 'debug';


const config = {
    // URL of the site
    source: 'http://scraping-challenge-2.herokuapp.com',

    opts: {
        // URL of Scrapoxy
        proxy: 'http://ec2-34-243-245-61.eu-west-1.compute.amazonaws.com:8888',

        // HTTPS over HTTP
        tunnel: false,
    },
};


// Get all URLs
getProfilesUrls(config.source, config.opts)
    .then((urls) => {
        winston.info('Found %d profiles', urls.length);

        winston.info('Wait 120 seconds to scale instances');

        return urls;
    })

// Wait 2 minutes to scale instances
.delay(2 * 60 * 1000)

.then((urls) => {

        // Get profiles one by one.
        return Promise.map(urls,
                (url) => getProfile(url, config.opts)
                .then((profile) => {
                    winston.debug('Found %s', profile.name);

                    return profile;
                })
                .catch(() => {
                    winston.debug('Cannot retrieve %s', url);
                }), { concurrency: 1 })
            .then((profiles) => {
                const results = _.compact(profiles);

                winston.info('Extract %d on %d profiles', results.length, urls.length);
            });
    })
    .catch((err) => winston.error('Error: ', err));


////////////

/**
 * Get all the urls of the profiles
 * @param url Main URL
 * @param defaultOpts options for http request
 * @returns {promise}
 */
function getProfilesUrls(url, defaultOpts) {
    return new Promise((resolve, reject) => {
        // Create options for the HTTP request
        // Add the URL to the default options
        const opts = _.merge({}, defaultOpts, { url });
        console.log(opts);
        request(opts, (err, res, body) => {
            if (err) {
                return reject(err);
            }

            if (res.statusCode !== 200) {
                return reject(body);
            }

            // Load content into a JQuery parser
            const $ = cheerio.load(body);

            // Extract all urls
            const urls = $('.profile a')
                .map((i, el) => $(el).attr('href'))
                .get()
                .map((url) => `${config.source}${url}`);

            resolve(urls);
        });
    });
}

/**
 * Get the profile and extract the name
 * @param url URL of the profile
 * @param defaultOpts options for http request
 * @returns {promise}
 */
function getProfile(url, defaultOpts) {
    return new Promise((resolve, reject) => {
        // Create options for the HTTP request
        // Add the URL to the default options
        const opts = _.merge({}, defaultOpts, { url });

        request(opts, (err, res, body) => {
            if (err) {
                return reject(err);
            }

            if (res.statusCode !== 200) {
                return reject(body);
            }

            // Load content into a JQuery parser
            const $ = cheerio.load(body);

            // Extract the names
            const name = $('.profile-info-name').text();

            resolve({ name });
        });
    });
}