const cheerio = require('cheerio');
const winston = require('winston');
const fs = require('fs');
const _ = require('lodash');
const request = require('request');
winston.level = 'debug';

// 爬去的数据列表
let articles = [];

// 获取单页数据
getOnePageData = (keyword, page) => {
    return new Promise((resolve, reject) => {
        // const j = request.jar();
        // const cookie = request.cookie('IPLOC=CN3100; SUID=6256731B5118910A000000005A65AD6B; SUV=1516612972061329; ABTEST=8|1516612973|v1; SNUID=0E3A1F706B69083295E7D2EA6CBBE472; weixinIndexVisited=1; JSESSIONID=aaa7IRgtbwrH55uNT5Bew; clientId=24D1E7A084056785361CECDC85C5669C; ld=Zyllllllll2zBPsglllllVIu4lYlllllnAaH$lllllwlllllVklll5@@@@@@@@@@; ppinf=5|1516644216|1517853816|dHJ1c3Q6MToxfGNsaWVudGlkOjQ6MjAxN3x1bmlxbmFtZToyNzolRTUlQkUlOTAlRTclQjQlQUIlRTUlQkUlQUV8Y3J0OjEwOjE1MTY2NDQyMTZ8cmVmbmljazoyNzolRTUlQkUlOTAlRTclQjQlQUIlRTUlQkUlQUV8dXNlcmlkOjQ0Om85dDJsdVBROVprZFU3Z2lxb2oyTVZXNnJ1dzBAd2VpeGluLnNvaHUuY29tfA; pprdig=kgeGOhjwwmh5OcX4WP7TmpphP71FK7S3NOhIeOgivuUc7FCGLiN5-duKjIK6LqsJz6umkQjjFaf-WG6yu6IU31KCs-HumYRnJN5Vwx_8wZbcAUlGQTBmi1BcjZkVUyD0CkyRqP0lzLey0Fd90xKILOoaaNunrzJeDIXlX81WkB8; sgid=31-32334183-AVpmJ3hMVpiaGCUSxSsibyla4; ppmdig=1516644225000000acda23bd84a02da9ea52e6b73a245685; sct=11');
        const url = `http://weixin.sogou.com/weixin?query=${keyword}&_sug_type_=&s_from=input&_sug_=n&type=2&page=${page}&ie=utf8`;
        // j.setCookie(cookie, url);
        const config = {
            opts: {
                // jar: j,
                // URL of Scrapoxy
                proxy: 'http://ec2-34-243-245-61.eu-west-1.compute.amazonaws.com:8888',

                // HTTPS over HTTP
                tunnel: false,

                // 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36'
            },
        };
        const opts = _.merge({}, config.opts, { url });
        const datePattern = /[0-9]+/g;
        request(opts, (err, res, body) => {
            if (err) {
                return reject(err);
            }

            if (res.statusCode !== 200) {
                return reject(body);
            }

            let $ = cheerio.load(body, { decodeEntities: true });
            let newsList = $('.news-list').find('li');
            console.log('爬取第 ' + page + ' 页的文章数量是', newsList.length);
            newsList.map(function() {
                let account = $(this).find('.account').text();
                let date = String(new Date(Number($(this).find('.s2').html().match(datePattern)[0] + '000')));
                let title = $(this).find('h3 a').text();
                let link = $(this).find('h3 a').attr('data-share');
                console.log({ account, date, title, link });
                articles.push({ "account": account, "date": date, "title": title, "link": link });
                resolve();
            });
        })
    });
};

(async() => {
    const keyword = 'PS4';

    // 爬取PS4相关微信文章
    for (let page = 1; page <= 1000; page++) {
        await getOnePageData(keyword, page);
    }
    console.log(articles.length);
    fs.writeFile('result.json', JSON.stringify(articles), function(err) {
        if (!err) {
            console.log('数据写入成功！');
        } else {
            console.log("数据写入出错！");
        }
    });
})();